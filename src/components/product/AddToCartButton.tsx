"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

type Props = { productId: number; disabled?: boolean; compact?: boolean; maxQuantity?: number };

export default function AddToCartButton({ productId, disabled, compact, maxQuantity = 99 }: Props) {
  const { add } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  async function handleAdd(goToCart = false) {
    setState("adding");
    await add(productId, quantity);
    if (goToCart) return router.push("/cart");
    setState("added");
    setTimeout(() => setState("idle"), 1500);
  }

  if (compact) {
    return (
      <button
        onClick={() => handleAdd()}
        disabled={disabled || state === "adding"}
        className="rounded-md border border-brand-500 px-2.5 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
      >
        {state === "added" ? "담김 ✓" : "담기"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">수량</span>
        <div className="flex items-center rounded-lg border border-gray-300 bg-white">
          <button className="px-3 py-2 text-lg leading-none" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="수량 감소">
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            className="px-3 py-2 text-lg leading-none"
            onClick={() => setQuantity((q) => Math.min(Math.min(99, maxQuantity), q + 1))}
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleAdd()} disabled={disabled || state === "adding"} className="btn-outline py-3">
          {state === "added" ? "장바구니에 담았습니다 ✓" : "장바구니 담기"}
        </button>
        <button onClick={() => handleAdd(true)} disabled={disabled || state === "adding"} className="btn-primary py-3">
          {disabled ? "품절" : "바로 구매"}
        </button>
      </div>
    </div>
  );
}
