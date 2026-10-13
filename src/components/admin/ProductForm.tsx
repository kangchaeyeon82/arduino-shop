"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import type { Tables } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { asSpecs } from "@/lib/utils";
import { saveProduct } from "@/app/admin/actions";

type Props = { categories: { id: number; name: string }[]; product?: Tables<"products"> };

export default function ProductForm({ categories, product }: Props) {
  const [state, formAction, pending] = useActionState(saveProduct, null);
  const [image, setImage] = useState(product?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 이미지는 브라우저에서 Supabase Storage로 직접 업로드 (관리자만 업로드 가능 - Storage RLS)
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) {
      setUploadError("업로드 실패: " + error.message);
    } else {
      setImage(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  const specsText = product ? asSpecs(product.specs).map(([k, v]) => `${k}: ${v}`).join("\n") : "";

  return (
    <form action={formAction} className="card grid gap-5 p-6 md:grid-cols-[240px_1fr]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image" value={image} />

      <div>
        <p className="label">상품 이미지</p>
        <div className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
          {image ? (
            <Image src={image} alt="" fill sizes="240px" className="object-contain p-2" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-gray-400">이미지 없음</span>
          )}
        </div>
        <label className="btn-outline mt-2 w-full cursor-pointer">
          {uploading ? "업로드 중…" : "이미지 선택"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">상품명</label>
          <input id="name" name="name" required defaultValue={product?.name} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="slug">슬러그 (URL)</label>
          <input id="slug" name="slug" required pattern="[a-z0-9-]+" title="영문 소문자, 숫자, 하이픈만" defaultValue={product?.slug} className="input" placeholder="hc-sr04" />
        </div>
        <div>
          <label className="label" htmlFor="category_id">카테고리</label>
          <select id="category_id" name="category_id" defaultValue={product?.category_id} className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">가격 (원)</label>
          <input id="price" name="price" type="number" min={0} required defaultValue={product?.price} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="stock">재고</label>
          <input id="stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">설명</label>
          <textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="specs">주요 사양 (한 줄에 하나, &quot;항목: 값&quot;)</label>
          <textarea id="specs" name="specs" rows={4} defaultValue={specsText} className="input font-mono" placeholder={"동작전압: 5V\n통신: I2C"} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="h-4 w-4 accent-brand-500" />
          판매중 (체크 해제 시 쇼핑몰에서 숨김)
        </label>
        <div className="flex items-center justify-end gap-3 sm:col-span-2">
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button disabled={pending || uploading} className="btn-primary px-8">{pending ? "저장 중…" : "저장"}</button>
        </div>
      </div>
    </form>
  );
}
