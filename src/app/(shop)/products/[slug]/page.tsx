import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { asCredit, asSpecs, formatDate, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import AddToCartButton from "@/components/product/AddToCartButton";
import ImageCredit from "@/components/product/ImageCredit";
import ProductCard from "@/components/product/ProductCard";
import ReviewForm from "./ReviewForm";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name, description").eq("slug", slug).maybeSingle();
  return data ? { title: data.name, description: data.description ?? undefined } : {};
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (!product) notFound();

  const [{ data: relations }, { data: reviews }, { data: { user } }] = await Promise.all([
    supabase
      .from("product_relations")
      .select("products!product_relations_related_id_fkey(id, slug, name, price, image, stock, categories(name))")
      .eq("product_id", product.id),
    supabase.from("reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const related = (relations ?? []).map((r) => r.products).filter((p) => p !== null);
  const specs = asSpecs(product.specs);
  const soldOut = product.stock <= 0;
  const avg = reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const myReview = user ? reviews?.find((r) => r.user_id === user.id) : undefined;

  return (
    <div className="container-page py-8">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/products" className="hover:underline">전체상품</Link>
        {product.categories && (
          <>
            {" › "}
            <Link href={`/products?category=${product.categories.slug}`} className="hover:underline">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="card relative aspect-square overflow-hidden">
            {product.image && (
              <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" />
            )}
          </div>
          <div className="mt-2">
            <ImageCredit credit={asCredit(product.image_credit)} />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
          {avg !== null && (
            <p className="mt-2 text-sm text-gray-500">
              <span className="text-amber-500">{"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}</span> {avg.toFixed(1)} ({reviews!.length}개 리뷰)
            </p>
          )}
          <p className="mt-4 text-3xl font-bold">{formatPrice(product.price)}</p>

          <dl className="mt-6 space-y-2 border-y border-gray-200 py-4 text-sm">
            <div className="flex gap-4">
              <dt className="w-16 text-gray-500">배송비</dt>
              <dd>3,000원 ({formatPrice(FREE_SHIPPING_THRESHOLD)} 이상 무료)</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-16 text-gray-500">재고</dt>
              <dd className={soldOut ? "font-medium text-red-600" : product.stock < 30 ? "font-medium text-amber-600" : ""}>
                {soldOut ? "품절" : product.stock < 30 ? `${product.stock}개 남음` : "재고 있음"}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <AddToCartButton productId={product.id} disabled={soldOut} maxQuantity={product.stock} />
          </div>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 font-bold">주요 사양</h2>
              <table className="w-full overflow-hidden rounded-lg text-sm ring-1 ring-gray-200">
                <tbody>
                  {specs.map(([k, v]) => (
                    <tr key={k} className="border-b border-gray-100 last:border-0">
                      <th className="w-1/3 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600">{k}</th>
                      <td className="bg-white px-3 py-2">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold">상품 설명</h2>
        <div className="card p-6 leading-relaxed text-gray-700">{product.description}</div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-1 text-lg font-bold">함께 쓰면 좋은 부품</h2>
          <p className="mb-4 text-sm text-gray-500">이 상품과 호환되거나 같이 많이 사용하는 부품이에요.</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold">리뷰 {reviews?.length ? `(${reviews.length})` : ""}</h2>
        {user ? (
          !myReview && <ReviewForm productId={product.id} slug={product.slug} />
        ) : (
          <p className="card mb-4 p-4 text-sm text-gray-500">
            <Link href={`/login?next=/products/${product.slug}`} className="text-brand-600 underline">로그인</Link> 후 리뷰를 작성할 수 있습니다.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {reviews?.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-500">{"★".repeat(r.rating)}<span className="text-gray-300">{"★".repeat(5 - r.rating)}</span></span>
                <span className="text-gray-400">{r.author_name} · {formatDate(r.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{r.content}</p>
            </li>
          ))}
          {reviews?.length === 0 && <li className="text-sm text-gray-400">아직 리뷰가 없습니다.</li>}
        </ul>
      </section>
    </div>
  );
}
