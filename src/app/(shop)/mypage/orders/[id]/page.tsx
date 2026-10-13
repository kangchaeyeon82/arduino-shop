import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetail from "@/components/OrderDetail";

export default async function OrderDetailPage({ params }: PageProps<"/mypage/orders/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS 덕분에 본인 주문만 조회된다
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();

  return (
    <div className="container-page max-w-3xl py-8">
      <Link href="/mypage" className="text-sm text-gray-500 hover:underline">← 주문 내역</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">주문 상세</h1>
      <OrderDetail order={order} />
    </div>
  );
}
