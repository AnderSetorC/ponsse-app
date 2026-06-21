"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  showAdminLink?: boolean;
};

export default function Header({ showAdminLink = false }: Props) {
  const [hoje, setHoje] = useState<string>("");

  useEffect(() => {
    // Usa a data completa
    setHoje(
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  return (
    <header className="border-b-4 border-ponsse-yellow bg-ponsse-black">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-28 h-10 sm:w-36 sm:h-12 flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Ponsse Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-[10px] text-gray-400 leading-tight">
              A logger&apos;s
            </p>
            <p className="text-sm font-bold text-ponsse-yellow leading-tight">
              BEST FRIEND
            </p>
            {hoje && (
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5 capitalize truncate">
                {hoje}
              </p>
            )}
          </div>
        </div>
        {showAdminLink ? (
          <Link
            href="/"
            className="text-xs sm:text-sm text-gray-400 hover:text-ponsse-yellow transition-colors px-3 py-2 rounded border border-gray-700 hover:border-ponsse-yellow flex-shrink-0"
          >
            <span className="hidden sm:inline">← Voltar para a página principal</span>
            <span className="sm:hidden">← Voltar</span>
          </Link>
        ) : null}
      </div>
      {/* Data no mobile (escondida no sm: pra não duplicar) */}
      {hoje && (
        <div className="sm:hidden border-t border-gray-800 px-4 py-1.5 text-center">
          <p className="text-[11px] text-gray-400 capitalize">{hoje}</p>
        </div>
      )}
    </header>
  );
}
