import Link from "next/link";

export default async function CheckoutFailPage({ searchParams }: PageProps<"/checkout/fail">) {
  const sp = await searchParams;
  const code = String(sp.code ?? "");
  const message = String(sp.message ?? "결제가 취소되었거나 실패했습니다.");

  return (
    <div className="container-page max-w-lg py-16 text-center">
      <div className="card p-8">
        <p className="text-4xl">😥</p>
        <h1 className="mt-4 text-xl font-bold">결제에 실패했습니다</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        {code && <p className="mt-1 text-xs text-gray-400">오류 코드: {code}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/checkout" className="btn-primary">다시 결제하기</Link>
          <Link href="/cart" className="btn-outline">장바구니</Link>
        </div>
      </div>
    </div>
  );
}
