"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import AdminRow from "@/components/AdminRow";
import SetoresManager from "@/components/SetoresManager";
import ConfigAtendimento from "@/components/ConfigAtendimento";
import AdminLogin, {
  verificarAutenticado,
  logout,
} from "@/components/AdminLogin";
import { Config, CONFIG_PADRAO, Funcionario } from "@/lib/types";
import { novoId } from "@/lib/funcionarios";
import { carregarDados, salvarDados } from "@/lib/api";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  useEffect(() => {
    setAutenticado(verificarAutenticado());
    setVerificandoAuth(false);
  }, []);

  if (verificandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <p className="text-muted">Carregando...</p>
      </div>
    );
  }

  if (!autenticado) {
    return <AdminLogin onAutenticado={() => setAutenticado(true)} />;
  }

  return <AdminConteudo />;
}

function AdminConteudo() {
  const [lista, setLista] = useState<Funcionario[]>([]);
  const [setores, setSetores] = useState<string[]>([]);
  const [config, setConfig] = useState<Config>(CONFIG_PADRAO);
  const [carregado, setCarregado] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    setor: "",
    telefone: "",
    horarioInicio: "08:00",
    horarioFim: "18:00",
  });
  const [estado, setEstado] = useState<"salvo" | "salvando" | "erro" | "ocioso">(
    "ocioso"
  );
  const [ultimaSalv, setUltimaSalv] = useState<string | null>(null);
  const [erroSalv, setErroSalv] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Referências pros timers de debounce
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dadosRef = useRef<{
    funcionarios: Funcionario[];
    setores: string[];
    config: Config;
  }>({
    funcionarios: [],
    setores: [],
    config: CONFIG_PADRAO,
  });

  useEffect(() => {
    async function carregar() {
      const dados = await carregarDados();
      setLista(dados.funcionarios);
      setSetores(dados.setores);
      const cfg = dados.config || CONFIG_PADRAO;
      setConfig(cfg);
      dadosRef.current = {
        funcionarios: dados.funcionarios,
        setores: dados.setores,
        config: cfg,
      };
      setCarregado(true);
    }
    carregar();
  }, []);

  // Autosave com debounce — salva 1s após a última mudança
  function agendarSalvamento() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setEstado("salvando");
    timerRef.current = setTimeout(async () => {
      const r = await salvarDados(dadosRef.current);
      if (r.ok) {
        setEstado("salvo");
        setUltimaSalv(new Date().toLocaleTimeString("pt-BR"));
        setErroSalv(null);
      } else {
        setEstado("erro");
        setErroSalv(r.error || "Erro ao salvar");
      }
    }, 1000);
  }

  function atualizarLista(nova: Funcionario[]) {
    setLista(nova);
    dadosRef.current = { ...dadosRef.current, funcionarios: nova };
    agendarSalvamento();
  }

  function atualizarSetoresLocal(novos: string[]) {
    setSetores(novos);
    dadosRef.current = { ...dadosRef.current, setores: novos };
    agendarSalvamento();
  }

  function atualizarConfig(nova: Config) {
    setConfig(nova);
    dadosRef.current = { ...dadosRef.current, config: nova };
    agendarSalvamento();
  }

  function atualizar(func: Funcionario) {
    atualizarLista(lista.map((f) => (f.id === func.id ? func : f)));
  }

  function remover(id: string) {
    if (!confirm("Remover este funcionário?")) return;
    atualizarLista(lista.filter((f) => f.id !== id));
  }

  function adicionar() {
    if (!novo.nome.trim() || !novo.telefone.trim()) {
      alert("Preencha pelo menos nome e telefone.");
      return;
    }
    const f: Funcionario = {
      id: novoId(),
      nome: novo.nome.trim(),
      setor: novo.setor.trim() || "Geral",
      telefone: novo.telefone.trim(),
      ativo: true,
      visivel: true,
      horarioInicio: novo.horarioInicio,
      horarioFim: novo.horarioFim,
    };
    atualizarLista([...lista, f]);
    setNovo({
      nome: "",
      setor: "",
      telefone: "",
      horarioInicio: "08:00",
      horarioFim: "18:00",
    });
  }

  function ativarTodos() {
    atualizarLista(lista.map((f) => ({ ...f, ativo: true })));
  }

  function desativarTodos() {
    atualizarLista(lista.map((f) => ({ ...f, ativo: false })));
  }

  function visiveisTodos() {
    atualizarLista(lista.map((f) => ({ ...f, visivel: true })));
  }

  function atualizarSetores(novos: string[]) {
    atualizarSetoresLocal(novos);
  }

  // Verifica se o token do GitHub está configurado
  useEffect(() => {
    async function verificarToken() {
      try {
        const res = await fetch("/api/dados", { method: "POST", body: "{}" });
        if (res.status === 500) {
          const data = await res.json();
          if (data.error && data.error.includes("Token")) {
            setErroSalv("Token do GitHub não configurado no Vercel");
            setEstado("erro");
          }
        }
      } catch {
        // ignora
      }
    }
    if (carregado) verificarToken();
  }, [carregado]);

  // Cleanup do timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const stats = useMemo(() => {
    const total = lista.length;
    const ativos = lista.filter((f) => f.ativo).length;
    const visiveis = lista.filter((f) => f.visivel).length;
    const ocultos = total - visiveis;
    return { total, ativos, visiveis, ocultos };
  }, [lista]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header showAdminLink={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-app">Painel Administrativo</h1>
            <p className="text-xs sm:text-sm text-muted">
              Configure quem está disponível para atendimento
            </p>
          </div>
          <div className="flex items-center gap-2">
            {estado === "salvando" && (
              <span className="text-xs text-yellow-400 animate-pulse">
                ⏳ Salvando...
              </span>
            )}
            {estado === "salvo" && ultimaSalv && (
              <span className="text-xs text-green-400">
                ✓ Salvo às {ultimaSalv}
              </span>
            )}
            {estado === "erro" && erroSalv && (
              <span
                className="text-xs text-red-400"
                title={erroSalv}
              >
                ✕ {erroSalv.length > 40 ? erroSalv.slice(0, 40) + "..." : erroSalv}
              </span>
            )}
            <button
              onClick={() => {
                logout();
                location.reload();
              }}
              className="text-xs text-muted hover:text-red-400 transition-colors px-3 py-1.5 rounded border border-app hover:border-red-500/50"
              title="Sair do painel"
            >
              ↪ Sair
            </button>
          </div>
        </div>

        {/* Painel de estatísticas */}
        {carregado && lista.length > 0 && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-card border border-app rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-app">{stats.total}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Cadastrados
              </p>
            </div>
            <div className="bg-card border border-green-600/40 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.ativos}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Ativos hoje
              </p>
            </div>
            <div className="bg-card border border-blue-600/40 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.visiveis}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Visíveis
              </p>
            </div>
            <div className="bg-card border border-app rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-muted">{stats.ocultos}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Ocultos
              </p>
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="mb-6 p-3 sm:p-4 bg-card border border-app rounded-xl">
          <p className="text-xs text-muted uppercase tracking-wider mb-2 font-bold">
            ⚡ Ações rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={ativarTodos}
              className="text-xs sm:text-sm bg-green-600 text-white border border-green-700 px-3 py-1.5 rounded-lg hover:bg-green-700 flex-1 sm:flex-none font-semibold"
            >
              <span className="hidden sm:inline">✓ Iniciar dia (ativar todos)</span>
              <span className="sm:hidden">✓ Iniciar dia</span>
            </button>
            <button
              onClick={desativarTodos}
              className="text-xs sm:text-sm bg-strong-app text-app border border-strong-app px-3 py-1.5 rounded-lg hover:bg-gray-300 flex-1 sm:flex-none font-semibold"
            >
              <span className="hidden sm:inline">○ Encerrar dia (desativar todos)</span>
              <span className="sm:hidden">○ Encerrar dia</span>
            </button>
            <button
              onClick={visiveisTodos}
              className="text-xs sm:text-sm bg-blue-600 text-white border border-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex-1 sm:flex-none font-semibold"
            >
              <span className="hidden sm:inline">👁 Mostrar todos</span>
              <span className="sm:hidden">👁 Mostrar</span>
            </button>
            <button
              onClick={() => setShowHelp((s) => !s)}
              className="text-xs sm:text-sm bg-ponsse-yellow text-ponsse-black border border-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-400 sm:ml-auto font-semibold"
            >
              {showHelp ? "✕ Fechar" : "💡 Ajuda"}
            </button>
          </div>
        </div>

        {/* Painel de ajuda */}
        {showHelp && (
          <div className="mb-6 p-4 bg-yellow-500/5 border-2 border-yellow-500/30 rounded-xl text-sm text-app space-y-3">
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                👁 VISÍVEL / 🚫 OCULTO
              </p>
              <p className="text-muted">
                Controla se a pessoa <strong>aparece</strong> na página
                principal. Use &quot;Oculto&quot; para quem está de férias, saiu
                da empresa, ou simplesmente não deve receber ligação no momento.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                ● ATIVO / ○ INATIVO
              </p>
              <p className="text-muted">
                Funciona em conjunto com o horário. Pessoa <strong>Ativa</strong>{" "}
                + dentro do horário = aparece como Online (botão amarelo
                WhatsApp). Se o horário acabou, vira Offline (botão cinza).
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                ⏰ Horário de atendimento
              </p>
              <p className="text-muted">
                Defina o intervalo em que a pessoa pode ser contactada. Fora
                desse intervalo, ela continua visível mas o cliente não consegue
                clicar para falar.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">📷 Foto</p>
              <p className="text-muted">
                Envie uma foto pelo &quot;📷 Trocar foto&quot;. Ela é
                automaticamente compactada e salva no banco (Upstash) junto com
                os outros dados. Aparece para todos os clientes em todos os
                dispositivos.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                💾 Como funciona o salvamento
              </p>
              <p className="text-muted">
                As alterações ficam salvas no navegador que você está usando.
                Para ter os dados em outro computador, use o Chrome no mesmo
                perfil. Para salvar fotos de forma definitiva (servir para
                todos), siga o passo da foto acima e faça deploy.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                🔗 O que o cliente vê
              </p>
              <p className="text-muted">
                O cliente acessa apenas a página principal (
                <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs">
                  /
                </code>
                ). Lá aparecem <strong>somente</strong> os funcionários marcados
                como <strong>VISÍVEIS</strong>. O link desta página admin é
                secreto — não compartilhe com o cliente.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                🏷 Setores (categorias da mensagem)
              </p>
              <p className="text-muted">
                Cadastre os <strong>assuntos</strong> que o cliente pode
                escolher ao abrir um contato (ex: &quot;Orçamento de peças&quot;,
                &quot;Assistência técnica&quot;, &quot;Outros&quot;). Esses
                assuntos entram no início da mensagem do WhatsApp para o
                funcionário já entender do que se trata.
              </p>
            </div>
          </div>
        )}

        {/* Gerenciador de setores */}
        <ConfigAtendimento config={config} onChange={atualizarConfig} />

        <SetoresManager setores={setores} onChange={atualizarSetores} />

        {/* Adicionar novo */}
        <div className="bg-card border-2 border-ponsse-yellow/30 rounded-2xl p-4 mb-6">
          <h2 className="text-lg font-bold text-ponsse-yellow mb-3">
            + Adicionar novo funcionário
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Nome completo"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              className="bg-app border border-app rounded-lg px-3 py-2 text-white"
            />
            {setores.length > 0 ? (
              <select
                value={novo.setor}
                onChange={(e) => setNovo({ ...novo, setor: e.target.value })}
                className="bg-app border border-app rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione o setor</option>
                {setores.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Setor (ex: Logística)"
                value={novo.setor}
                onChange={(e) => setNovo({ ...novo, setor: e.target.value })}
                className="bg-app border border-app rounded-lg px-3 py-2 text-white"
              />
            )}
            <input
              placeholder="Telefone (ex: +55 11 99999-9999)"
              value={novo.telefone}
              onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
              className="bg-app border border-app rounded-lg px-3 py-2 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={novo.horarioInicio}
                onChange={(e) => setNovo({ ...novo, horarioInicio: e.target.value })}
                className="bg-app border border-app rounded-lg px-3 py-2 text-white"
              />
              <input
                type="time"
                value={novo.horarioFim}
                onChange={(e) => setNovo({ ...novo, horarioFim: e.target.value })}
                className="bg-app border border-app rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <button
            onClick={adicionar}
            className="mt-3 bg-ponsse-yellow text-ponsse-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-400"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de funcionários */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-app">
            Funcionários ({lista.length})
          </h2>
          <p className="text-xs text-subtle hidden sm:block">
            💡 Dica: &quot;Iniciar dia&quot; ativa todos de uma vez
          </p>
        </div>

        <div className="space-y-3">
          {carregado && lista.length === 0 && (
            <p className="text-center text-muted py-8">
              Nenhum funcionário cadastrado ainda. Use o formulário acima para
              adicionar o primeiro.
            </p>
          )}
          {lista.map((f) => (
            <AdminRow key={f.id} func={f} onChange={atualizar} onDelete={remover} />
          ))}
        </div>
      </main>
    </div>
  );
}
