import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";

  return (
    <div className="container-page flex max-w-md flex-col py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">회원가입</h1>
      <div className="card p-6">
        <SignupForm next={next} />
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        이미 회원이신가요?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
