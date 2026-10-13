// 토스페이먼츠 결제 승인 Edge Function
// 1) 로그인 사용자 확인 → 2) 주문 금액 검증 → 3) 토스 승인 API 호출 → 4) 주문 완료 처리(재고 차감)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// 학습용: 토스 공식 문서의 공개 테스트 시크릿 키를 기본값으로 사용 (실 서비스는 반드시 secret으로 설정)
const TOSS_SECRET_KEY = Deno.env.get("TOSS_SECRET_KEY") ?? "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const TOSS_AUTH = "Basic " + btoa(TOSS_SECRET_KEY + ":");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "로그인이 필요합니다." }, 401);

  const { paymentKey, orderId, amount } = await req.json().catch(() => ({}));
  if (!paymentKey || !orderId || typeof amount !== "number") {
    return json({ error: "잘못된 요청입니다." }, 400);
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, total, payment_key")
    .eq("order_no", orderId)
    .maybeSingle();

  if (!order || order.user_id !== user.id) return json({ error: "주문을 찾을 수 없습니다." }, 404);
  if (order.status !== "pending") {
    // 새로고침 등으로 다시 호출된 경우
    if (order.payment_key === paymentKey) return json({ ok: true, order_id: order.id });
    return json({ error: "이미 처리된 주문입니다." }, 409);
  }
  if (order.total !== amount) return json({ error: "결제 금액이 주문 금액과 다릅니다." }, 400);

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: TOSS_AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const payment = await tossRes.json();
  if (!tossRes.ok) {
    return json({ error: payment.message ?? "결제 승인에 실패했습니다.", code: payment.code }, 400);
  }

  const { error } = await admin.rpc("complete_order_payment", {
    p_order_no: orderId,
    p_payment_key: paymentKey,
    p_method: payment.method ?? null,
  });

  if (error) {
    // 재고 부족 등으로 주문 처리 실패 → 결제 취소
    await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
      method: "POST",
      headers: { Authorization: TOSS_AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ cancelReason: "주문 처리 실패: " + error.message }),
    });
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return json({ error: error.message + " (결제가 자동 취소되었습니다)" }, 409);
  }

  return json({ ok: true, order_id: order.id });
});
