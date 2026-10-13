import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABEL } from "@/lib/utils";
import { Constants } from "@/types/database.types";
import OrderDetail from "@/components/OrderDetail";
import { updateOrder } from "../../actions";

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:underline">← 주문 목록</Link>
        <div className="mt-2"><OrderDetail order={order} /></div>
      </div>
      <form action={updateOrder} className="card h-fit space-y-3 p-5 lg:mt-7">
        <h2 className="font-bold">배송 처리</h2>
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label className="label" htmlFor="status">주문 상태</label>
          <select id="status" name="status" defaultValue={order.status} className="input">
            {Constants.public.Enums.order_status.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tracking_no">송장번호</label>
          <input id="tracking_no" name="tracking_no" defaultValue={order.tracking_no ?? ""} className="input" placeholder="CJ대한통운 1234-5678-9012" />
        </div>
        <button className="btn-primary w-full">저장</button>
        <p className="text-xs text-gray-400">※ 학습용: 상태를 &apos;취소&apos;로 바꿔도 토스 결제 취소·재고 복구는 하지 않습니다.</p>
      </form>
    </div>
  );
}
