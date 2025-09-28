import {Ondas} from "../clientFuncs"
import {CadastroLoginPag} from "./clientFuncsCadLog"
export const metadata = {
  title: 'Cadastro e Login',
  description: 'Crie sua conta e acesse a plataforma'
}

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden min-h-screen">
      <section className="flex-1 main-bg flex flex-row justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 relative">
          <div className="w-full max-w-lg sm:max-w-md lg:max-w-sm">
            <CadastroLoginPag />
          </div>
          <footer className="fixed mb-5 bottom-0 align-center">
            <a href="/" className="volta-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
          </svg>
        </a>
          </footer>
          <div className="-z-10">
            <Ondas />
          </div>
      </section> 
    </main>
  );
}
