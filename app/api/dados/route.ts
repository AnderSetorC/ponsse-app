import { NextResponse } from "next/server";
import {
  Funcionario,
  funcionariosIniciais,
  setoresDefault,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const REPO = "AnderSetorC/ponsse-app";
const PATH = "data/dados.json";
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/${PATH}`;

type Dados = {
  funcionarios: Funcionario[];
  setores: string[];
};

// Lê o arquivo data/dados.json do GitHub (raw)
async function lerDoGitHub(): Promise<Dados | null> {
  try {
    const res = await fetch(RAW_URL, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Dados;
  } catch {
    return null;
  }
}

// Lê via API do GitHub (precisa de token) - retorna também o SHA do arquivo
async function lerComToken(token: string): Promise<{ dados: Dados; sha: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${PATH}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { content: string; sha: string };
    const decoded = Buffer.from(json.content, "base64").toString("utf-8");
    return { dados: JSON.parse(decoded) as Dados, sha: json.sha };
  } catch {
    return null;
  }
}

// Escreve no GitHub via API
async function escreverNoGitHub(
  dados: Dados,
  token: string,
  sha: string,
  mensagem: string
): Promise<boolean> {
  try {
    const conteudo = Buffer.from(JSON.stringify(dados, null, 2)).toString("base64");
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: mensagem,
          content: conteudo,
          sha: sha,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  // Tenta ler do GitHub primeiro
  const dados = await lerDoGitHub();
  if (dados && Array.isArray(dados.funcionarios) && dados.funcionarios.length > 0) {
    return NextResponse.json({
      funcionarios: dados.funcionarios,
      setores: dados.setores || setoresDefault,
      origem: "github",
    });
  }
  // Fallback: retorna os iniciais
  return NextResponse.json({
    funcionarios: funcionariosIniciais,
    setores: setoresDefault,
    origem: "iniciais",
  });
}

export async function POST(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Token do GitHub não configurado no servidor" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as Partial<Dados>;
  const novosDados: Dados = {
    funcionarios: body.funcionarios || [],
    setores: body.setores || setoresDefault,
  };

  // Lê o SHA atual
  const atual = await lerComToken(token);
  if (!atual) {
    return NextResponse.json(
      { error: "Não foi possível ler o arquivo no GitHub" },
      { status: 500 }
    );
  }

  const ok = await escreverNoGitHub(
    novosDados,
    token,
    atual.sha,
    `Atualizar dados - ${new Date().toLocaleString("pt-BR")}`
  );

  if (!ok) {
    return NextResponse.json(
      { error: "Não foi possível salvar no GitHub" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
