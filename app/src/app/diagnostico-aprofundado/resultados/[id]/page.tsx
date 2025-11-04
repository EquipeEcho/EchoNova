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
export default function ResultadoDiagnosticoPage() { // Nome do componente ajustado
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDiagnostico = async () => {
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

  const handleDownloadPdf = () => {
    if (!diagnostico?.finalReport) return;
    try {
      const doc = new jsPDF();
      const margin = 15;
      const textWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const lines = doc.splitTextToSize(diagnostico.finalReport, textWidth);

      doc.setFontSize(18);
      doc.text("Relatório de Diagnóstico Aprofundado", margin, 20);
      doc.setFontSize(12);
      doc.text(new Date(diagnostico.createdAt).toLocaleDateString('pt-BR'), margin, 27);
      
      doc.text(lines, margin, 40);
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
          <Button onClick={() => router.push("/pos-login")} className="mt-4">Voltar</Button>
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