import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// 앱은 항상 첫 화면(로그인)으로 진입한다. 로그인돼 있으면 그 화면에서 '시작'만 누르면 된다.
export default function RootPage() {
  redirect("/login");
}
