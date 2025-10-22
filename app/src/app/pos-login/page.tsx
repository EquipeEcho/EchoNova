import { Ondas, Header } from "../clientFuncs";
import Link from "next/link";
export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden min-h-screen">
      <Header />
      <section className="flex-1 main-bg flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 relative">
        {/* Título principal */}
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight max-w-4xl text-white mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
          Descubra os desafios da sua empresa e receba conteúdo sob medida
        </h1>

        {/* Subtítulo */}
        <p className="relative z-20 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl mb-8 sm:mb-10 md:mb-12 leading-relaxed animate-fade-in-up-delay poetic-text">
          Como uma maré que traz novas ondas, revelamos caminhos inexplorados
          para o crescimento da sua empresa através de insights inteligentes e
          soluções inovadoras.
        </p>

        {/* Botão principal com efeito gradiente */}
        <Link href="/form">
          <button type="submit" className="cursor-pointer px-6 xs:px-8 sm:px- py-3 xs:py-4 sm:py-5 bg-gradient-to-r from-fuchsia-700 to-fuchsia-800 rounded-lg text-base xs:text-lg sm:text-xl font-semibold text-white hover:from-fuchsia-800 hover:to-fuchsia-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in-up-delay-2 animate-pulse-glow touch-manipulation">
            Começar Diagnóstico
          </button>
        </Link>
        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main>
  );
}
