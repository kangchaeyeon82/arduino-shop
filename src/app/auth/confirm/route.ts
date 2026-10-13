import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 회원가입 인증 메일의 링크가 도착하는 곳
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";
  const supabase = await createClient();

  // PKCE 방식 (기본 메일 템플릿): ?code=...
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  // 토큰 해시 방식: ?token_hash=...&type=signup
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  // 다른 브라우저에서 링크를 연 경우 등 → 인증은 됐을 수 있으니 로그인으로 안내
  return NextResponse.redirect(new URL("/login?confirmed=1", origin));
}
