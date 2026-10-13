import type { Tables } from "@/types/database.types";
import { formatDate, formatPrice, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/utils";

type Order = Tables<"orders"> & { order_items: Tables<"order_items">[] };

// 마이페이지와 관리자 페이지에서 함께 쓰는 주문 상세
export default function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="space-y-4">
      <section className="card flex flex-wrap items-center justify-between gap-2 p-5">
        <div>
          <p className="text-sm text-gray-500">주문번호 {order.order_no}</p>
          <p className="text-sm text-gray-500">주문일시 {formatDate(order.created_at)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_STYLE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-bold">주문 상품</h2>
        <ul className="divide-y divide-gray-100 text-sm">
          {order.order_items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span>{i.name} × {i.quantity}</span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">상품 금액</span><span>{formatPrice(order.items_total)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">배송비</span><span>{order.shipping_fee === 0 ? "무료" : formatPrice(order.shipping_fee)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>총 결제 금액</span><span className="text-brand-700">{formatPrice(order.total)}</span></div>
          {order.payment_method && <p className="text-right text-xs text-gray-400">결제수단: {order.payment_method}</p>}
        </div>
      </section>

      <section className="card p-5 text-sm">
        <h2 className="mb-3 font-bold">배송 정보</h2>
        <dl className="grid grid-cols-[80px_1fr] gap-y-1.5">
          <dt className="text-gray-500">받는 분</dt><dd>{order.recipient}</dd>
          <dt className="text-gray-500">연락처</dt><dd>{order.phone}</dd>
          <dt className="text-gray-500">주소</dt><dd>{order.zipcode && `(${order.zipcode}) `}{order.address}</dd>
          {order.memo && (<><dt className="text-gray-500">메모</dt><dd>{order.memo}</dd></>)}
          {order.tracking_no && (<><dt className="text-gray-500">송장번호</dt><dd className="font-medium">{order.tracking_no}</dd></>)}
        </dl>
      </section>
    </div>
  );
}
