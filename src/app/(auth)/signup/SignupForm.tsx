"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    if (password !== fd.get("password2")) return setError("비밀번호가 일치하지 않습니다.");

    setPending(true);
    setError(null);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { name: String(fd.get("name")) }, // profiles.name 으로 저장됨 (DB 트리거)
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    setPending(false);

    if (error) {
      return setError(
        error.code === "user_already_exists"
          ? "이미 가입된 이메일입니다."
          : error.code === "weak_password"
            ? "비밀번호는 6자 이상이어야 합니다."
            : error.code === "over_email_send_rate_limit"
              ? "인증 메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
              : error.message,
      );
    }

    // 이메일 인증이 꺼져 있으면 바로 로그인 상태가 된다
    if (data.session) {
      router.push(next);
      router.refresh();
    } else {
      setSentTo(email);
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-3xl">📬</p>
        <p className="font-medium">인증 메일을 보냈습니다</p>
        <p className="text-sm text-gray-500">
          <b>{sentTo}</b> 메일함에서 인증 링크를 눌러 가입을 완료해 주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">이름</label>
        <input id="name" name="name" required className="input" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">비밀번호 (6자 이상)</label>
        <input id="password" name="password" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="password2">비밀번호 확인</label>
        <input id="password2" name="password2" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="btn-primary w-full py-3">{pending ? "가입 중…" : "가입하기"}</button>
    </form>
  );
}
