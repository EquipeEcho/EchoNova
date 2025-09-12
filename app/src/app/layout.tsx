import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Metadados SEO
export const metadata = {
  title: "EchoNova - Diagnóstico Inteligente de Treinamentos",
  description: "Sistema de diagnóstico inteligente para treinamentos corporativos desenvolvido em parceria com Entrenova",
  keywords: "treinamentos, diagnóstico, corporativo, entrenova, echoNova",
  icons: {
    icon: '/img/logo.png',
    apple: '/img/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
