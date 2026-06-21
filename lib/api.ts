import { Funcionario } from "./types";

type DadosAPI = {
  funcionarios: Funcionario[];
  setores: string[];
  origem?: "github" | "iniciais";
};

const ENDPOINT = "/api/dados";

export async function carregarDados(): Promise<DadosAPI> {
  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error("Falha ao carregar");
    return (await res.json()) as DadosAPI;
  } catch {
    // Em dev local sem nada configurado, retorna vazio
    return { funcionarios: [], setores: [], origem: "iniciais" };
  }
}

export async function salvarDados(dados: {
  funcionarios: Funcionario[];
  setores: string[];
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: err.error || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
