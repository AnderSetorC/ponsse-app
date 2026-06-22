"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  showAdminLink?: boolean;
};

export default function Header({ showAdminLink = false }: Props) {
  const [hoje, setHoje] = useState<string>("");

  useEffect(() => {
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
    <header className="border-b-4 border-ponsse-yellow bg-ponsse-header">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-28 h-10 sm:w-36 sm:h-12 flex-shrink-0 bg-white rounded px-1">
            <Image
              src="/logo.jpg"
              alt="Ponsse Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-[10px] text-muted leading-tight">
              A logger&apos;s
            </p>
            <p className="text-sm font-bold text-ponsse-yellow leading-tight">
              BEST FRIEND
            </p>
            {hoje && (
              <p className="text-[10px] text-subtle leading-tight mt-0.5 capitalize truncate">
                {hoje}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showAdminLink ? (
            <Link
              href="/"
              className="text-xs sm:text-sm text-muted hover:text-ponsse-yellow transition-colors px-3 py-2 rounded border border-app hover:border-ponsse-yellow"
            >
              <span className="hidden sm:inline">← Voltar para a página principal</span>
              <span className="sm:hidden">← Voltar</span>
            </Link>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
      {/* Data no mobile (escondida no sm: pra não duplicar) */}
      {hoje && (
        <div className="sm:hidden border-t border-app px-4 py-1.5 text-center">
          <p className="text-[11px] text-muted capitalize">{hoje}</p>
        </div>
      )}
    </header>
  );
}