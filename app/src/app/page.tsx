import {Ondas,Header} from "./layout"
export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Header/>
      <section className="flex-1 main-bg flex flex-col h-100vh items-center text-center">
        {/* Título principal */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold leading-tight max-w-5xl text-white md:pt-24 mb-6 sm:mb-8 animate-fade-in-up">
          Descubra os desafios da sua empresa e receba conteúdo sob medida
        </h1>
        
        {/* Subtítulo */}
        <p className="relative z-20 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 sm:mb-12 leading-relaxed px-2 animate-fade-in-up-delay poetic-text">
          Como uma maré que traz novas ondas, revelamos caminhos inexplorados para o crescimento da sua empresa através de insights inteligentes e soluções inovadoras.
        </p>
        
        {/* Botão principal com efeito gradiente */}
        <button className="opacity-100 hover:opacity-100 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-fuchsia-700 to-fuchsia-800 rounded-lg text-lg sm:text-xl font-semibold text-white hover:from-fuchsia-850 hover:to-fuchsia-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in-up-delay-2 animate-pulse-glow">
          Começar Diagnóstico
        </button>
          <div className="-z-10">
            <Ondas />
          </div>
          
      </section> 
    </main>
  );
}
