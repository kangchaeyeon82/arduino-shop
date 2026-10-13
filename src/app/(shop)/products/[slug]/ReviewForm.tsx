"use client";

import { useActionState, useState } from "react";
import { addReview } from "./actions";

export default function ReviewForm({ productId, slug }: { productId: number; slug: string }) {
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(addReview, null);

  return (
    <form action={formAction} className="card space-y-3 p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-amber-400" : "text-gray-300"}`} aria-label={`${n}점`}>
            ★
          </button>
        ))}
      </div>
      <textarea name="content" required maxLength={1000} rows={3} placeholder="상품을 사용해 본 후기를 남겨 주세요." className="input" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn-dark">{pending ? "등록 중…" : "리뷰 등록"}</button>
    </form>
  );
}
