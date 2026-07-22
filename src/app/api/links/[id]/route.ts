import { NextRequest, NextResponse } from "next/server";
import { deleteLink } from "@/lib/data";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteLink(id);
  return NextResponse.json({ ok: true });
}
