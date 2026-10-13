import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HERO_IMAGES } from "@/lib/credits";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: boards }, { data: sensors }, { data: kit }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("products")
      .select("id, slug, name, price, image, stock, categories!inner(name, slug)")
      .eq("categories.slug", "boards")
      .order("price")
      .limit(4),
    supabase
      .from("products")
      .select("id, slug, name, price, image, stock, categories!inner(name, slug)")
      .eq("categories.slug", "sensors")
      .order("id")
      .limit(4),
    supabase.from("products").select("slug, name, price, image, description").eq("slug", "starter-kit").maybeSingle(),
  ]);
  const hero = HERO_IMAGES[0];

  return (
    <>
      {/* 메인 배너 */}
      <section className="relative h-[420px] overflow-hidden bg-gray-900 md:h-[480px]">
        <Image src={hero.image} alt="아두이노 우노와 브레드보드" fill priority sizes="100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-transparent" />
        <div className="container-page relative flex h-full flex-col justify-center text-white">
          <p className="mb-3 text-sm font-medium tracking-wide text-brand-100">MAKER&apos;S FIRST STEP</p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">
            상상한 것을
            <br />
            직접 만들어 보세요
          </h1>
          <p className="mt-4 max-w-md text-gray-200">
            아두이노 정품 보드부터 센서, 모터, 디스플레이까지. 첫 프로젝트에 필요한 모든 부품을 한 곳에서.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-primary px-6 py-3">전체 상품 보기</Link>
            <Link href="/products?category=kits" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              입문 키트
            </Link>
          </div>
        </div>
        <p className="absolute bottom-2 right-3 text-[10px] text-white/50">
          Photo: {hero.credit.author} / {hero.credit.license}
        </p>
      </section>

      {/* 카테고리 */}
      <section className="container-page py-12">
        <h2 className="mb-5 text-xl font-bold">카테고리</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories?.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-900"
            >
              {c.image && (
                <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-cover opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-3 left-3 font-bold text-white">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 보드 */}
      <ProductSection title="아두이노 보드" href="/products?category=boards" products={boards ?? []} />

      {/* 키트 배너 */}
      {kit && (
        <section className="container-page py-6">
          <div className="grid items-center gap-6 overflow-hidden rounded-2xl bg-brand-900 text-white md:grid-cols-2">
            <div className="p-8 md:p-10">
              <p className="mb-2 text-sm font-medium text-brand-100">처음이라면 이것부터</p>
              <h2 className="text-2xl font-bold">{kit.name}</h2>
              <p className="mt-3 text-sm text-gray-300">{kit.description}</p>
              <p className="mt-5 text-2xl font-bold">{formatPrice(kit.price)}</p>
              <Link href={`/products/${kit.slug}`} className="btn mt-5 bg-white text-brand-900 hover:bg-brand-50">
                자세히 보기
              </Link>
            </div>
            <div className="relative h-64 md:h-full md:min-h-72">
              {kit.image && <Image src={kit.image} alt={kit.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />}
            </div>
          </div>
        </section>
      )}

      {/* 센서 */}
      <ProductSection title="인기 센서" href="/products?category=sensors" products={sensors ?? []} />

      {/* 혜택 */}
      <section className="container-page py-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["무료배송", "50,000원 이상 구매 시"],
            ["정품 보드", "아두이노 공식 정품 취급"],
            ["호환 부품 추천", "상품마다 함께 쓰면 좋은 부품 안내"],
          ].map(([t, d]) => (
            <div key={t} className="card p-5">
              <p className="font-bold text-brand-700">{t}</p>
              <p className="mt-1 text-sm text-gray-500">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ProductSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: { id: number; slug: string; name: string; price: number; image: string | null; stock: number; categories: { name: string } | null }[];
}) {
  return (
    <section className="container-page py-8">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={href} className="text-sm text-gray-500 hover:text-gray-900">더보기 →</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
