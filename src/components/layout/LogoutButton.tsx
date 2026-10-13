"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={logout} className="rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100">
      로그아웃
    </button>
  );
}
