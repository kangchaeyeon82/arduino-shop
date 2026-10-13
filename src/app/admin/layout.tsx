import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

// 관리자만 접근 가능 (화면 보호). 실제 데이터 보호는 DB의 RLS 정책이 담당한다.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!profile?.is_admin) notFound();

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        <h1 className="mr-4 text-xl font-bold">관리자</h1>
        {[
          ["/admin", "대시보드"],
          ["/admin/products", "상품 관리"],
          ["/admin/orders", "주문 관리"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            {label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
