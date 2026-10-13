"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 장바구니: 비로그인 → localStorage, 로그인 → DB(cart_items). 로그인하면 localStorage 내용을 DB로 합친다.
export type CartLine = { product_id: number; quantity: number };
export type CartProduct = { id: number; slug: string; name: string; price: number; image: string | null; stock: number };

type CartContextValue = {
  lines: CartLine[];
  products: Record<number, CartProduct>;
  count: number;
  ready: boolean;
  loggedIn: boolean;
  add: (productId: number, quantity?: number) => Promise<void>;
  setQuantity: (productId: number, quantity: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  reload: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "arduino-shop-cart";
const MAX_QTY = 99;

function readLocal(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((l) => l.product_id && l.quantity > 0) : [];
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // 저장 불가(시크릿 모드 등) → 무시
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Record<number, CartProduct>>({});
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const loadedRef = useRef(false);

  const loadProducts = useCallback(
    async (ls: CartLine[]) => {
      if (ls.length === 0) return setProducts({});
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price, image, stock")
        .in("id", ls.map((l) => l.product_id));
      setProducts(Object.fromEntries((data ?? []).map((p) => [p.id, p])));
    },
    [supabase],
  );

  const load = useCallback(
    async (uid: string | null) => {
      let next: CartLine[];
      if (uid) {
        // 로그인 직후: localStorage에 담아둔 상품을 DB로 옮긴다
        const local = readLocal();
        const { data: existing } = await supabase.from("cart_items").select("product_id, quantity");
        if (local.length > 0) {
          const merged = local.map((l) => {
            const db = existing?.find((e) => e.product_id === l.product_id);
            return { product_id: l.product_id, quantity: Math.min(MAX_QTY, (db?.quantity ?? 0) + l.quantity) };
          });
          await supabase.from("cart_items").upsert(merged, { onConflict: "user_id,product_id" });
          writeLocal([]);
          const { data } = await supabase.from("cart_items").select("product_id, quantity").order("created_at");
          next = data ?? [];
        } else {
          next = existing ?? [];
        }
      } else {
        next = readLocal();
      }
      setLines(next);
      await loadProducts(next);
      setReady(true);
    },
    [supabase, loadProducts],
  );

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user.id ?? null;
      if (loadedRef.current && uid === userIdRef.current) return; // 토큰 갱신 등은 무시
      loadedRef.current = true;
      userIdRef.current = uid;
      setUserId(uid);
      // onAuthStateChange 콜백 안에서 바로 Supabase를 호출하면 교착될 수 있어 다음 틱으로 미룬다
      setTimeout(() => load(uid), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, load]);

  const save = useCallback(
    async (next: CartLine[], changed: CartLine | { product_id: number; quantity: 0 }) => {
      setLines(next);
      if (userIdRef.current) {
        if (changed.quantity === 0) {
          await supabase.from("cart_items").delete().eq("product_id", changed.product_id);
        } else {
          await supabase.from("cart_items").upsert(changed, { onConflict: "user_id,product_id" });
        }
      } else {
        writeLocal(next);
      }
    },
    [supabase],
  );

  const setQuantity = useCallback(
    async (productId: number, quantity: number) => {
      const q = Math.max(1, Math.min(MAX_QTY, Math.floor(quantity)));
      const next = lines.map((l) => (l.product_id === productId ? { ...l, quantity: q } : l));
      await save(next, { product_id: productId, quantity: q });
    },
    [lines, save],
  );

  const add = useCallback(
    async (productId: number, quantity = 1) => {
      const found = lines.find((l) => l.product_id === productId);
      const q = Math.min(MAX_QTY, (found?.quantity ?? 0) + quantity);
      const next = found
        ? lines.map((l) => (l.product_id === productId ? { ...l, quantity: q } : l))
        : [...lines, { product_id: productId, quantity: q }];
      await save(next, { product_id: productId, quantity: q });
      if (!products[productId]) await loadProducts(next);
    },
    [lines, save, products, loadProducts],
  );

  const remove = useCallback(
    async (productId: number) => {
      await save(lines.filter((l) => l.product_id !== productId), { product_id: productId, quantity: 0 });
    },
    [lines, save],
  );

  const reload = useCallback(() => load(userIdRef.current), [load]);

  const value: CartContextValue = {
    lines,
    products,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    ready,
    loggedIn: userId !== null,
    add,
    setQuantity,
    remove,
    reload,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
