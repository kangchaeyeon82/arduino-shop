import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  categories?: { name: string } | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const soldOut = product.stock <= 0;
  return (
    <div className="card group flex flex-col overflow-hidden transition hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-white">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3 transition duration-300 group-hover:scale-105"
          />
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">품절</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 border-t border-gray-100 p-3">
        {product.categories && <span className="text-xs text-brand-600">{product.categories.name}</span>}
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold">{formatPrice(product.price)}</span>
          <AddToCartButton productId={product.id} disabled={soldOut} compact />
        </div>
      </div>
    </div>
  );
}
