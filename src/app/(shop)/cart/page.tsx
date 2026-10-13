"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, FREE_SHIPPING_THRESHOLD, shippingFee } from "@/lib/utils";

export default function CartPage() {
  const { lines, products, ready, loggedIn, setQuantity, remove } = useCart();

  if (!ready) return <div className="container-page py-20 text-center text-gray-400">불러오는 중…</div>;

  const rows = lines.map((l) => ({ ...l, product: products[l.product_id] })).filter((r) => r.product);
  const itemsTotal = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);
  const fee = shippingFee(itemsTotal);
  const overStock = rows.some((r) => r.quantity > r.product.stock);

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">장바구니</h1>

      {rows.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-gray-500">장바구니가 비어 있습니다.</p>
          <Link href="/products" className="btn-primary mt-5">쇼핑하러 가기</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="card divide-y divide-gray-100">
            {rows.map(({ product: p, quantity }) => (
              <li key={p.id} className="flex gap-4 p-4">
                <Link href={`/products/${p.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
                  {p.image && <Image src={p.image} alt={p.name} fill sizes="80px" className="object-contain p-1" />}
                </Link>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Link href={`/products/${p.slug}`} className="text-sm font-medium hover:underline">{p.name}</Link>
                    <p className="text-sm text-gray-500">{formatPrice(p.price)}</p>
                    {quantity > p.stock && (
                      <p className="text-xs text-red-600">{p.stock === 0 ? "품절된 상품입니다." : `재고가 ${p.stock}개 남았습니다.`}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button className="px-2.5 py-1" onClick={() => setQuantity(p.id, quantity - 1)} disabled={quantity <= 1} aria-label="수량 감소">−</button>
                      <span className="w-8 text-center text-sm">{quantity}</span>
                      <button className="px-2.5 py-1" onClick={() => setQuantity(p.id, quantity + 1)} aria-label="수량 증가">+</button>
                    </div>
                    <span className="w-24 text-right font-bold">{formatPrice(p.price * quantity)}</span>
                    <button onClick={() => remove(p.id)} className="text-sm text-gray-400 hover:text-red-600" aria-label="삭제">✕</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="card h-fit space-y-3 p-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">상품 금액</span>
              <span>{formatPrice(itemsTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">배송비</span>
              <span>{fee === 0 ? "무료" : formatPrice(fee)}</span>
            </div>
            {fee > 0 && (
              <p className="rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-700">
                {formatPrice(FREE_SHIPPING_THRESHOLD - itemsTotal)} 더 담으면 무료배송!
              </p>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
              <span>결제 예정 금액</span>
              <span className="text-brand-700">{formatPrice(itemsTotal + fee)}</span>
            </div>
            <Link
              href="/checkout"
              aria-disabled={overStock}
              className={`btn-primary w-full py-3 ${overStock ? "pointer-events-none opacity-50" : ""}`}
            >
              주문하기
            </Link>
            {!loggedIn && <p className="text-center text-xs text-gray-400">주문하려면 로그인이 필요합니다.</p>}
          </aside>
        </div>
      )}
    </div>
  );
}
