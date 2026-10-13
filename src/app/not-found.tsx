import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-5xl font-bold text-brand-500">404</p>
      <h1 className="mt-3 text-xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-gray-500">주소가 잘못되었거나 접근 권한이 없는 페이지입니다.</p>
      <Link href="/" className="btn-primary mt-6">홈으로</Link>
    </div>
  );
}
