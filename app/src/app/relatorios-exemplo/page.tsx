"use client";
import { useState } from "react";
import Link from "next/link";
import { Ondas } from "../clientFuncs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, TrendingUpIcon, UsersIcon, TargetIcon, ArrowRightIcon } from "lucide-react";

// Dados mockados para relatórios de exemplo
const relatoriosExemplo = [
  {
    id: 1,
    empresa: "TechStart Solutions",
    setor: "Tecnologia",
    porte: "Pequena (10-50 funcionários)",
    diagnostico: {
      resumo: "Empresa em crescimento com forte foco em inovação, mas com gaps em gestão de pessoas e processos operacionais.",
      dimensoes: [
        { nome: "Pessoas e Cultura", score: 7.2, status: "Bom", cor: "text-green-400" },
        { nome: "Estrutura e Operações", score: 5.8, status: "Atenção", cor: "text-yellow-400" },
        { nome: "Direção e Futuro", score: 8.1, status: "Excelente", cor: "text-green-400" },
        { nome: "Mercado e Clientes", score: 6.5, status: "Regular", cor: "text-orange-400" }
      ],
      trilhasRecomendadas: [
        "Liderança Transformacional",
        "Gestão de Processos Ágeis",
        "Desenvolvimento de Equipes"
      ],
      pontosFortes: [
        "Visão estratégica clara",
        "Inovação tecnológica",
        "Equipe jovem e motivada"
      ],
      pontosMelhoria: [
        "Processos operacionais desorganizados",
        "Falta de métricas de performance",
        "Comunicação interna limitada"
      ]
    }
  },
  {
    id: 2,
    empresa: "Construtora Horizonte",
    setor: "Construção Civil",
    porte: "Média (51-200 funcionários)",
    diagnostico: {
      resumo: "Empresa tradicional com experiência sólida, mas precisa modernizar práticas de gestão e adotar tecnologias digitais.",
      dimensoes: [
        { nome: "Pessoas e Cultura", score: 6.8, status: "Regular", cor: "text-orange-400" },
        { nome: "Estrutura e Operações", score: 7.5, status: "Bom", cor: "text-green-400" },
        { nome: "Direção e Futuro", score: 5.2, status: "Atenção", cor: "text-yellow-400" },
        { nome: "Mercado e Clientes", score: 8.2, status: "Excelente", cor: "text-green-400" }
      ],
      trilhasRecomendadas: [
        "Transformação Digital",
        "Gestão Estratégica",
        "Inovação em Processos"
      ],
      pontosFortes: [
        "Reputação no mercado",
        "Equipe técnica qualificada",
        "Rede de contatos estabelecida"
      ],
      pontosMelhoria: [
        "Resistência a mudanças tecnológicas",
        "Planejamento estratégico limitado",
        "Falta de indicadores de performance"
      ]
    }
  },
  {
    id: 3,
    empresa: "EducaPlus",
    setor: "Educação",
    porte: "Pequena (10-50 funcionários)",
    diagnostico: {
      resumo: "Instituição educacional com foco no desenvolvimento humano, mas com desafios em gestão financeira e expansão.",
      dimensoes: [
        { nome: "Pessoas e Cultura", score: 8.5, status: "Excelente", cor: "text-green-400" },
        { nome: "Estrutura e Operações", score: 6.2, status: "Regular", cor: "text-orange-400" },
        { nome: "Direção e Futuro", score: 7.8, status: "Bom", cor: "text-green-400" },
        { nome: "Mercado e Clientes", score: 5.9, status: "Atenção", cor: "text-yellow-400" }
      ],
      trilhasRecomendadas: [
        "Gestão Financeira",
        "Marketing Educacional",
        "Expansão Estratégica"
      ],
      pontosFortes: [
        "Equipe pedagógica dedicada",
        "Metodologia inovadora",
        "Foco no desenvolvimento integral"
      ],
      pontosMelhoria: [
        "Gestão financeira desorganizada",
        "Marketing limitado",
        "Planejamento de crescimento insuficiente"
      ]
    }
  }
];

export default function RelatoriosExemploPage() {
  const [selectedRelatorio, setSelectedRelatorio] = useState<number | null>(null);

  return (
    <main className="flex flex-col overflow-hidden min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur border-b border-pink-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-white font-bold text-xl">EchoNova</span>
            </Link>
            <Link href="/form">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white border-0 shadow-lg hover:shadow-xl">
                Fazer Meu Diagnóstico
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 main-bg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 relative">
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
            Veja Como Seu Relatório de Diagnóstico Pode Ser
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Conheça exemplos reais de relatórios gerados pela nossa plataforma.
            Descubra insights valiosos sobre o desempenho da sua empresa e receba
            recomendações personalizadas para acelerar seu crescimento.
          </p>
        </div>

        {/* Relatórios Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {relatoriosExemplo.map((relatorio) => (
            <Card
              key={relatorio.id}
              className="bg-slate-900/95 backdrop-blur border-slate-700/60 hover:border-pink-500/60 transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedRelatorio(selectedRelatorio === relatorio.id ? null : relatorio.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-pink-500/60 text-pink-400">
                    {relatorio.setor}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {relatorio.porte}
                  </Badge>
                </div>
                <CardTitle className="text-white group-hover:text-pink-400 transition-colors">
                  {relatorio.empresa}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {relatorio.diagnostico.resumo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Scores das Dimensões */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <TargetIcon className="w-4 h-4" />
                      Pontuação por Dimensão
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {relatorio.diagnostico.dimensoes.slice(0, 2).map((dim, idx) => (
                        <div key={idx} className="text-center p-2 bg-slate-800/50 rounded">
                          <div className={`text-lg font-bold ${dim.cor}`}>{dim.score}</div>
                          <div className="text-xs text-slate-400">{dim.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trilhas Recomendadas */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4" />
                      Trilhas Recomendadas
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {relatorio.diagnostico.trilhasRecomendadas.slice(0, 2).map((trilha, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-pink-500/60 text-pink-400 bg-pink-500/10">
                          {trilha}
                        </Badge>
                      ))}
                      {relatorio.diagnostico.trilhasRecomendadas.length > 2 && (
                        <Badge variant="outline" className="text-xs border-pink-500/60 text-pink-400 bg-pink-500/10">
                          +{relatorio.diagnostico.trilhasRecomendadas.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white border-0 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRelatorio(selectedRelatorio === relatorio.id ? null : relatorio.id);
                    }}
                  >
                    {selectedRelatorio === relatorio.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalhes Expandidos */}
        {selectedRelatorio && (
          <Card className="w-full max-w-4xl bg-slate-900/95 backdrop-blur border-slate-700/60 mb-16">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Relatório Completo - {relatoriosExemplo.find(r => r.id === selectedRelatorio)?.empresa}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const rel = relatoriosExemplo.find(r => r.id === selectedRelatorio)!;
                return (
                  <>
                    {/* Dimensões Detalhadas */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5" />
                        Análise por Dimensão
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rel.diagnostico.dimensoes.map((dim, idx) => (
                          <div key={idx} className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-slate-200">{dim.nome}</h4>
                              <Badge className={`${dim.cor} bg-transparent border-current`}>
                                {dim.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(dim.score / 10) * 100}%` }}
                                />
                              </div>
                              <span className={`font-bold ${dim.cor}`}>{dim.score}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pontos Fortes e Melhoria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          Pontos Fortes
                        </h3>
                        <ul className="space-y-2">
                          {rel.diagnostico.pontosFortes.map((ponto, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300">
                              <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              {ponto}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                          <TrendingUpIcon className="w-5 h-5" />
                          Áreas de Melhoria
                        </h3>
                        <ul className="space-y-2">
                          {rel.diagnostico.pontosMelhoria.map((ponto, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300">
                              <TargetIcon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                              {ponto}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Trilhas Recomendadas Detalhadas */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Trilhas de Aprendizagem Recomendadas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {rel.diagnostico.trilhasRecomendadas.map((trilha, idx) => (
                          <div key={idx} className="p-4 bg-linear-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg">
                            <h4 className="font-medium text-white mb-2">{trilha}</h4>
                            <p className="text-sm text-slate-400">
                              Programa personalizado para desenvolver competências específicas da sua equipe.
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Pronto para descobrir o potencial da sua empresa?
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Faça seu diagnóstico personalizado e receba um relatório completo com
            insights estratégicos e trilhas de desenvolvimento sob medida.
          </p>
          <Link href="/form">
            <Button size="lg" className="bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Começar Meu Diagnóstico Gratuito
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main>
  );
}