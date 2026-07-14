import { getCurrentUser, getRememberedPhone } from "@/lib/auth";
import { formatPhone } from "@/lib/phone";
import LoginForm from "./LoginForm";
import { Check } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // 로그인돼 있어도 홈으로 바로 보내지 않고, 첫 화면을 보여준다.
  const [user, remembered] = await Promise.all([getCurrentUser(), getRememberedPhone()]);
  const prefill = remembered || user?.phone || "";
  const canQuick = Boolean(remembered || user);

  return (
    <main className="flex flex-1 flex-col justify-center px-7 py-10">
      <div className="mb-11 text-center">
        <div className="mx-auto mb-[22px] flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-carrot text-white shadow-lg shadow-carrot/30">
          <Check size={34} />
        </div>
        <h1 className="text-[32px] font-extrabold tracking-tight">
          Done<span className="ml-px font-medium text-carrot">?</span>
        </h1>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-muted">
          정해진 시간에 물어보고,
          <br />
          했는지 확인해요.
        </p>
      </div>
      <LoginForm prefillPhone={prefill ? formatPhone(prefill) : ""} canQuick={canQuick} />
    </main>
  );
}
