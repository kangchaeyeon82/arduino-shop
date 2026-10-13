"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, shippingFee } from "@/lib/utils";

type Props = { userId: string; email: string; defaultName: string; defaultPhone: string };

// 다음(카카오) 우편번호 서비스 - 키 없이 무료로 사용 가능
type DaumPostcodeData = { zonecode: string; roadAddress: string; jibunAddress: string };
declare global {
  interface Window {
    daum?: { Postcode: new (opts: { oncomplete: (d: DaumPostcodeData) => void }) => { open: () => void } };
  }
}

function loadPostcodeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const s = document.createElement("script");
    s.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("우편번호 서비스를 불러오지 못했습니다."));
    document.head.appendChild(s);
  });
}

export default function CheckoutForm({ userId, email, defaultName, defaultPhone }: Props) {
  const { lines, products, ready } = useCart();
  const rows = useMemo(
    () => lines.map((l) => ({ ...l, product: products[l.product_id] })).filter((r) => r.product),
    [lines, products],
  );
  const itemsTotal = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);
  const fee = shippingFee(itemsTotal);
  const total = itemsTotal + fee;

  const [form, setForm] = useState({ recipient: defaultName, phone: defaultPhone, zipcode: "", address: "", detail: "", memo: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const initRef = useRef(false);

  // 토스 결제위젯 초기화 (한 번만)
  useEffect(() => {
    if (!ready || total === 0 || initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        const widgets = toss.widgets({ customerKey: userId });
        await widgets.setAmount({ currency: "KRW", value: total });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        widgetsRef.current = widgets;
        setWidgetReady(true);
      } catch (e) {
        setError("결제 위젯을 불러오지 못했습니다: " + (e as Error).message);
      }
    })();
  }, [ready, total, userId]);

  // 장바구니 금액이 바뀌면 위젯 금액도 갱신
  useEffect(() => {
    if (widgetReady && total > 0) widgetsRef.current?.setAmount({ currency: "KRW", value: total });
  }, [widgetReady, total]);

  async function searchAddress() {
    try {
      await loadPostcodeScript();
      new window.daum!.Postcode({
        oncomplete: (d) => setForm((f) => ({ ...f, zipcode: d.zonecode, address: d.roadAddress || d.jibunAddress })),
      }).open();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!widgetsRef.current) return setError("결제 위젯이 아직 준비되지 않았습니다.");
    if (!form.address) return setError("주소를 입력해 주세요.");

    setSubmitting(true);
    try {
      // 1) 주문 생성: 가격/배송비는 DB 함수가 직접 계산 (클라이언트 금액을 믿지 않음)
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("create_order", {
        p_items: rows.map((r) => ({ product_id: r.product_id, quantity: r.quantity })),
        p_recipient: form.recipient,
        p_phone: form.phone,
        p_zipcode: form.zipcode,
        p_address: [form.address, form.detail].filter(Boolean).join(" "),
        p_memo: form.memo,
      });
      if (rpcError || !data?.[0]) throw new Error(rpcError?.message ?? "주문 생성에 실패했습니다.");
      const order = data[0];

      // 2) 결제 요청 → 성공 시 /checkout/success 로 이동, 그곳에서 결제 승인
      await widgetsRef.current.setAmount({ currency: "KRW", value: order.total });
      await widgetsRef.current.requestPayment({
        orderId: order.order_no,
        orderName: order.order_name,
        customerEmail: email,
        customerName: form.recipient,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e) {
      const err = e as { code?: string; message: string };
      if (err.code !== "USER_CANCEL") setError(err.message);
      setSubmitting(false);
    }
  }

  if (!ready) return <p className="py-20 text-center text-gray-400">불러오는 중…</p>;
  if (rows.length === 0) {
    return (
      <div className="card py-20 text-center">
        <p className="text-gray-500">주문할 상품이 없습니다.</p>
        <Link href="/products" className="btn-primary mt-5">쇼핑하러 가기</Link>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">배송 정보</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="recipient">받는 분</label>
              <input id="recipient" required className="input" value={form.recipient} onChange={set("recipient")} />
            </div>
            <div>
              <label className="label" htmlFor="phone">연락처</label>
              <input id="phone" required className="input" placeholder="010-0000-0000" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">주소</label>
              <div className="flex gap-2">
                <input className="input w-32" placeholder="우편번호" value={form.zipcode} readOnly />
                <button type="button" onClick={searchAddress} className="btn-outline whitespace-nowrap">주소 검색</button>
              </div>
              <input id="address" required className="input mt-2" placeholder="기본 주소" value={form.address} onChange={set("address")} />
              <input className="input mt-2" placeholder="상세 주소" value={form.detail} onChange={set("detail")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="memo">배송 메모</label>
              <input id="memo" className="input" placeholder="예) 문 앞에 놓아주세요" value={form.memo} onChange={set("memo")} />
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <h2 className="px-5 pt-5 font-bold">결제 수단</h2>
          <p className="px-5 pt-1 text-xs text-gray-500">테스트 모드입니다. 실제로 결제되지 않습니다.</p>
          <div id="payment-method" />
          <div id="agreement" />
        </section>
      </div>

      <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-32">
        <h2 className="font-bold">주문 상품 ({rows.length})</h2>
        <ul className="max-h-64 space-y-3 overflow-y-auto">
          {rows.map(({ product: p, quantity }) => (
            <li key={p.id} className="flex items-center gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 rounded border border-gray-100 bg-white">
                {p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-contain p-0.5" />}
              </div>
              <span className="line-clamp-2 flex-1">{p.name} × {quantity}</span>
              <span className="whitespace-nowrap">{formatPrice(p.price * quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-gray-200 pt-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">상품 금액</span><span>{formatPrice(itemsTotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">배송비</span><span>{fee === 0 ? "무료" : formatPrice(fee)}</span></div>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
          <span>총 결제 금액</span>
          <span className="text-brand-700">{formatPrice(total)}</span>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={!widgetReady || submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? "결제 진행 중…" : `${formatPrice(total)} 결제하기`}
        </button>
      </aside>
    </form>
  );
}
