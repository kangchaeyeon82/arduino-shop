import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, price, stock, image, is_active, categories(name)")
    .order("category_id")
    .order("id");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">상품 관리 ({products?.length ?? 0})</h2>
        <Link href="/admin/products/new" className="btn-primary">+ 상품 등록</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 text-right font-medium">가격</th>
              <th className="px-4 py-3 text-right font-medium">재고</th>
              <th className="px-4 py-3 text-center font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:underline">
                    <span className="relative h-10 w-10 shrink-0 rounded border border-gray-100 bg-white">
                      {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-contain p-0.5" />}
                    </span>
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{p.categories?.name}</td>
                <td className="px-4 py-2 text-right">{formatPrice(p.price)}</td>
                <td className={`px-4 py-2 text-right ${p.stock === 0 ? "font-bold text-red-600" : p.stock < 30 ? "text-amber-600" : ""}`}>{p.stock}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.is_active ? "판매중" : "숨김"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
