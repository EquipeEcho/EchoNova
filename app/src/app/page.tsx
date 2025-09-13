import {Footer,Ondas} from "./layout"
export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <section className="flex-1 main-bg flex flex-col h-100vh items-center text-center sm:p-30 md:pt-24">
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
          <Footer />
          <div className="-z-10">
            <Ondas />
          </div>
          
      </section> 
    </main>
  );
}
