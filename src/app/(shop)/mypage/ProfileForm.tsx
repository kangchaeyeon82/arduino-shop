"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="label" htmlFor="name">이름</label>
        <input id="name" name="name" defaultValue={name} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">연락처</label>
        <input id="phone" name="phone" defaultValue={phone} placeholder="010-0000-0000" className="input" />
      </div>
      {state?.message && <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
      <button disabled={pending} className="btn-outline w-full">{pending ? "저장 중…" : "저장"}</button>
    </form>
  );
}
