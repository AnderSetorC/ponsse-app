"use client";

import { useState } from "react";

type Props = {
  setores: string[];
  onChange: (novos: string[]) => void;
};

export default function SetoresManager({ setores, onChange }: Props) {
  const [novo, setNovo] = useState("");

  function adicionar() {
    const v = novo.trim();
    if (!v) return;
    if (setores.includes(v)) {
      alert("Esse setor já existe.");
      return;
    }
    onChange([...setores, v]);
    setNovo("");
  }

  function remover(setor: string) {
    if (!confirm(`Remover o setor "${setor}"?`)) return;
    onChange(setores.filter((s) => s !== setor));
  }

  return (
    <div className="bg-card border border-app rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-ponsse-yellow">
            🏷 Setores
          </h2>
          <p className="text-xs text-muted">
            Categorias que o cliente escolhe antes de enviar a mensagem
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {setores.length === 0 && (
          <p className="text-sm text-subtle">Nenhum setor cadastrado.</p>
        )}
        {setores.map((s) => (
          <div
            key={s}
            className="flex items-center gap-1.5 bg-input border border-app rounded-full pl-3 pr-1 py-1"
          >
            <span className="text-sm text-app">{s}</span>
            <button
              onClick={() => remover(s)}
              className="w-6 h-6 rounded-full text-muted hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-lg leading-none"
              title={`Remover ${s}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") adicionar();
          }}
          placeholder="Novo setor (ex: Assistência técnica)"
          className="flex-1 bg-input border border-app rounded-lg px-3 py-2 text-app"
        />
        <button
          onClick={adicionar}
          className="bg-ponsse-yellow text-ponsse-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-400"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
