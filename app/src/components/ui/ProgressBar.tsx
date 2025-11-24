"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  currentQuestion?: number;
  totalQuestions?: number;
}

/**
 * @description Um componente visual para exibir o progresso em um formulário multi-etapas.
 * Mostra a etapa atual, o total de etapas e uma barra de progresso com as cores da marca.
 * @param currentStep O índice da etapa atual (começando em 0).
 * @param totalSteps O número total de etapas.
 * @param stepTitle Título descritivo da etapa atual (opcional).
 * @param currentQuestion Número da pergunta atual dentro da etapa (opcional).
 * @param totalQuestions Total de perguntas dentro da etapa (opcional).
 */
export function ProgressBar({ currentStep, totalSteps, stepTitle, currentQuestion, totalQuestions }: ProgressBarProps) {
  // Calcula a porcentagem de progresso.
  // Usamos Math.min e Math.max para garantir que o valor fique sempre entre 0 e 100, evitando bugs visuais.
  const percentage = Math.min(100, Math.max(0, Math.round(((currentStep + 1) / totalSteps) * 100)));

  return (
    <div className="mb-8 w-full">
      {/* Título da etapa (se disponível) */}
      {stepTitle && (
        <div className="mb-2 text-center">
          <h3 className="text-sm font-semibold text-pink-400">{stepTitle}</h3>
        </div>
      )}
      
      {/* Container para o texto informativo (ex: "Etapa 1 de 7 | 14%") */}
      <div className="flex justify-between mb-2 text-sm font-medium text-neutral-300">
        <span>
          Pergunta {currentStep + 1} de {totalSteps}
          {currentQuestion && totalQuestions && (
            <span className="text-slate-400 ml-2">
              ({currentQuestion}/{totalQuestions} desta etapa)
            </span>
          )}
        </span>
        <span>{percentage}%</span>
      </div>
      
      {/* A barra de progresso visual */}
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        {/* A parte preenchida da barra, que cresce com base na porcentagem */}
        <div
          className="bg-linear-to-r from-pink-500 to-pink-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}