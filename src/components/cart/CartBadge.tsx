"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative ml-1 rounded-md px-3 py-2 font-medium hover:bg-gray-100">
      장바구니
      {count > 0 && (
        <span className="absolute -right-1 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
