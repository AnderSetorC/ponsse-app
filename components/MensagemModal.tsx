"use client";

import { useEffect, useState } from "react";
import { Funcionario } from "@/lib/types";
import { telefoneParaWaLink } from "@/lib/funcionarios";

type Props = {
  func: Funcionario;
  setoresDisponiveis: string[];
  onClose: () => void;
};

export default function MensagemModal({
  func,
  setoresDisponiveis,
  onClose,
}: Props) {
  const [setor, setSetor] = useState<string>("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    // Pré-seleciona o próprio setor do funcionário
    setSetor(func.setor);
    // Trava o scroll do body enquanto o modal está aberto
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [func.setor, onClose]);

  function enviar() {
    const data = new Date().toLocaleDateString("pt-BR");
    const hora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const linhas = [
      `Olá ${func.nome.split(" ")[0]},`,
      ``,
      `Estou entrando em contato pelo aplicativo de atendimento Ponsse.`,
      `Assunto: ${setor || "Geral"}`,
      ``,
      mensagem.trim() || "(sem mensagem adicional)",
      ``,
      `— Enviado em ${data} às ${hora}`,
    ];
    const texto = linhas.join("\n");
    const url = `${telefoneParaWaLink(func.telefone)}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-ponsse-dark border-t-4 sm:border-4 border-ponsse-yellow rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do modal */}
        <div className="p-5 border-b border-gray-700 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ponsse-yellow uppercase tracking-wider">
              Falar com
            </p>
            <h2 className="text-xl font-bold text-white truncate">
              {func.nome}
            </h2>
            <p className="text-sm text-gray-400">{func.setor}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-700"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Formulário */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Assunto / Setor
            </label>
            <select
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-ponsse-yellow focus:outline-none"
            >
              {setoresDisponiveis.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Resumo do que você precisa
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="Ex: Gostaria de um orçamento de peças para o harvester..."
              className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-ponsse-yellow focus:outline-none resize-none"
            />
            <p className="text-[10px] text-gray-500 mt-1 text-right">
              {mensagem.length}/400 caracteres
            </p>
          </div>

          {/* Preview da mensagem */}
          <div className="bg-ponsse-black/50 border border-gray-700 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
              Pré-visualização do WhatsApp
            </p>
            <p className="text-xs text-gray-300 whitespace-pre-line">
              {`Olá ${func.nome.split(" ")[0]},\n\n`}
              {`Estou entrando em contato pelo aplicativo de atendimento Ponsse.\n`}
              {`Assunto: ${setor || "Geral"}\n\n`}
              <span className="text-white">
                {mensagem.trim() || "(sua mensagem aparecerá aqui)"}
              </span>
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="p-5 pt-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            className="flex-[2] bg-ponsse-yellow text-ponsse-black font-bold py-3 rounded-lg hover:bg-yellow-400 active:scale-95"
          >
            Enviar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
