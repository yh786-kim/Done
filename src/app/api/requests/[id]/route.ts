import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateRequest, deleteRequest } from "@/lib/data";

// PATCH /api/requests/:id  수정(켜기/끄기, 내용/시간/요일)
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body.scheduleTime === "string" && /^\d{2}:\d{2}$/.test(body.scheduleTime))
    patch.schedule_time = body.scheduleTime;
  if (Array.isArray(body.daysOfWeek)) patch.days_of_week = body.daysOfWeek;

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ ok: false, error: "변경할 내용이 없습니다." }, { status: 400 });

  const ok = await updateRequest(user.id, id, patch);
  if (!ok) return NextResponse.json({ ok: false, error: "수정 권한이 없거나 항목이 없습니다." }, { status: 403 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/requests/:id
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await ctx.params;
  const ok = await deleteRequest(user.id, id);
  if (!ok) return NextResponse.json({ ok: false, error: "삭제 권한이 없거나 항목이 없습니다." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
