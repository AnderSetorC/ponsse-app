"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FuncionarioCard from "@/components/FuncionarioCard";
import { Funcionario } from "@/lib/types";
import { carregarDados } from "@/lib/api";

export default function Home() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [setoresAdmin, setSetoresAdmin] = useState<string[]>([]);
  const [agora, setAgora] = useState<Date | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  async function recarregar(silencioso = false) {
    if (!silencioso) setAtualizando(true);
    const dados = await carregarDados();
    setFuncionarios(dados.funcionarios);
    setSetoresAdmin(dados.setores);
    setCarregado(true);
    setUltimaAtualizacao(new Date());
    if (!silencioso) {
      setTimeout(() => setAtualizando(false), 600);
    }
  }

  useEffect(() => {
    recarregar(true);
    setAgora(new Date());

    // Atualiza o "agora" a cada minuto
    const intervalTempo = setInterval(() => {
      setAgora(new Date());
    }, 60000);

    // Recarrega dados a cada 30s (pega mudanças feitas pelo admin)
    const intervalDados = setInterval(() => recarregar(true), 30000);

    // Recarrega quando a aba volta a ficar visível
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        recarregar(true);
        setAgora(new Date());
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(intervalTempo);
      clearInterval(intervalDados);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const visiveis = funcionarios
    .filter((f) => f.visivel)
    .slice() // copia pra não mutar o state
    .sort((a, b) => {
      // Ativos primeiro (considerando também horário)
      const aAtivo = agora ? estaNoHorario(a, agora) && a.ativo : a.ativo;
      const bAtivo = agora ? estaNoHorario(b, agora) && b.ativo : b.ativo;
      if (aAtivo !== bAtivo) return aAtivo ? -1 : 1;
      // Depois por nome
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

  // Setores: usa os do admin (que ele cadastrou) e garante "Geral" no topo
  const setoresDisponiveis =
    setoresAdmin.length > 0
      ? setoresAdmin.includes("Geral")
        ? setoresAdmin
        : ["Geral", ...setoresAdmin]
      : Array.from(new Set(visiveis.map((f) => f.setor).filter(Boolean))).sort();

  const disponiveis = visiveis.filter(
    (f) =>
      f.ativo &&
      agora &&
      estaNoHorario(f, agora)
  ).length;

  function estaNoHorario(func: Funcionario, agora: Date) {
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const [hIni, mIni] = func.horarioInicio.split(":").map(Number);
    const [hFim, mFim] = func.horarioFim.split(":").map(Number);
    const minIni = hIni * 60 + mIni;
    const minFim = hFim * 60 + mFim;
    return minutosAgora >= minIni && minutosAgora <= minFim;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showAdminLink={false} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Hero / Status */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 px-2">
            Quem está disponível agora
          </h1>
          {agora && (
            <p className="text-xs sm:text-sm text-gray-400 px-2">
              <span className="hidden sm:inline">
                {agora.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}{" "}
                •{" "}
              </span>
              <span className="sm:hidden">
                {agora.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}{" "}
                •{" "}
              </span>
              {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-ponsse-dark border border-ponsse-yellow/30 px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-online" />
              <span className="text-sm font-semibold text-white">
                {disponiveis} {disponiveis === 1 ? "pessoa disponível" : "pessoas disponíveis"}
              </span>
            </div>
            <button
              onClick={() => recarregar(false)}
              disabled={atualizando}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-ponsse-yellow px-3 py-2 rounded-full border border-gray-700 hover:border-ponsse-yellow transition-colors disabled:opacity-50"
              title={
                ultimaAtualizacao
                  ? `Última atualização: ${ultimaAtualizacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                  : "Atualizar lista"
              }
            >
              <svg
                className={`w-3.5 h-3.5 ${atualizando ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{atualizando ? "Atualizando..." : "Atualizar"}</span>
            </button>
          </div>
          {ultimaAtualizacao && (
            <p className="text-[10px] text-gray-600 mt-2">
              Atualizado às {ultimaAtualizacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {/* Cards */}
        {!carregado ? (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        ) : visiveis.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Ninguém disponível no momento. Tente novamente mais tarde.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {visiveis.map((func) => (
              <FuncionarioCard
                key={func.id}
                func={func}
                agora={agora || new Date()}
                setoresDisponiveis={setoresDisponiveis}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-10">
          Atualiza automaticamente • Toque em quem está online para falar
        </p>
      </main>

      <footer className="border-t border-gray-800 py-4 text-center">
        <p className="text-xs text-gray-500">
          Ponsse • A logger&apos;s best friend
        </p>
      </footer>
    </div>
  );
}
