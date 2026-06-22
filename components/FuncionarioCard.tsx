"use client";

import Image from "next/image";
import { useState } from "react";
import { Funcionario } from "@/lib/types";
import {
  corAvatar,
  estaDisponivel,
  getIniciais,
} from "@/lib/funcionarios";
import MensagemModal from "./MensagemModal";

export default function FuncionarioCard({
  func,
  agora,
  setoresDisponiveis,
}: {
  func: Funcionario;
  agora: Date;
  setoresDisponiveis: string[];
}) {
  const disponivel = estaDisponivel(func, agora);
  const [modalAberto, setModalAberto] = useState(false);

  function handleClick() {
    if (!disponivel) return;
    setModalAberto(true);
  }

  return (
    <>
      <div
        className={`relative bg-ponsse-dark rounded-2xl border-2 overflow-hidden transition-all ${
          disponivel
            ? "border-green-500 shadow-lg shadow-green-500/20 hover:scale-[1.02] cursor-pointer"
            : "border-gray-700 opacity-70"
        }`}
        onClick={handleClick}
        role={disponivel ? "button" : undefined}
      >
        {/* Status indicator */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-2 bg-ponsse-black/80 backdrop-blur-sm px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
          <span
            className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${
              disponivel ? "bg-green-500 pulse-online" : "bg-gray-500"
            }`}
          />
          <span
            className={`text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider ${
              disponivel ? "text-green-400" : "text-gray-500"
            }`}
          >
            {disponivel ? "Online" : "Offline"}
          </span>
        </div>

        <div className="p-3 sm:p-6 flex flex-col items-center text-center">
          {/* Foto / Avatar */}
          <div className="mb-2 sm:mb-4 relative">
            {func.foto ? (
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-ponsse-yellow">
                <Image
                  src={func.foto}
                  alt={func.nome}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-ponsse-black border-4 border-ponsse-yellow"
                style={{ backgroundColor: corAvatar(func.nome) }}
              >
                {getIniciais(func.nome)}
              </div>
            )}
          </div>

          {/* Nome e Setor */}
          <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1 leading-tight px-1">
            {func.nome}
          </h3>
          <p className="text-xs sm:text-sm text-ponsse-yellow font-medium mb-2 sm:mb-3">
            {func.setor}
          </p>

          {/* Horário - só mostra no tablet+ */}
          <p className="hidden sm:block text-xs text-gray-400 mb-4">
            Horário: {func.horarioInicio} - {func.horarioFim}
          </p>

          {/* Botão de ligar / WhatsApp */}
          <div
            className={`w-full py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              disponivel
                ? "bg-ponsse-yellow text-ponsse-black hover:bg-yellow-400 active:scale-95"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {disponivel ? "Falar agora" : "Indisponível"}
          </div>

          {/* Telefone - só no tablet+ */}
          <p className="hidden sm:block text-[10px] text-gray-500 mt-2 break-all">
            {func.telefone}
          </p>
        </div>
      </div>

      {modalAberto && (
        <MensagemModal
          func={func}
          setoresDisponiveis={setoresDisponiveis}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}
