import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import EnablePushButton from "@/components/EnablePushButton";
import EditableNickname from "@/components/EditableNickname";
import { Inbox, Send, ChevronRight } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col px-5 py-7">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">안녕하세요,</p>
          <div className="mt-0.5">
            <EditableNickname initial={user.nickname} />
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="space-y-3.5">
        <Link
          href="/me"
          className="block rounded-[22px] border border-border bg-card p-[22px] transition-transform active:scale-[0.99]"
        >
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-carrot-tint text-carrot-dark">
              <Inbox size={24} />
            </div>
            <ChevronRight size={16} className="text-faint" />
          </div>
          <div className="text-[19px] font-bold tracking-tight">내가 할일</div>
          <p className="mt-1.5 text-[13.5px] font-medium leading-relaxed text-muted">
            누군가 나에게 확인 요청한 내용을 시간대별로 보고 완료 표시해요.
          </p>
        </Link>

        <Link
          href="/requests"
          className="block rounded-[22px] border border-border bg-card p-[22px] transition-transform active:scale-[0.99]"
        >
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-foreground text-background">
              <Send size={23} />
            </div>
            <ChevronRight size={16} className="text-faint" />
          </div>
          <div className="text-[19px] font-bold tracking-tight">니가 할일</div>
          <p className="mt-1.5 text-[13.5px] font-medium leading-relaxed text-muted">
            상대방에게 확인할 내용과 시간을 등록하고, 했는지 결과를 확인해요.
          </p>
        </Link>
      </div>

      <div className="mt-auto pt-8">
        <EnablePushButton />
      </div>
    </main>
  );
}
