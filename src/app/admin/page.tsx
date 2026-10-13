import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: orders }, { data: lowStock }, { count: productCount }] = await Promise.all([
    supabase.from("orders").select("id, order_no, order_name, total, status, created_at").neq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, stock").lt("stock", 30).order("stock").limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const paid = (orders ?? []).filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const toShip = (orders ?? []).filter((o) => o.status === "paid").length;

  const stats = [
    ["총 매출", formatPrice(revenue)],
    ["주문 수", `${paid.length}건`],
    ["배송 대기", `${toShip}건`],
    ["등록 상품", `${productCount ?? 0}개`],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="card p-5">
          <div className="mb-3 flex justify-between">
            <h2 className="font-bold">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-gray-500 hover:underline">전체 보기</Link>
          </div>
          <ul className="divide-y divide-gray-100 text-sm">
            {(orders ?? []).slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2">
                <span className="w-32 text-xs text-gray-400">{formatDate(o.created_at)}</span>
                <Link href={`/admin/orders/${o.id}`} className="flex-1 truncate hover:underline">{o.order_name}</Link>
                <span>{formatPrice(o.total)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${ORDER_STATUS_STYLE[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
              </li>
            ))}
            {orders?.length === 0 && <li className="py-6 text-center text-gray-400">아직 주문이 없습니다.</li>}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold">재고 부족 (30개 미만)</h2>
          <ul className="space-y-2 text-sm">
            {lowStock?.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <Link href={`/admin/products/${p.id}`} className="truncate hover:underline">{p.name}</Link>
                <span className={p.stock === 0 ? "font-bold text-red-600" : "text-amber-600"}>{p.stock}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
