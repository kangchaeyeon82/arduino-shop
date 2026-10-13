"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_prev: { ok: boolean; message: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) return { ok: false, message: "이름을 입력해 주세요." };

  const { error } = await supabase.from("profiles").update({ name, phone: phone || null }).eq("id", user.id);
  if (error) return { ok: false, message: "저장에 실패했습니다." };

  revalidatePath("/", "layout"); // 헤더의 이름도 갱신
  return { ok: true, message: "저장되었습니다." };
}
