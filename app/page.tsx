"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FuncionarioCard from "@/components/FuncionarioCard";
import { Funcionario } from "@/lib/types";
import { carregarFuncionarios, carregarSetores } from "@/lib/funcionarios";

export default function Home() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [setoresAdmin, setSetoresAdmin] = useState<string[]>([]);
  const [agora, setAgora] = useState<Date | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setFuncionarios(carregarFuncionarios());
    setSetoresAdmin(carregarSetores());
    setCarregado(true);
    setAgora(new Date());

    // Atualiza o "agora" a cada minuto
    const interval = setInterval(() => {
      setAgora(new Date());
    }, 60000);

    // Também escuta mudanças no localStorage vindas do admin
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "ponsse-funcionarios-v1") {
        setFuncionarios(carregarFuncionarios());
      }
      if (!e.key || e.key === "ponsse-setores-v1") {
        setSetoresAdmin(carregarSetores());
      }
    };
    window.addEventListener("storage", onStorage);

    // Recarrega quando a aba volta a ficar visível
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setFuncionarios(carregarFuncionarios());
        setSetoresAdmin(carregarSetores());
        setAgora(new Date());
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const visiveis = funcionarios.filter((f) => f.visivel);

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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Hero / Status */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Quem está disponível agora
          </h1>
          {agora && (
            <p className="text-sm text-gray-400">
              {agora.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}{" "}
              • {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 bg-ponsse-dark border border-ponsse-yellow/30 px-4 py-2 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-online" />
            <span className="text-sm font-semibold text-white">
              {disponiveis} {disponiveis === 1 ? "pessoa disponível" : "pessoas disponíveis"}
            </span>
          </div>
        </div>

        {/* Cards */}
        {!carregado ? (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        ) : visiveis.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Ninguém disponível no momento. Tente novamente mais tarde.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
