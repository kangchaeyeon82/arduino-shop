"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database.types";

// 관리자 권한은 DB의 RLS(private.is_admin())가 최종적으로 검사한다.

export async function saveProduct(_prev: { error: string } | null, formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") ? Number(formData.get("id")) : null;

  const specs: Record<string, string> = {};
  String(formData.get("specs") ?? "")
    .split("\n")
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });

  const values = {
    name: String(formData.get("name")).trim(),
    slug: String(formData.get("slug")).trim(),
    category_id: Number(formData.get("category_id")),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    description: String(formData.get("description") ?? "").trim() || null,
    image: String(formData.get("image") ?? "") || null,
    specs,
    is_active: formData.get("is_active") === "on",
  };

  const { error } = id
    ? await supabase.from("products").update(values).eq("id", id)
    : await supabase.from("products").insert(values);

  if (error) {
    return { error: error.code === "23505" ? "이미 사용 중인 슬러그입니다." : "저장 실패: " + error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateOrder(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Enums<"order_status">;
  const tracking_no = String(formData.get("tracking_no") ?? "").trim() || null;

  await supabase.from("orders").update({ status, tracking_no }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
