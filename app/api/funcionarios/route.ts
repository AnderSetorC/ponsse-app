import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { Funcionario, funcionariosIniciais } from "@/lib/types";

const KEY = "ponsse:funcionarios";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await kv.get<Funcionario[]>(KEY);
    if (!data || data.length === 0) {
      // Primeira vez: popula com os dados iniciais
      await kv.set(KEY, funcionariosIniciais);
      return NextResponse.json(funcionariosIniciais);
    }
    // Migração: garante que todo funcionário antigo tenha o campo `visivel`
    const mig = data.map((f) => ({ ...f, visivel: f.visivel ?? true }));
    return NextResponse.json(mig);
  } catch (err) {
    // Em dev local sem KV configurado, cai pro localStorage
    return NextResponse.json({ __local: true }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Funcionario[];
    await kv.set(KEY, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao salvar" },
      { status: 500 }
    );
  }
}
