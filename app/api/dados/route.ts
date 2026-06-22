import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import {
  Funcionario,
  funcionariosIniciais,
  setoresDefault,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const KEY = "ponsse:dados";

type Dados = {
  funcionarios: Funcionario[];
  setores: string[];
};

function getRedis() {
  // Usa REST API explicitamente (não TCP, que não funciona no Vercel)
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN são obrigatórios");
  }
  return new Redis({ url, token });
}

export async function GET() {
  try {
    const redis = getRedis();
    const dados = (await redis.get<Dados>(KEY)) || null;

    if (dados && Array.isArray(dados.funcionarios)) {
      return NextResponse.json({
        funcionarios: dados.funcionarios,
        setores: dados.setores || setoresDefault,
        origem: "upstash",
      });
    }

    // Primeira vez: popula com os iniciais
    const iniciais: Dados = {
      funcionarios: funcionariosIniciais,
      setores: setoresDefault,
    };
    await redis.set(KEY, iniciais);
    return NextResponse.json({
      ...iniciais,
      origem: "iniciais",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao conectar no Upstash: " + String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const redis = getRedis();
    const body = (await req.json()) as Partial<Dados>;

    const novosDados: Dados = {
      funcionarios: body.funcionarios || [],
      setores: body.setores || setoresDefault,
    };

    // PROTEÇÃO: se a nova lista vier vazia mas a anterior tem dados, recusa
    const atual = (await redis.get<Dados>(KEY)) || null;
    if (
      novosDados.funcionarios.length === 0 &&
      atual &&
      Array.isArray(atual.funcionarios) &&
      atual.funcionarios.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Bloqueado: novo payload tem 0 funcionários, mas existem " +
            atual.funcionarios.length +
            " no servidor. Atualize a página antes de salvar.",
        },
        { status: 400 }
      );
    }

    await redis.set(KEY, novosDados);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao salvar: " + String(err) },
      { status: 500 }
    );
  }
}
