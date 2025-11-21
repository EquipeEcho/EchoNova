"use client";

import { useState, useEffect } from "react"; // Removido o useRef
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { jsPDF } from "jspdf"; // Apenas o jsPDF é necessário
import { Ondas } from "@/app/clientFuncs";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Save, ArrowLeft } from "lucide-react";

interface Diagnostico {
  _id: string;
  finalReport: string;
  empresa: string;
  createdAt: string;
}

export default function ResultadoDiagnosticoPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDiagnostico = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/diagnostico-aprofundado/${id}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Falha ao carregar diagnóstico.");
          }
          const data = await res.json();
          setDiagnostico(data);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
        }
      };
      fetchDiagnostico();
    }
  }, [id]);

  /**
   * @description Gera um PDF de alta qualidade a partir de um texto Markdown.
   * A função interpreta manualmente os elementos do Markdown (títulos, listas, etc.)
   * e os desenha no PDF, aplicando um tema escuro e lidando com quebra de página.
   */
  const handleDownloadPdf = () => {
  if (!diagnostico?.finalReport) return;

  toast.info("Gerando seu relatório em PDF...");

  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // --- 1. CONFIGURAÇÕES E CONSTANTES ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const textWidth = pageWidth - margin * 2;
    let y = margin + 10; 
    const lineHeightBase = 5; 

    // --- FUNÇÕES AUXILIARES ---

    // FUNÇÃO AUXILIAR PARA IMPRIMIR TEXTO COM MARKDOWN INLINE (NEGITO) E QUEBRA DE LINHA CORRETA
    const printMarkdownText = (
        text: string, 
        currentY: number, 
        currentX: number, 
        maxWidth: number, 
        baseFontSize: number, 
        normalColor: string, 
        boldColor: string = normalColor
    ) => {
        doc.setFontSize(baseFontSize);
        
        const tempFont = doc.getFont();
        doc.setFont(tempFont.fontName, "normal"); 
        const textLines = doc.splitTextToSize(text, maxWidth); 
        
        let lineY = currentY;
        let finalY = currentY;

    textLines.forEach((line: string) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).filter((p: string) => p.length > 0);
      let currentX_local = currentX;

      parts.forEach((part: string) => {
                const isBold = part.startsWith('**') && part.endsWith('**');
                const content = isBold ? part.substring(2, part.length - 2) : part;

                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setTextColor(isBold ? boldColor : normalColor);

                doc.text(content, currentX_local, lineY);
                currentX_local += doc.getTextWidth(content); 
            });

            lineY += lineHeightBase + (baseFontSize / 10); 
            finalY = lineY;
        });

        return finalY;
    };
    
    // Seção para calcular o espaço necessário com base na altura
    const calculateSpace = (text: string, size: number, verticalPadding: number = 3) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "normal"); 
        const lines = doc.splitTextToSize(text, textWidth); 
        return lines.length * (lineHeightBase + (size / 10)) + verticalPadding;
    };

    // FUNÇÃO AUXILIAR DE PAGINAÇÃO
    const addPageIfNeeded = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setTextColor("#cbd5e1"); 
        y = margin; 
      }
    };

    // --- 3. APLICAÇÃO DO TEMA ESCURO INICIAL ---
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor("#cbd5e1"); 

    // Título Principal do Documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor("#f1f5f9"); 
    doc.text("Relatório de Diagnóstico", pageWidth / 2, y, { align: "center" });
    y += 10; 

    // --- 4. PROCESSAMENTO DO MARKDOWN ---
    const lines = diagnostico.finalReport.split('\n');

    lines.forEach((line, index) => { 
      const trimmedLine = line.trim();
  let _splitText: string[];
      let spaceNeeded: number;
      const normalTextColor = "#cbd5e1"; 
      const boldTextColor = "#f1f5f9"; 

      // Função auxiliar para estimar o buffer do próximo parágrafo
      const estimateNextTextBuffer = (nextIndex: number, defaultBuffer: number) => {
          const nextLine = lines[nextIndex] ? lines[nextIndex].trim() : '';
          // Verifica se a próxima linha é um parágrafo de texto normal
          if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('*') && !nextLine.startsWith('-') && !nextLine.startsWith('***')) {
              // Estima espaço para as primeiras linhas do parágrafo. Usamos 50 caracteres como amostra.
              return calculateSpace(`${nextLine.substring(0, 50)}...`, 12, 1); 
          }
          return defaultBuffer;
      };

      if (trimmedLine.startsWith('# ')) {
        // --- Título H1 (#) ---
        const text = trimmedLine.substring(2);
        spaceNeeded = calculateSpace(text, 18, 5); 
        addPageIfNeeded(spaceNeeded);
        
        y = printMarkdownText(text, y, margin, textWidth, 18, boldTextColor, boldTextColor);
        y += 2; 

      } else if (trimmedLine.startsWith('### ')) {
        // --- Título H3 (###) com Agrupamento de Conteúdo (Rosa) ---
        const text = trimmedLine.substring(4);
        const titleSpace = calculateSpace(text, 14, 4);
        
        const minTextBuffer = estimateNextTextBuffer(index + 1, 0);

        const totalSpaceNeeded = titleSpace + minTextBuffer;
        
        addPageIfNeeded(totalSpaceNeeded); 

        // Desenha o Título H3
        doc.setFontSize(14);
        doc.setTextColor("#f472b6"); 
        y = printMarkdownText(text, y, margin, textWidth, 14, "#f472b6", "#f1f5f9");
        y += 2; 

      } else if (trimmedLine.startsWith('#### ')) {
        // --- Título H4 (####) com Agrupamento de Conteúdo (Azul) ---
        const text = trimmedLine.substring(5);
        const titleSpace = calculateSpace(text, 13, 3);
        
        // **APLICANDO AGRUPAMENTO**
        const minTextBuffer = estimateNextTextBuffer(index + 1, 0);

        const totalSpaceNeeded = titleSpace + minTextBuffer;
        
        addPageIfNeeded(totalSpaceNeeded); // Verifica se o título + buffer cabem na página.
        
        // Desenha o Título H4
        doc.setFontSize(13); 
        doc.setTextColor("#60a5fa"); // Azul
        y = printMarkdownText(text, y, margin, textWidth, 13, "#60a5fa", "#f1f5f9");
        y += 2; 

      } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
  // --- Lista (* ou -) ---
  const text = `• ${trimmedLine.substring(2)}`;
        spaceNeeded = calculateSpace(text, 12, 0); 
        addPageIfNeeded(spaceNeeded);
        
        y = printMarkdownText(text, y, margin + 5, textWidth - 5, 12, normalTextColor, boldTextColor);
        
      } else if (trimmedLine.startsWith('***')) {
        // --- Linha Horizontal (***) ---
        addPageIfNeeded(6); 
        y += 3;
        doc.setDrawColor(71, 85, 105); 
        doc.line(margin, y, pageWidth - margin, y);
        y += 3;

      } else if (trimmedLine.length > 0) {
        // --- Parágrafo normal ---
        const text = trimmedLine;
        spaceNeeded = calculateSpace(text, 12, 3); 
        addPageIfNeeded(spaceNeeded);
        
        y = printMarkdownText(text, y, margin, textWidth, 12, normalTextColor, boldTextColor);
        y += 1; 

      } else { 
        // --- Linha vazia ---
        addPageIfNeeded(4);
        y += 4;
      }
    });

    // --- 5. SALVAR O PDF ---
    doc.save(`diagnostico-aprofundado-${diagnostico._id}.pdf`);
    toast.success("Download do PDF iniciado!");

  } catch (e) {
    console.error("Erro ao gerar PDF:", e);
    toast.error("Não foi possível gerar o PDF. Tente novamente.");
  }
};


  const renderContent = () => {
    if (loading) {
      return <Loader text="Carregando relatório..." />;
    }
    if (error) {
      return (
        <div className="text-center text-red-400">
          <h2>Erro ao Carregar</h2>
          <p>{error}</p>
          <Button onClick={() => router.push("/pos-login")} className="mt-4">Voltar</Button>
        </div>
      );
    }
    if (diagnostico) {
      return (
        // O layout da página permanece o mesmo, apenas a função de download mudou
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6 border-b border-slate-600 pb-4">
            Resultado do Diagnóstico
          </h1>
          {/* A ref não é mais necessária aqui */}
          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <ReactMarkdown>{diagnostico.finalReport}</ReactMarkdown>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-center gap-4">
            <PrimaryButton size="lg" onClick={handleDownloadPdf}>
              <Save className="mr-2 h-4 w-4" />
              Salvar em PDF
            </PrimaryButton>
            <Button
              size="lg"
              variant="outline"
              className="border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white"
              onClick={() => router.push("/pos-login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Painel
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-3xl relative z-10">{renderContent()}</div>
      <div className="-z-10">
        <Ondas />
      </div>
    </main>
  );
}