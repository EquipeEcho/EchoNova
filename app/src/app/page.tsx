import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      
      {/* Conteúdo principal com fundo gradiente - ajuste para footer fixo */}
      <section className="flex-1 main-bg flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 md:py-24 pb-24">
        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight max-w-5xl text-white mb-6 sm:mb-8 animate-fade-in-up">
          Descubra os desafios da sua empresa e receba conteúdo sob medida
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 sm:mb-12 leading-relaxed px-2 animate-fade-in-up-delay">
          Diagnóstico inteligente para treinamentos corporativos com IA offline
        </p>
        
        {/* Botão principal com efeito gradiente */}
        <button className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-lg sm:text-xl font-semibold text-white hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in-up-delay-2 animate-pulse-glow">
          Começar Diagnóstico
        </button>
      </section>

      {/* Footer fixo na parte inferior - transparente */}
      <footer className="fixed bottom-0 left-0 right-0 z-10">
        <nav className="flex justify-between items-center p-4 sm:p-6 max-w-7xl mx-auto">
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
        </nav>
      </footer>
    </main>
  );
}
