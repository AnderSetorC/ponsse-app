"use client";

import { Config } from "@/lib/types";

type Props = {
  config: Config;
  onChange: (c: Config) => void;
};

export default function ConfigAtendimento({ config, onChange }: Props) {
  return (
    <div className="bg-card border-2 border-ponsse-yellow/30 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-ponsse-yellow">
            ⚙️ Forma de atendimento
          </h2>
          <p className="text-xs text-muted">
            Como o cliente entra em contato com o funcionário
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Toggle: modal ou direto */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onChange({ ...config, modalHabilitado: false })}
            className={`flex-1 min-w-[200px] text-sm px-3 py-3 rounded-lg border-2 transition-all text-left ${
              !config.modalHabilitado
                ? "bg-ponsse-yellow text-ponsse-black border-yellow-500 font-bold"
                : "bg-input text-app border-app hover:border-ponsse-yellow"
            }`}
          >
            <div className="font-bold mb-0.5">⚡ Direto pro WhatsApp</div>
            <div
              className={`text-[11px] ${
                !config.modalHabilitado ? "text-ponsse-black" : "text-muted"
              }`}
            >
              Abre o WhatsApp com a mensagem padrão abaixo
            </div>
          </button>
          <button
            onClick={() => onChange({ ...config, modalHabilitado: true })}
            className={`flex-1 min-w-[200px] text-sm px-3 py-3 rounded-lg border-2 transition-all text-left ${
              config.modalHabilitado
                ? "bg-ponsse-yellow text-ponsse-black border-yellow-500 font-bold"
                : "bg-input text-app border-app hover:border-ponsse-yellow"
            }`}
          >
            <div className="font-bold mb-0.5">📝 Com formulário</div>
            <div
              className={`text-[11px] ${
                config.modalHabilitado ? "text-ponsse-black" : "text-muted"
              }`}
            >
              Mostra modal com escolha de setor + resumo
            </div>
          </button>
        </div>

        {/* Mensagem padrão (só quando modal está OFF) */}
        {!config.modalHabilitado && (
          <div>
            <label className="text-xs text-muted">
              Mensagem padrão (enviada quando o cliente clica em &quot;Falar
              agora&quot;)
            </label>
            <textarea
              value={config.mensagemPadrao}
              onChange={(e) =>
                onChange({ ...config, mensagemPadrao: e.target.value })
              }
              rows={3}
              maxLength={300}
              className="w-full mt-1 bg-input border border-app rounded-lg px-3 py-2 text-app focus:border-ponsse-yellow focus:outline-none resize-none"
              placeholder="Ex: Olá, vim pelo aplicativo de atendimento Ponsse!"
            />
            <p className="text-[10px] text-subtle mt-1 text-right">
              {config.mensagemPadrao.length}/300 caracteres
            </p>
            <div className="mt-2 bg-input/50 border border-app rounded-lg p-2">
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-1">
                Pré-visualização
              </p>
              <p className="text-xs text-app whitespace-pre-line">
                {config.mensagemPadrao || "(mensagem aparecerá aqui)"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
