import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatDate, formatPrice, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/utils";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  // 결제 대기(미결제) 주문은 목록에서 숨긴다
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_no, order_name, total, status, created_at")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">마이페이지</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 font-bold">주문 내역</h2>
          {orders && orders.length > 0 ? (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/mypage/orders/${o.id}`} className="card flex items-center gap-4 p-4 transition hover:shadow-md">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{formatDate(o.created_at)} · {o.order_no}</p>
                      <p className="mt-1 font-medium">{o.order_name}</p>
                      <p className="mt-1 text-sm font-bold">{formatPrice(o.total)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_STYLE[o.status]}`}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="card py-16 text-center text-gray-500">
              주문 내역이 없습니다.
              <div className="mt-4"><Link href="/products" className="btn-primary">쇼핑하러 가기</Link></div>
            </div>
          )}
        </section>

        <aside className="card h-fit p-5">
          <h2 className="mb-1 font-bold">회원 정보</h2>
          <p className="mb-4 text-sm text-gray-500">{user.email}</p>
          <ProfileForm name={profile?.name ?? ""} phone={profile?.phone ?? ""} />
        </aside>
      </div>
    </div>
  );
}
