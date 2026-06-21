import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ponsse - Quem está disponível",
  description: "Lista de funcionários disponíveis para atendimento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
