import {
  Funcionario,
  STORAGE_KEY,
  SETORES_KEY,
  funcionariosIniciais,
  setoresDefault,
} from "./types";

const USE_LOCAL_KEY = "ponsse:usarLocal";

// Detecta se estamos em produção (com KV) ou local (sem KV)
async function deveUsarLocal(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  // Cache da decisão pra não fazer ping a cada operação
  const cached = sessionStorage.getItem(USE_LOCAL_KEY);
  if (cached === "1") return true;
  if (cached === "0") return false;
  try {
    const res = await fetch("/api/funcionarios", { cache: "no-store" });
    const data = await res.json();
    if (data && (data as any).__local) {
      sessionStorage.setItem(USE_LOCAL_KEY, "1");
      return true;
    }
    sessionStorage.setItem(USE_LOCAL_KEY, "0");
    return false;
  } catch {
    sessionStorage.setItem(USE_LOCAL_KEY, "1");
    return true;
  }
}

// ---------------- FUNCIONÁRIOS ----------------

export async function carregarFuncionariosAPI(): Promise<Funcionario[]> {
  const local = await deveUsarLocal();
  if (local) {
    return carregarLocal();
  }
  try {
    const res = await fetch("/api/funcionarios", { cache: "no-store" });
    return (await res.json()) as Funcionario[];
  } catch {
    return carregarLocal();
  }
}

export async function salvarFuncionariosAPI(lista: Funcionario[]) {
  const local = await deveUsarLocal();
  if (local) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
    return;
  }
  try {
    await fetch("/api/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lista),
    });
  } catch (err) {
    // silencioso
  }
}

// ---------------- SETORES ----------------

export async function carregarSetoresAPI(): Promise<string[]> {
  const local = await deveUsarLocal();
  if (local) {
    if (typeof window === "undefined") return setoresDefault;
    const raw = localStorage.getItem(SETORES_KEY);
    if (!raw) {
      localStorage.setItem(SETORES_KEY, JSON.stringify(setoresDefault));
      return setoresDefault;
    }
    return JSON.parse(raw) as string[];
  }
  try {
    const res = await fetch("/api/setores", { cache: "no-store" });
    return (await res.json()) as string[];
  } catch {
    return setoresDefault;
  }
}

export async function salvarSetoresAPI(setores: string[]) {
  const local = await deveUsarLocal();
  if (local) {
    if (typeof window !== "undefined") {
      localStorage.setItem(SETORES_KEY, JSON.stringify(setores));
    }
    return;
  }
  try {
    await fetch("/api/setores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setores),
    });
  } catch (err) {
    // silencioso
  }
}

// ---------------- FALLBACK LOCAL ----------------

function carregarLocal(): Funcionario[] {
  if (typeof window === "undefined") return funcionariosIniciais;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionariosIniciais));
      return funcionariosIniciais;
    }
    const parsed = JSON.parse(raw) as Funcionario[];
    return parsed.map((f) => ({ ...f, visivel: f.visivel ?? true }));
  } catch {
    return funcionariosIniciais;
  }
}
