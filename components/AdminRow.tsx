"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Funcionario } from "@/lib/types";
import { corAvatar, getIniciais, novoId } from "@/lib/funcionarios";

type Props = {
  func: Funcionario;
  onChange: (f: Funcionario) => void;
  onDelete: (id: string) => void;
};

export default function AdminRow({ func, onChange, onDelete }: Props) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<Funcionario>(func);
  const fileRef = useRef<HTMLInputElement>(null);

  function salvar() {
    onChange(draft);
    setEdit(false);
  }

  function cancelar() {
    setDraft(func);
    setEdit(false);
  }

  function onUploadFoto(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange({ ...func, foto: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function baixarFoto() {
    if (!func.foto) return;
    const nomeArquivo = `${func.id}.jpg`;
    const a = document.createElement("a");
    a.href = func.foto;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="bg-ponsse-dark border border-gray-700 rounded-2xl p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Foto */}
        <div className="flex-shrink-0">
          {func.foto ? (
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-ponsse-yellow">
              <Image
                src={func.foto}
                alt={func.nome}
                width={80}
                height={80}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-ponsse-black border-2 border-ponsse-yellow"
              style={{ backgroundColor: corAvatar(func.nome) }}
            >
              {getIniciais(func.nome)}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 w-full">
          {!edit ? (
            <>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white">{func.nome}</h3>
                  <p className="text-sm text-ponsse-yellow">{func.setor}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  <button
                    onClick={() => onChange({ ...func, visivel: !func.visivel })}
                    className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full transition-all flex-1 sm:flex-none ${
                      func.visivel
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    title="Mostrar ou esconder na página principal"
                  >
                    {func.visivel ? "👁 VISÍVEL" : "🚫 OCULTO"}
                  </button>
                  <button
                    onClick={() => onChange({ ...func, ativo: !func.ativo })}
                    className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full transition-all flex-1 sm:flex-none ${
                      func.ativo
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    title="Ativar/desativar no horário configurado"
                  >
                    {func.ativo ? "● ATIVO" : "○ INATIVO"}
                  </button>
                  <button
                    onClick={() => {
                      setDraft(func);
                      setEdit(true);
                    }}
                    className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full bg-ponsse-yellow text-ponsse-black font-bold hover:bg-yellow-400 flex-1 sm:flex-none"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remover ${func.nome}?`)) onDelete(func.id);
                    }}
                    className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex-1 sm:flex-none"
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Telefone</span>
                  <p className="text-white break-all">{func.telefone}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Horário</span>
                  <p className="text-white">
                    {func.horarioInicio} - {func.horarioFim}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs">Foto</span>
                  <p className="text-white break-all">
                    {func.foto ? "✓ carregada" : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
                >
                  📷 Trocar foto
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadFoto(f);
                    if (e.target) e.target.value = "";
                  }}
                />
                {func.foto && (
                  <>
                    <button
                      onClick={baixarFoto}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                      title={`Baixa a foto como ${func.id}.jpg — coloque em public/fotos/`}
                    >
                      ⬇ Baixar foto
                    </button>
                    <button
                      onClick={() => onChange({ ...func, foto: undefined })}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                      Remover foto
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Nome</label>
                  <input
                    value={draft.nome}
                    onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
                    className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Setor</label>
                  <input
                    value={draft.setor}
                    onChange={(e) => setDraft({ ...draft, setor: e.target.value })}
                    className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Telefone</label>
                  <input
                    value={draft.telefone}
                    onChange={(e) => setDraft({ ...draft, telefone: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Início</label>
                    <input
                      type="time"
                      value={draft.horarioInicio}
                      onChange={(e) =>
                        setDraft({ ...draft, horarioInicio: e.target.value })
                      }
                      className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Fim</label>
                    <input
                      type="time"
                      value={draft.horarioFim}
                      onChange={(e) =>
                        setDraft({ ...draft, horarioFim: e.target.value })
                      }
                      className="w-full bg-ponsse-black border border-gray-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={salvar}
                  className="bg-ponsse-yellow text-ponsse-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-400"
                >
                  Salvar
                </button>
                <button
                  onClick={cancelar}
                  className="bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// helper exportado
export { novoId };
