import "./globals.css";
import { Inter } from "next/font/google";
import Image from "next/image";

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

export function Footer (){
  return  (
      <footer className="fixed bottom-0 left-0 flex justify-between items-center py-4 px-8 sm:py-6 sm:px-12 w-screen">{/* Footer fixo na parte inferior - transparente */}
          {/* Menu desktop */}
          <ul className="hidden md:flex gap-6 lg:gap-8 font-medium text-white">
            <li>
              <a href="#servicos" className="hover:text-pink-300 transition-colors duration-300 cursor-pointer">
                Serviços
              </a>
            </li>
            <li>
              <a href="#recursos" className="hover:text-pink-300 transition-colors duration-300 cursor-pointer">
                Recursos
              </a>
            </li>
            <li>
              <a href="#contato" className="hover:text-pink-300 transition-colors duration-300 cursor-pointer">
                Contato
              </a>
            </li>
          </ul>

          {/* Logo */}
          <div className="logo-container">
            <Image 
              src="/img/logo.png" 
              alt="EchoNova - Diagnóstico Inteligente de Treinamentos" 
              width={120} 
              height={40}
              className="h-6 w-auto xs:h-7 sm:h-8 md:h-6 lg:h-8 xl:h-10 object-contain"
              priority
            />
          </div>

          {/* Menu mobile - à esquerda */}
          <button className="md:hidden text-white hover:text-pink-300 transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
      </footer>)
}

export function Ondas(){
  return (<svg className="fixed bottom-0 left-0 z-0 h-250" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
    <path fill="#ff0055" fillOpacity={0.4}>
    <animate 
      attributeName="d" 
      dur="10s" 
      repeatCount="indefinite"
      values="
        M0,160 Q360,260 720,160 T1440,160 V320 H0 Z;
        M0,200 Q360,60 720,200 T1440,200 V320 H0 Z;
        M0,160 Q360,260 720,160 T1440,160 V320 H0 Z
      " />
  </path>


  <path fill="#ff3366" fillOpacity={0.6}>
    <animate 
      attributeName="d" 
      dur="14s" 
      repeatCount="indefinite"
      values="
        M0,180 Q360,300 720,180 T1440,180 V320 H0 Z;
        M0,220 Q360,100 720,220 T1440,220 V320 H0 Z;
        M0,180 Q360,300 720,180 T1440,180 V320 H0 Z
      " />
  </path>
  <path fill="#ff6699" fillOpacity={0.5}>
    <animate 
      attributeName="d" 
      dur="18s" 
      repeatCount="indefinite"
      values="
        M0,200 Q360,350 720,200 T1440,200 V320 H0 Z;
        M0,240 Q360,120 720,240 T1440,240 V320 H0 Z;
        M0,200 Q360,350 720,200 T1440,200 V320 H0 Z
      " />
  </path>
  </svg>)
}