import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_IMAGE_CREDITS, HERO_IMAGES } from "@/lib/credits";
import { asCredit, type ImageCredit } from "@/lib/utils";

export const metadata: Metadata = { title: "이미지 출처" };

export default async function CreditsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("name, image_credit").order("category_id").order("id");

  const rows: { label: string; credit: ImageCredit }[] = [
    ...HERO_IMAGES.map((h, i) => ({ label: `메인 배너 ${i + 1}`, credit: h.credit })),
    ...Object.entries(CATEGORY_IMAGE_CREDITS).map(([slug, credit]) => ({ label: `카테고리: ${slug}`, credit })),
    ...(products ?? []).flatMap((p) => {
      const credit = asCredit(p.image_credit);
      return credit ? [{ label: p.name, credit }] : [];
    }),
  ];

  return (
    <div className="container-page max-w-4xl py-8">
      <h1 className="text-2xl font-bold">이미지 출처</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        이 사이트의 사진은 크리에이티브 커먼즈(CC) 라이선스 또는 퍼블릭 도메인 이미지입니다. 원본 링크에서 라이선스 전문을 확인할 수 있습니다.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">사용 위치</th>
              <th className="px-4 py-2 font-medium">저작자</th>
              <th className="px-4 py-2 font-medium">라이선스</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="px-4 py-2">{r.label}</td>
                <td className="px-4 py-2 text-gray-600">{r.credit.author}</td>
                <td className="px-4 py-2">
                  <a href={r.credit.source_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
                    {r.credit.license}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
