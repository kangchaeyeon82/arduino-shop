import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import CartBadge from "@/components/cart/CartBadge";
import LogoutButton from "@/components/layout/LogoutButton";
import SearchBox from "@/components/layout/SearchBox";

const NAV = [
  { href: "/products?category=boards", label: "보드" },
  { href: "/products?category=sensors", label: "센서" },
  { href: "/products?category=motors", label: "모터" },
  { href: "/products?category=displays", label: "디스플레이" },
  { href: "/products?category=parts", label: "부품" },
  { href: "/products?category=kits", label: "키트" },
];

export default async function Header() {
  const { user, profile } = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm text-white">∞</span>
          아두이노랩
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          {user ? (
            <>
              {profile?.is_admin && (
                <Link href="/admin" className="rounded-md px-3 py-2 font-medium text-brand-700 hover:bg-brand-50">
                  관리자
                </Link>
              )}
              <Link href="/mypage" className="rounded-md px-3 py-2 hover:bg-gray-100">
                {profile?.name ?? "마이페이지"}님
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 hover:bg-gray-100">로그인</Link>
              <Link href="/signup" className="rounded-md px-3 py-2 hover:bg-gray-100">회원가입</Link>
            </>
          )}
          <CartBadge />
        </nav>
      </div>

      <div className="border-t border-gray-100">
        <div className="container-page flex items-center gap-1 overflow-x-auto py-1 text-sm">
          <Link href="/products" className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium hover:bg-gray-100">
            전체상품
          </Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              {n.label}
            </Link>
          ))}
        </div>
        <div className="container-page pb-2 md:hidden">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
