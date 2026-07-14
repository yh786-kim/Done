import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import NewRequestForm from "./NewRequestForm";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader title="요청 등록" back="/requests" />
      <main className="flex-1 px-5 py-6">
        <NewRequestForm />
      </main>
    </>
  );
}
