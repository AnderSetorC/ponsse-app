import {
  Funcionario,
  SETORES_KEY,
  STORAGE_KEY,
  funcionariosIniciais,
  setoresDefault,
} from "./types";

export function carregarFuncionarios(): Funcionario[] {
  if (typeof window === "undefined") return funcionariosIniciais;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionariosIniciais));
      return funcionariosIniciais;
    }
    const parsed = JSON.parse(raw) as Funcionario[];
    // Migração: garante que todo funcionário antigo tenha o campo `visivel`
    return parsed.map((f) => ({
      ...f,
      visivel: f.visivel ?? true,
    }));
  } catch {
    return funcionariosIniciais;
  }
}

export function salvarFuncionarios(lista: Funcionario[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function carregarSetores(): string[] {
  if (typeof window === "undefined") return setoresDefault;
  try {
    const raw = localStorage.getItem(SETORES_KEY);
    if (!raw) {
      localStorage.setItem(SETORES_KEY, JSON.stringify(setoresDefault));
      return setoresDefault;
    }
    return JSON.parse(raw) as string[];
  } catch {
    return setoresDefault;
  }
}

export function salvarSetores(setores: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETORES_KEY, JSON.stringify(setores));
}

export function estaDisponivel(func: Funcionario, agora: Date = new Date()): boolean {
  if (!func.ativo) return false;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const [hIni, mIni] = func.horarioInicio.split(":").map(Number);
  const [hFim, mFim] = func.horarioFim.split(":").map(Number);
  const minIni = hIni * 60 + mIni;
  const minFim = hFim * 60 + mFim;
  return minutosAgora >= minIni && minutosAgora <= minFim;
}

export function getIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function corAvatar(nome: string): string {
  const cores = [
    "#FFCD00",
    "#F5A623",
    "#E67E22",
    "#D35400",
    "#C0392B",
    "#16A085",
    "#27AE60",
    "#2980B9",
    "#8E44AD",
    "#2C3E50",
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cores[Math.abs(hash) % cores.length];
}

export function telefoneParaWaLink(tel: string): string {
  // remove tudo que não é número
  return "https://wa.me/55" + tel.replace(/\D/g, "");
}

export function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
