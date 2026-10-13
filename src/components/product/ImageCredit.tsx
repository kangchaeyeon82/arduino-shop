import type { ImageCredit as Credit } from "@/lib/utils";

// CC 라이선스 이미지는 저작자·라이선스 표기가 필요하다
export default function ImageCredit({ credit }: { credit: Credit | null }) {
  if (!credit) return null;
  return (
    <p className="text-xs text-gray-400">
      사진: {credit.author} ·{" "}
      <a href={credit.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
        {credit.license}
      </a>
      {credit.note && <> · {credit.note}</>}
    </p>
  );
}
