import type { Enums, Json } from "@/types/database.types";

export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 50000;

// DB의 create_order() 함수와 같은 규칙
export function shippingFee(itemsTotal: number) {
  return itemsTotal === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function formatPrice(won: number) {
  return won.toLocaleString("ko-KR") + "원";
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABEL: Record<Enums<"order_status">, string> = {
  pending: "결제대기",
  paid: "결제완료",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
};

export const ORDER_STATUS_STYLE: Record<Enums<"order_status">, string> = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-blue-100 text-blue-700",
  shipping: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export type ImageCredit = { author: string; license: string; source_url: string; note?: string };

export function asCredit(value: Json | null): ImageCredit | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.author !== "string" || typeof v.license !== "string") return null;
  return v as unknown as ImageCredit;
}

export function asSpecs(value: Json): [string, string][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).map(([k, v]) => [k, String(v ?? "")]);
}
