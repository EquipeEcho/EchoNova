"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
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

/**
 * @description Página dedicada a exibir o resultado de um Diagnóstico Aprofundado já concluído.
 */
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
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDiagnostico();
    }
  }, [id]);

  /**
   * @description Função aprimorada para gerar um PDF a partir de um texto Markdown.
   * Agora inclui suporte para paginação automática e formatação de elementos
   * básicos de Markdown (títulos, listas, parágrafos e linhas horizontais).
   */
  const handleDownloadPdf = () => {
    if (!diagnostico?.finalReport) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // --- 1. Configurações e Variáveis de Controle ---
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const textWidth = pageWidth - margin * 2;
      const lineHeight = 7; // Espaçamento entre linhas para texto normal
      const bottomMargin = 20; // Margem inferior para evitar que o texto cole no rodapé

      // Posição vertical inicial (e mutável)
      let y = 20;

      // --- 2. Função para adicionar nova página e resetar a posição ---
      const addPageIfNeeded = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - bottomMargin) {
          doc.addPage();
          y = margin; // Reseta para a margem superior
        }
      };
      
      // --- 3. Processamento e Renderização do Markdown ---
      const reportLines = diagnostico.finalReport.split('\n');

      reportLines.forEach(line => {
        // Remove espaços em branco desnecessários no início/fim da linha
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('### ')) {
          addPageIfNeeded(lineHeight * 2);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          const text = trimmedLine.substring(4);
          const splitText = doc.splitTextToSize(text, textWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + (lineHeight / 2); // Adiciona espaço extra após o título

        } else if (trimmedLine.startsWith('## ')) {
          addPageIfNeeded(lineHeight * 2.5);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          const text = trimmedLine.substring(3);
          const splitText = doc.splitTextToSize(text, textWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + (lineHeight / 2);

        } else if (trimmedLine.startsWith('# ')) {
          addPageIfNeeded(lineHeight * 3);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          const text = trimmedLine.substring(2);
          const splitText = doc.splitTextToSize(text, textWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + lineHeight;
        
        } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          addPageIfNeeded(lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          const text = "• " + trimmedLine.substring(2); // Adiciona o marcador de lista
          const splitText = doc.splitTextToSize(text, textWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight;

        } else if (trimmedLine.startsWith('***')) {
            addPageIfNeeded(lineHeight * 2);
            y += lineHeight / 2;
            doc.setDrawColor(150, 150, 150); // Cor cinza para a linha
            doc.line(margin, y, pageWidth - margin, y); // Desenha a linha
            y += lineHeight * 1.5;

        } else if (trimmedLine.length > 0) { // Parágrafo normal
          addPageIfNeeded(lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(trimmedLine, textWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight;
        
        } else { // Linha vazia, apenas adiciona um espaço
           addPageIfNeeded(lineHeight);
           y += lineHeight / 2;
        }
      });

      // --- 4. Salvando o arquivo ---
      doc.save(`diagnostico-aprofundado-${diagnostico._id}.pdf`);
      toast.success("Download do PDF iniciado!");

    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      toast.error("Não foi possível gerar o PDF.");
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
          <Button onClick={() => router.push("/pos-login")} className="mt-4">
            Voltar
          </Button>
        </div>
      );
    }
    if (diagnostico) {
      return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6 border-b border-slate-600 pb-4">
            Resultado do Diagnóstico
          </h1>
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