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
export function Header(){
  return(
      <div className="fixed top-4 right-4 z-50 flex gap-3">
        {/* Botão Instagram */}
        <a href="#" className="social-btn">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
          </svg>
        </a>
        
        {/* Botão LinkedIn */}
        <a href="#" className="social-btn">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
          {/* Logo */}
          <div className="fixed top-4 left-4 ">
        <div className="logo-container hover:scale-100 ">
          <Image 
            src="/img/logo.png" 
            alt="EchoNova - Diagnóstico Inteligente de Treinamentos" 
            width={120} 
            height={40}
            className="h-13 w-auto object-contain"
            priority
          />
        </div>
      </div>
        
      </div>
      
      
  )
}