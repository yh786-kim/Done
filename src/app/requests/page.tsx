import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRequesterGroups } from "@/lib/data";
import { todayKST } from "@/lib/time";
import { formatPhone } from "@/lib/phone";
import AppHeader from "@/components/AppHeader";
import { Plus } from "@/components/icons";
import RequestItem from "./RequestItem";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = todayKST();
  const groups = await getRequesterGroups(user.id, today);

  return (
    <>
      <AppHeader
        title="니가 할일"
        back="/home"
        right={
          <Link
            href="/requests/new"
            className="flex h-8 items-center gap-1 rounded-full bg-carrot px-3.5 text-[13.5px] font-bold text-white active:bg-carrot-dark"
          >
            <Plus size={13} />
            등록
          </Link>
        }
      />

      <main className="flex-1 px-4 pb-5 pt-[18px]">
        {groups.length === 0 ? (
          <div className="mt-16 text-center text-muted">
            <p className="mb-4">아직 등록한 요청이 없어요.</p>
            <Link
              href="/requests/new"
              className="inline-block rounded-[14px] bg-carrot px-5 py-3 font-bold text-white active:bg-carrot-dark"
            >
              첫 요청 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.receiverPhone}>
                <div className="mb-2.5 flex flex-wrap items-center gap-2 px-0.5">
                  <span className="text-[15px] font-bold">{g.receiverNickname}</span>
                  <span className="text-xs font-medium text-faint">{formatPhone(g.receiverPhone)}</span>
                  {!g.registered && (
                    <span className="rounded-full bg-carrot-tint px-2.5 py-[3px] text-[11px] font-bold text-carrot-dark">
                      가입하면 알림
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5">
                  {g.items.map((it) => (
                    <RequestItem key={it.id} item={it} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
