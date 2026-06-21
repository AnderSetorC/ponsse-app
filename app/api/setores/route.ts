import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { setoresDefault } from "@/lib/types";

const KEY = "ponsse:setores";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await kv.get<string[]>(KEY);
    if (!data || data.length === 0) {
      await kv.set(KEY, setoresDefault);
      return NextResponse.json(setoresDefault);
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ __local: true }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as string[];
    await kv.set(KEY, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao salvar" },
      { status: 500 }
    );
  }
}
