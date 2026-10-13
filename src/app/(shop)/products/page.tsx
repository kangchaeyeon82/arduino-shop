import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "상품 목록" };

const SORTS = {
  new: { label: "기본순", column: "id", ascending: true },
  "price-asc": { label: "낮은 가격순", column: "price", ascending: true },
  "price-desc": { label: "높은 가격순", column: "price", ascending: false },
  name: { label: "이름순", column: "name", ascending: true },
} as const;
type SortKey = keyof typeof SORTS;

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sortKey: SortKey = typeof sp.sort === "string" && sp.sort in SORTS ? (sp.sort as SortKey) : "new";
  const inStock = sp.stock === "1";
  const sort = SORTS[sortKey];

  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, slug, name").order("sort_order");
  const current = categories?.find((c) => c.slug === category);

  let query = supabase.from("products").select("id, slug, name, price, image, stock, categories(name)");
  if (current) query = query.eq("category_id", current.id);
  if (q) {
    // PostgREST 필터 문법 문자를 제거해 검색어가 쿼리를 깨뜨리지 않게 한다
    const safe = q.replace(/[%,()*\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (inStock) query = query.gt("stock", 0);
  const { data: products } = await query.order(sort.column, { ascending: sort.ascending });

  const makeHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category, q: q || undefined, sort: sortKey === "new" ? undefined : sortKey, stock: inStock ? "1" : undefined, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const s = params.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{q ? `“${q}” 검색 결과` : current?.name ?? "전체 상품"}</h1>
        <p className="mt-1 text-sm text-gray-500">{products?.length ?? 0}개 상품</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* 필터 */}
        <aside className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-bold">카테고리</p>
            <ul className="flex flex-wrap gap-1 md:flex-col">
              <li>
                <Link href={makeHref({ category: undefined })} className={`block rounded-md px-3 py-1.5 text-sm ${!current ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-100"}`}>
                  전체
                </Link>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <Link href={makeHref({ category: c.slug })} className={`block rounded-md px-3 py-1.5 text-sm ${current?.id === c.id ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-100"}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">재고</p>
            <Link href={makeHref({ stock: inStock ? undefined : "1" })} className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`grid h-4 w-4 place-items-center rounded border ${inStock ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 bg-white"}`}>
                {inStock && "✓"}
              </span>
              품절 상품 제외
            </Link>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap gap-1 text-sm">
            {(Object.keys(SORTS) as SortKey[]).map((k) => (
              <Link key={k} href={makeHref({ sort: k === "new" ? undefined : k })} className={`rounded-full px-3 py-1 ${sortKey === k ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}>
                {SORTS[k].label}
              </Link>
            ))}
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="card py-20 text-center text-gray-500">
              조건에 맞는 상품이 없습니다.
              <div className="mt-4">
                <Link href="/products" className="btn-outline">전체 상품 보기</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
