import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  const confirmed = sp.confirmed === "1";

  return (
    <div className="container-page flex max-w-md flex-col py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">로그인</h1>
      {confirmed && <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">이메일 인증이 완료되었습니다. 로그인해 주세요.</p>}
      <div className="card p-6">
        <LoginForm next={next} />
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        아직 회원이 아니신가요?{" "}
        <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-brand-600 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
