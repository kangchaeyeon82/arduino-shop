import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/utils";
import { Constants, type Enums } from "@/types/database.types";

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = Constants.public.Enums.order_status.find((s) => s === sp.status) as Enums<"order_status"> | undefined;

  const supabase = await createClient();
  let query = supabase.from("orders").select("id, order_no, order_name, recipient, total, status, created_at, tracking_no");
  query = status ? query.eq("status", status) : query.neq("status", "pending");
  const { data: orders } = await query.order("created_at", { ascending: false });

  const tabs: [string, string][] = [["", "전체"], ...(["paid", "shipping", "delivered", "cancelled"] as const).map((s) => [s, ORDER_STATUS_LABEL[s]] as [string, string])];

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">주문 관리</h2>
      <div className="mb-4 flex flex-wrap gap-1 text-sm">
        {tabs.map(([s, label]) => (
          <Link key={s} href={s ? `/admin/orders?status=${s}` : "/admin/orders"} className={`rounded-full px-3 py-1 ${(status ?? "") === s ? "bg-gray-900 text-white" : "bg-white ring-1 ring-gray-200 hover:bg-gray-50"}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">주문일시</th>
              <th className="px-4 py-3 font-medium">주문</th>
              <th className="px-4 py-3 font-medium">받는 분</th>
              <th className="px-4 py-3 text-right font-medium">금액</th>
              <th className="px-4 py-3 text-center font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders?.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.order_name}</Link>
                  <p className="text-xs text-gray-400">{o.order_no}</p>
                </td>
                <td className="px-4 py-3">{o.recipient}</td>
                <td className="px-4 py-3 text-right">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ORDER_STATUS_STYLE[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">주문이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
