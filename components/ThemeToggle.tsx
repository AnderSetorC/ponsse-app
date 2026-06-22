"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "ponsse-tema-v1";

export function useTheme(): [Theme, () => void] {
  const [tema, setTema] = useState<Theme>("dark");

  useEffect(() => {
    // Carrega tema salvo
    const salvo = (typeof window !== "undefined" && localStorage.getItem(KEY)) as Theme | null;
    if (salvo === "dark" || salvo === "light") {
      setTema(salvo);
      aplicarTema(salvo);
    }
  }, []);

  function toggle() {
    const novo: Theme = tema === "dark" ? "light" : "dark";
    setTema(novo);
    localStorage.setItem(KEY, novo);
    aplicarTema(novo);
  }

  return [tema, toggle];
}

function aplicarTema(t: Theme) {
  if (typeof document === "undefined") return;
  if (t === "light") {
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

export function ThemeToggle() {
  const [tema, toggle] = useTheme();

  return (
    <button
      onClick={toggle}
      className="text-gray-400 hover:text-ponsse-yellow transition-colors p-2 rounded border border-gray-700 hover:border-ponsse-yellow"
      title={tema === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label="Alternar tema"
    >
      {tema === "dark" ? (
        // Ícone de sol (modo escuro ativo → vai pra claro)
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Ícone de lua (modo claro ativo → vai pra escuro)
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}