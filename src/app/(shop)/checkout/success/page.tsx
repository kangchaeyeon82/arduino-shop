import Link from "next/link";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import ReloadCart from "./ReloadCart";

// 토스 결제창에서 결제 인증이 끝나면 ?paymentKey=&orderId=&amount= 로 이동해 온다.
// 여기서 Edge Function(confirm-payment)을 호출해 실제 결제를 승인한다.
export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const paymentKey = String(sp.paymentKey ?? "");
  const orderId = String(sp.orderId ?? "");
  const amount = Number(sp.amount);

  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke<{ ok: boolean; order_id: string }>("confirm-payment", {
    body: { paymentKey, orderId, amount },
  });

  let message: string | null = null;
  if (error) {
    message = "결제 승인에 실패했습니다.";
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error) message = body.error;
    }
  }

  if (message || !data?.ok) {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <div className="card p-8">
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-4 text-xl font-bold">결제를 완료하지 못했습니다</h1>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <Link href="/cart" className="btn-primary mt-6">장바구니로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-lg py-16 text-center">
      <ReloadCart />
      <div className="card p-8">
        <p className="text-4xl">🎉</p>
        <h1 className="mt-4 text-xl font-bold">주문이 완료되었습니다</h1>
        <p className="mt-2 text-sm text-gray-600">주문번호 {orderId}</p>
        <p className="mt-1 text-lg font-bold text-brand-700">{formatPrice(amount)}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href={`/mypage/orders/${data.order_id}`} className="btn-primary">주문 상세 보기</Link>
          <Link href="/products" className="btn-outline">쇼핑 계속하기</Link>
        </div>
      </div>
    </div>
  );
}
