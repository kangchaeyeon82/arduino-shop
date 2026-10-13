"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

// 결제 완료 시 DB에서 장바구니가 비워졌으므로 화면의 장바구니도 다시 불러온다
export default function ReloadCart() {
  const { reload, ready } = useCart();
  useEffect(() => {
    if (ready) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  return null;
}
