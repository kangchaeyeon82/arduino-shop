"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addReview(_prev: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const productId = Number(formData.get("productId"));
  const slug = String(formData.get("slug"));
  const rating = Number(formData.get("rating"));
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return { error: "내용을 입력해 주세요." };
  if (!(rating >= 1 && rating <= 5)) return { error: "별점을 선택해 주세요." };

  // user_id와 작성자 이름은 DB 트리거가 채운다
  const { error } = await supabase.from("reviews").insert({ product_id: productId, rating, content });
  if (error) {
    return { error: error.code === "23505" ? "이미 리뷰를 작성한 상품입니다." : "리뷰 등록에 실패했습니다. 로그인 상태를 확인해 주세요." };
  }

  revalidatePath(`/products/${slug}`);
  return null;
}
