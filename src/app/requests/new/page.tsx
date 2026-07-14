import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRequesterHistory } from "@/lib/data";
import AppHeader from "@/components/AppHeader";
import NewRequestForm from "./NewRequestForm";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const history = await getRequesterHistory(user.id);

  return (
    <>
      <AppHeader title="요청 등록" back="/requests" />
      <main className="flex-1 px-5 py-5">
        <NewRequestForm receivers={history.receivers} titles={history.titles} />
      </main>
    </>
  );
}
