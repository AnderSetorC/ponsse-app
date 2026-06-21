"use client";

import { FormEvent, useState } from "react";

const SENHA_CORRETA = "Pons&2026#";
const AUTH_KEY = "ponsse-admin-autenticado-v1";

type Props = {
  onAutenticado: () => void;
};

export default function AdminLogin({ onAutenticado }: Props) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  function tentarLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(false);
    // Pequeno delay pra simular validação
    setTimeout(() => {
      if (senha === SENHA_CORRETA) {
        sessionStorage.setItem(AUTH_KEY, "1");
        onAutenticado();
      } else {
        setErro(true);
        setLoading(false);
      }
    }, 300);
  }

  return (
    <div className="min-h-screen flex flex-col bg-ponsse-black">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ponsse-yellow mb-4">
              <svg
                className="w-8 h-8 text-ponsse-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Painel Administrativo
            </h1>
            <p className="text-sm text-gray-400">
              Acesso restrito — informe a senha
            </p>
          </div>

          <form
            onSubmit={tentarLogin}
            className="bg-ponsse-dark border-2 border-gray-700 rounded-2xl p-6"
          >
            <label className="block text-sm text-gray-300 mb-2 font-semibold">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro(false);
              }}
              placeholder="••••••••"
              autoFocus
              disabled={loading}
              className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-4 py-3 text-white text-lg tracking-widest focus:border-ponsse-yellow focus:outline-none disabled:opacity-50"
            />
            {erro && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Senha incorreta
              </p>
            )}
            <button
              type="submit"
              disabled={!senha || loading}
              className="w-full mt-4 bg-ponsse-yellow text-ponsse-black font-bold py-3 rounded-lg hover:bg-yellow-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Ponsse • A logger&apos;s best friend
          </p>
        </div>
      </main>
    </div>
  );
}

export function verificarAutenticado(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function logout() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_KEY);
}
