"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import AdminRow from "@/components/AdminRow";
import SetoresManager from "@/components/SetoresManager";
import AdminLogin, {
  verificarAutenticado,
  logout,
} from "@/components/AdminLogin";
import { Funcionario } from "@/lib/types";
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
      <div className="min-h-screen flex items-center justify-center bg-ponsse-black">
        <p className="text-gray-400">Carregando...</p>
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
  const [carregado, setCarregado] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    setor: "",
    telefone: "",
    horarioInicio: "08:00",
    horarioFim: "18:00",
  });
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const [erroSalv, setErroSalv] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function carregar() {
      const dados = await carregarDados();
      setLista(dados.funcionarios);
      setSetores(dados.setores);
      setCarregado(true);
    }
    carregar();
  }, []);

  async function persistirFuncionarios(nova: Funcionario[]) {
    setLista(nova);
    const r = await salvarDados({ funcionarios: nova, setores });
    if (r.ok) {
      setSalvoEm(new Date().toLocaleTimeString("pt-BR"));
      setErroSalv(null);
      setTimeout(() => setSalvoEm(null), 2000);
    } else {
      setErroSalv(r.error || "Erro ao salvar");
      setTimeout(() => setErroSalv(null), 5000);
    }
  }

  function atualizar(func: Funcionario) {
    persistirFuncionarios(lista.map((f) => (f.id === func.id ? func : f)));
  }

  function remover(id: string) {
    if (!confirm("Remover este funcionário?")) return;
    persistirFuncionarios(lista.filter((f) => f.id !== id));
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
    persistirFuncionarios([...lista, f]);
    setNovo({
      nome: "",
      setor: "",
      telefone: "",
      horarioInicio: "08:00",
      horarioFim: "18:00",
    });
  }

  function ativarTodos() {
    persistirFuncionarios(lista.map((f) => ({ ...f, ativo: true })));
  }

  function desativarTodos() {
    persistirFuncionarios(lista.map((f) => ({ ...f, ativo: false })));
  }

  function visiveisTodos() {
    persistirFuncionarios(lista.map((f) => ({ ...f, visivel: true })));
  }

  async function atualizarSetores(novos: string[]) {
    setSetores(novos);
    const r = await salvarDados({ funcionarios: lista, setores: novos });
    if (r.ok) {
      setSalvoEm(new Date().toLocaleTimeString("pt-BR"));
      setErroSalv(null);
      setTimeout(() => setSalvoEm(null), 2000);
    } else {
      setErroSalv(r.error || "Erro ao salvar");
      setTimeout(() => setErroSalv(null), 5000);
    }
  }

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
            <h1 className="text-xl sm:text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Configure quem está disponível para atendimento
            </p>
          </div>
          <div className="flex items-center gap-2">
            {salvoEm && (
              <span className="text-xs text-green-400 animate-pulse">
                ✓ Salvo às {salvoEm}
              </span>
            )}
            {erroSalv && (
              <span className="text-xs text-red-400" title={erroSalv}>
                ✕ {erroSalv.length > 40 ? erroSalv.slice(0, 40) + "..." : erroSalv}
              </span>
            )}
            <button
              onClick={() => {
                logout();
                location.reload();
              }}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded border border-gray-700 hover:border-red-500/50"
              title="Sair do painel"
            >
              ↪ Sair
            </button>
          </div>
        </div>

        {/* Painel de estatísticas */}
        {carregado && lista.length > 0 && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-ponsse-dark border border-gray-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Cadastrados
              </p>
            </div>
            <div className="bg-ponsse-dark border border-green-500/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.ativos}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Ativos hoje
              </p>
            </div>
            <div className="bg-ponsse-dark border border-blue-500/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.visiveis}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Visíveis
              </p>
            </div>
            <div className="bg-ponsse-dark border border-gray-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-400">{stats.ocultos}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Ocultos
              </p>
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="mb-6 p-3 sm:p-4 bg-ponsse-dark border border-gray-700 rounded-xl">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">
            ⚡ Ações rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={ativarTodos}
              className="text-xs sm:text-sm bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">✓ Iniciar dia (ativar todos)</span>
              <span className="sm:hidden">✓ Iniciar dia</span>
            </button>
            <button
              onClick={desativarTodos}
              className="text-xs sm:text-sm bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-600 flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">○ Encerrar dia (desativar todos)</span>
              <span className="sm:hidden">○ Encerrar dia</span>
            </button>
            <button
              onClick={visiveisTodos}
              className="text-xs sm:text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">👁 Mostrar todos</span>
              <span className="sm:hidden">👁 Mostrar</span>
            </button>
            <button
              onClick={() => setShowHelp((s) => !s)}
              className="text-xs sm:text-sm bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg hover:bg-yellow-500/30 sm:ml-auto"
            >
              {showHelp ? "✕ Fechar" : "💡 Ajuda"}
            </button>
          </div>
        </div>

        {/* Painel de ajuda */}
        {showHelp && (
          <div className="mb-6 p-4 bg-yellow-500/5 border-2 border-yellow-500/30 rounded-xl text-sm text-gray-200 space-y-3">
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                👁 VISÍVEL / 🚫 OCULTO
              </p>
              <p className="text-gray-300">
                Controla se a pessoa <strong>aparece</strong> na página
                principal. Use &quot;Oculto&quot; para quem está de férias, saiu
                da empresa, ou simplesmente não deve receber ligação no momento.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                ● ATIVO / ○ INATIVO
              </p>
              <p className="text-gray-300">
                Funciona em conjunto com o horário. Pessoa <strong>Ativa</strong>{" "}
                + dentro do horário = aparece como Online (botão amarelo
                WhatsApp). Se o horário acabou, vira Offline (botão cinza).
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                ⏰ Horário de atendimento
              </p>
              <p className="text-gray-300">
                Defina o intervalo em que a pessoa pode ser contactada. Fora
                desse intervalo, ela continua visível mas o cliente não consegue
                clicar para falar.
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">📷 Foto</p>
              <p className="text-gray-300">
                Envie uma foto pelo &quot;Trocar foto&quot;. Ela fica salva neste
                navegador. Para que apareça em todos os dispositivos, use
                &quot;⬇ Baixar foto&quot;, mova o arquivo para{" "}
                <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs">
                  public/fotos/
                </code>{" "}
                do projeto e edite o campo Foto para{" "}
                <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs">
                  /fotos/1.jpg
                </code>
                .
              </p>
            </div>
            <div>
              <p className="font-bold text-ponsse-yellow mb-1">
                💾 Como funciona o salvamento
              </p>
              <p className="text-gray-300">
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
              <p className="text-gray-300">
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
              <p className="text-gray-300">
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
        <SetoresManager setores={setores} onChange={atualizarSetores} />

        {/* Adicionar novo */}
        <div className="bg-ponsse-dark border-2 border-ponsse-yellow/30 rounded-2xl p-4 mb-6">
          <h2 className="text-lg font-bold text-ponsse-yellow mb-3">
            + Adicionar novo funcionário
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Nome completo"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              className="bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
            {setores.length > 0 ? (
              <select
                value={novo.setor}
                onChange={(e) => setNovo({ ...novo, setor: e.target.value })}
                className="bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
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
                className="bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            )}
            <input
              placeholder="Telefone (ex: +55 11 99999-9999)"
              value={novo.telefone}
              onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
              className="bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={novo.horarioInicio}
                onChange={(e) => setNovo({ ...novo, horarioInicio: e.target.value })}
                className="bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
              <input
                type="time"
                value={novo.horarioFim}
                onChange={(e) => setNovo({ ...novo, horarioFim: e.target.value })}
                className="bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
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
          <h2 className="text-lg font-bold text-white">
            Funcionários ({lista.length})
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block">
            💡 Dica: &quot;Iniciar dia&quot; ativa todos de uma vez
          </p>
        </div>

        <div className="space-y-3">
          {carregado && lista.length === 0 && (
            <p className="text-center text-gray-400 py-8">
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
