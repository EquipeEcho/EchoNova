"use client";

import { useState, useEffect } from "react"; // Removido o useRef
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { jsPDF } from "jspdf"; // Apenas o jsPDF é necessário
import { Ondas } from "@/app/clientFuncs";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Save, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface Diagnostico {
  _id: string;
  finalReport: string;
  empresa: {
    _id: string;
    nome_empresa: string;
  } | string;
  createdAt: string;
  structuredData?: Record<string, unknown>;
}

export default function ResultadoDiagnosticoPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
  const handleDownloadPdf = async () => {
  if (!diagnostico?.finalReport) return;

  toast.info("Gerando seu relatório em PDF...");

  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    // Extrai nome da empresa
    const nomeEmpresa = typeof diagnostico.empresa === 'string' 
      ? (user?.nome_empresa || 'Empresa')
      : diagnostico.empresa.nome_empresa;

    // --- 1. CONFIGURAÇÕES E CONSTANTES ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const textWidth = pageWidth - margin * 2;
    let y = margin + 10; 
    const lineHeightBase = 5; 

    // --- FUNÇÕES AUXILIARES ---

    // Carrega a imagem do logo como DataURL para uso no jsPDF
    const loadImageAsDataUrl = async (src: string): Promise<string> => {
      const res = await fetch(src);
      if (!res.ok) throw new Error("Falha ao carregar o logo");
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    };

    let logoDataUrl: string | null = null;
    try {
      // Caminho para arquivos em public/ deve começar com "/"
      logoDataUrl = await loadImageAsDataUrl("/img/img_logo.png");
    } catch (e) {
      console.warn("Logo não carregado, usando fallback gráfico.", e);
      logoDataUrl = null;
    }

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
      if (y + spaceNeeded > pageHeight - margin - 15) { // Reserva espaço para rodapé
        addFooter(); // Adiciona rodapé antes de mudar de página
        doc.addPage();
        doc.setFillColor(15, 23, 42); // slate-900 - tema escuro
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setTextColor("#cbd5e1"); // slate-300 
        y = margin; 
      }
    };

    // FUNÇÃO PARA ADICIONAR RODAPÉ
    const addFooter = () => {
      const footerY = pageHeight - 10;
      
      // Número da página à direita (apenas número)
      const pageNum = (doc as unknown as { internal: { getCurrentPageInfo: () => { pageNumber: number } } }).internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(10);
      doc.setTextColor("#94a3b8"); // slate-400
      doc.setFont("helvetica", "normal");
      doc.text(`${pageNum}`, pageWidth - margin, footerY, { align: "right" });
      
      // Logo e EchoNova no centro-esquerdo
      const centerX = pageWidth / 2;

      const logoSize = 7.2; // mm (20% maior)
      const logoX = centerX - 20; // ajusta levemente para a esquerda por conta do novo tamanho
      const logoY = footerY - logoSize; // alinhar pela base do texto

      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
        } catch (err) {
          // Fallback se addImage falhar
          doc.setFillColor(236, 72, 153); // Rosa
          doc.circle(logoX + logoSize/2, footerY - 2, 3.6, 'F'); // 20% maior
          doc.setFontSize(8);
          doc.setTextColor("#ffffff");
          doc.setFont("helvetica", "bold");
          doc.text("E", logoX + logoSize/2, footerY - 0.5, { align: "center" });
        }
      } else {
        // Fallback visual (círculo com E)
        doc.setFillColor(236, 72, 153); // Rosa
        doc.circle(logoX + logoSize/2, footerY - 2, 3.6, 'F'); // 20% maior
        doc.setFontSize(8);
        doc.setTextColor("#ffffff");
        doc.setFont("helvetica", "bold");
        doc.text("E", logoX + logoSize/2, footerY - 0.5, { align: "center" });
      }

      // Nome EchoNova (10pt)
      doc.setFontSize(10);
      doc.setTextColor("#ec4899"); // Rosa
      doc.setFont("helvetica", "bold");
      doc.text("EchoNova", logoX + logoSize + 2, footerY, { align: "left" });
    };

    // --- 3. APLICAÇÃO DO TEMA ESCURO INICIAL ---
    doc.setFillColor(15, 23, 42); // slate-900 - tema escuro
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor("#cbd5e1"); // slate-300 

    // Título Principal do Documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor("#f1f5f9"); // slate-50 
    doc.text("Diagnóstico Aprofundado", pageWidth / 2, y, { align: "center" });
    y += 8;

    // Nome da empresa abaixo do título
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor("#94a3b8"); // slate-400 
    doc.text(nomeEmpresa, pageWidth / 2, y, { align: "center" });
    y += 5;
    
    // Linha decorativa
    doc.setDrawColor(236, 72, 153); // Rosa
    doc.setLineWidth(0.5);
    doc.line(margin + 20, y, pageWidth - margin - 20, y);
    y += 10; 

    // --- 4. EXTRAIR MAPEAMENTO (JSON) PARA TABELA ---
    type TrilhasMap = {
      desafio?: string;
      problema?: string; // suporte retrocompatível
      trilhas: { nome: string; nivel?: string; duracaoHoras?: number; prioridade?: string; justificativa?: string; conteudosChave?: string[] }[];
    };
    const extractTrilhasMap = (report: string): TrilhasMap[] | null => {
      const jsonBlocks = Array.from(report.matchAll(/```json([\s\S]*?)```/gi));
      for (const m of jsonBlocks) {
        try {
          const obj = JSON.parse(m[1]);
          if (obj?.trilhasMapeadas && Array.isArray(obj.trilhasMapeadas)) {
            return obj.trilhasMapeadas as TrilhasMap[];
          }
        } catch {}
      }
      return null;
    };

    // --- 4. PROCESSAMENTO DO MARKDOWN ---
    // Pré-processa o relatório: remove o título padrão e substitui "Sua Empresa" pelo nome real
    const preprocessReport = (report: string, empresaNome: string) => {
      const withoutHeader = report
        .split('\n')
        .filter((ln) => !/^#\s*Relat[óo]rio de Diagn[óo]stico Profundo/i.test(ln.trim()))
        .join('\n');
      return withoutHeader.replace(/\bSua Empresa\b/gi, empresaNome);
    };

    const stripJsonBlocks = (txt: string) => txt.replace(/```json[\s\S]*?```/gi, "");
    const stripJsonHeading = (txt: string) => txt
      .replace(/^\s{0,3}#{1,6}.*Saída\s+Estruturada[\s\S]*?\(\s*JSON\s*\)\s*$/gim, "")
      .replace(/^\s{0,3}#{1,6}.*JSON.*Saída\s+Estruturada.*$/gim, "")
      .replace(/Saída\s+Estruturada\s*–?\s*Trilhas\s+Mapeadas\s*\(\s*JSON\s*\)/gi, "");
    const preprocessed = preprocessReport(diagnostico.finalReport, nomeEmpresa);
    const processedReport = stripJsonBlocks(stripJsonHeading(preprocessed));
    const lines = processedReport.split('\n');
    const trilhasMapeadas = extractTrilhasMap(preprocessed);

    // Fallback: extrair mapeamento a partir de uma tabela HTML no relatório
    const extractFromHtmlTable = (report: string) => {
      const tableMatch = report.match(/<table[\s\S]*?<\/table>/i);
      if (!tableMatch) return null;
      const table = tableMatch[0];
      const rowRegex = /<tr[\s\S]*?<\/tr>/gi;
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const rows = table.match(rowRegex) || [];
      if (rows.length < 2) return null;
      const headerCells = Array.from(rows[0].matchAll(cellRegex)).map(m => m[1].replace(/<[^>]*>/g, '').trim().toLowerCase());
      const idxDesafio = headerCells.findIndex(h => h.includes('desafio') || h.includes('problema'));
      const idxTrilha = headerCells.findIndex(h => h.includes('trilha'));
      const idxNivel = headerCells.findIndex(h => h.includes('nível') || h.includes('nivel'));
      const idxDur = headerCells.findIndex(h => h.includes('duração') || h.includes('duracao'));
      const idxConteudos = headerCells.findIndex(h => h.includes('conteúdos') || h.includes('conteudos'));
      if (idxDesafio === -1 || idxTrilha === -1) return null;
      const maps: { desafio: string; trilhas: { nome: string; nivel?: string; duracaoHoras?: number; conteudosChave?: string[] }[] }[] = [];
      rows.slice(1).forEach(r => {
        const cells = Array.from(r.matchAll(cellRegex)).map(m => m[1].replace(/<[^>]*>/g, '').trim());
        if (cells.length === 0) return;
        const desafio = cells[idxDesafio] || '-';
        const nome = cells[idxTrilha] || '-';
        const nivel = idxNivel !== -1 ? (cells[idxNivel] || undefined) : undefined;
        const duracaoStr = idxDur !== -1 ? (cells[idxDur] || '') : '';
        const duracaoHoras = /([0-9]+)\s*h/i.test(duracaoStr) ? parseInt(/([0-9]+)\s*h/i.exec(duracaoStr)![1], 10) : undefined;
        const conteudosStr = idxConteudos !== -1 ? (cells[idxConteudos] || '') : '';
        const conteudosChave = conteudosStr ? conteudosStr.split(/[;,]/).map(s => s.trim()).filter(Boolean) : undefined;
        if (!desafio && !nome) return;
        maps.push({ desafio, trilhas: [{ nome, nivel, duracaoHoras, conteudosChave }] });
      });
      return maps.length ? maps : null;
    };

    // Seção de tabela no final do documento
    const drawMappingTable = (maps: TrilhasMap[]) => {
      if (!maps || maps.length === 0) return;
      // Título da seção
      const title = "Resumo das Trilhas";
      addPageIfNeeded(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor("#f1f5f9");
      doc.text(title, margin, y);
      y += 4;
      doc.setDrawColor(236, 72, 153);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      // Cabeçalho da tabela (larguras balanceadas)
      const colProblemaW = textWidth * 0.25;
      const colTrilhaW = textWidth * 0.28;
      const colNivelW = textWidth * 0.12;
      const colDuracaoW = textWidth * 0.10;
      const colConteudosW = textWidth * 0.25;
      const headerH = 9;
      addPageIfNeeded(headerH + 2);
      doc.setFillColor(24, 24, 27);
      doc.rect(margin, y, textWidth, headerH, "F");
      doc.setDrawColor(236, 72, 153);
      doc.rect(margin, y, textWidth, headerH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor("#f1f5f9");
      doc.text("Desafio", margin + 2, y + 6);
      doc.text("Trilha", margin + 2 + colProblemaW, y + 6);
      doc.text("Nível", margin + 2 + colProblemaW + colTrilhaW, y + 6);
      doc.text("Duração", margin + 2 + colProblemaW + colTrilhaW + colNivelW, y + 6);
      doc.text("Conteúdos-chave", margin + 2 + colProblemaW + colTrilhaW + colNivelW + colDuracaoW, y + 6);
      y += headerH;

      const drawRow = (p: string, t: {nome:string;nivel?:string;duracaoHoras?:number;conteudosChave?:string[]}) => {
        const pad = 2;
        const lineH = 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const linhasProblema = doc.splitTextToSize(p, colProblemaW - pad*2);
        const linhasTrilha = doc.splitTextToSize(t.nome || '-', colTrilhaW - pad*2);
        const nivelStr = t.nivel || '-';
        const durStr = typeof t.duracaoHoras === 'number' ? `${t.duracaoHoras}h` : '-';
        const conteudosStr = (t.conteudosChave && t.conteudosChave.length>0) ? t.conteudosChave.join(", ") : '-';
        const linhasConteudos = doc.splitTextToSize(conteudosStr, colConteudosW - pad*2);
        const cellsHigh = Math.max(linhasProblema.length, linhasTrilha.length, 1, 1, linhasConteudos.length);
        const rowH = Math.max(cellsHigh * lineH, 8);
        addPageIfNeeded(rowH + 2);
        // fundo da linha
        doc.setFillColor(17, 24, 39);
        doc.rect(margin, y, textWidth, rowH, "F");
        // bordas
        doc.setDrawColor(71, 85, 105);
        doc.rect(margin, y, colProblemaW, rowH);
        doc.rect(margin + colProblemaW, y, colTrilhaW, rowH);
        doc.rect(margin + colProblemaW + colTrilhaW, y, colNivelW, rowH);
        doc.rect(margin + colProblemaW + colTrilhaW + colNivelW, y, colDuracaoW, rowH);
        doc.rect(margin + colProblemaW + colTrilhaW + colNivelW + colDuracaoW, y, colConteudosW, rowH);
        // textos
        doc.setTextColor("#cbd5e1");
        let ty = y + 4;
        linhasProblema.forEach((ln:string)=>{ doc.text(ln, margin+pad, ty); ty+=lineH; });
        ty = y + 4;
        linhasTrilha.forEach((ln:string)=>{ doc.text(ln, margin+colProblemaW+pad, ty); ty+=lineH; });
        doc.text(nivelStr, margin+colProblemaW+colTrilhaW+pad, y+4);
        doc.text(durStr, margin+colProblemaW+colTrilhaW+colNivelW+pad, y+4);
        ty = y + 4;
        linhasConteudos.forEach((ln:string)=>{ doc.text(ln, margin+colProblemaW+colTrilhaW+colNivelW+colDuracaoW+pad, ty); ty+=lineH; });
        y += rowH;
      };

      maps.forEach(m => {
        if (!m?.trilhas || m.trilhas.length === 0) return;
        const titulo = (m.desafio || m.problema || "-");
        m.trilhas.slice(0,2).forEach(t => drawRow(titulo, t));
      });
      y += 6;
    };

    // (Removido) A tabela será adicionada ao final do documento

    lines.forEach((line, index) => { 
      const trimmedLine = line.trim();
  let _splitText: string[];
      let spaceNeeded: number;
      const normalTextColor = "#cbd5e1"; // slate-300
      const boldTextColor = "#f1f5f9"; // slate-50 

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
        // --- Título H1 (#) - Formatação ABNT ---
        const text = trimmedLine.substring(2);
        const titleSpace = calculateSpace(text, 18, 5);
        
        // Estima espaço mínimo para primeiras linhas do conteúdo (formatação ABNT)
        const minTextBuffer = estimateNextTextBuffer(index + 1, 20); // Mínimo 20mm de conteúdo
        const totalSpaceNeeded = titleSpace + minTextBuffer;
        
        addPageIfNeeded(totalSpaceNeeded);
        
        y = printMarkdownText(text, y, margin, textWidth, 18, boldTextColor, boldTextColor);
        y += 2; 

      } else if (trimmedLine.startsWith('### ')) {
        // --- Título H3 (###) com Agrupamento de Conteúdo (Rosa) - Formatação ABNT ---
        const text = trimmedLine.substring(4);
        const titleSpace = calculateSpace(text, 14, 4);
        
        // Estima espaço mínimo para primeiras linhas do conteúdo (formatação ABNT)
        const minTextBuffer = estimateNextTextBuffer(index + 1, 15); // Mínimo 15mm de conteúdo

        const totalSpaceNeeded = titleSpace + minTextBuffer;
        
        addPageIfNeeded(totalSpaceNeeded); 

        // Desenha o Título H3
        doc.setFontSize(14);
        doc.setTextColor("#f472b6"); // pink-400
        y = printMarkdownText(text, y, margin, textWidth, 14, "#f472b6", "#f1f5f9");
        y += 2; 

      } else if (trimmedLine.startsWith('#### ')) {
        // --- Título H4 (####) com Agrupamento de Conteúdo (Azul) - Formatação ABNT ---
        const text = trimmedLine.substring(5);
        const titleSpace = calculateSpace(text, 13, 3);
        
        // Estima espaço mínimo para primeiras linhas do conteúdo (formatação ABNT)
        const minTextBuffer = estimateNextTextBuffer(index + 1, 12); // Mínimo 12mm de conteúdo

        const totalSpaceNeeded = titleSpace + minTextBuffer;
        
        addPageIfNeeded(totalSpaceNeeded); // Verifica se o título + buffer cabem na página.
        
        // Desenha o Título H4
        doc.setFontSize(13); 
        doc.setTextColor("#60a5fa"); // blue-400
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
        doc.setDrawColor(71, 85, 105); // slate-600
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

    // --- 5. INSERIR 'RESUMO DAS TRILHAS' AO FINAL ---
    const htmlMaps = extractFromHtmlTable(preprocessed);
    const mapsForTable = trilhasMapeadas || htmlMaps;
    if (mapsForTable && (mapsForTable as any[]).length) {
      addPageIfNeeded(30);
      drawMappingTable(mapsForTable as TrilhasMap[]);
    }

    // --- 6. ADICIONAR RODAPÉ NA ÚLTIMA PÁGINA ---
    addFooter();

    // --- 7. SALVAR O PDF ---
    const nomeArquivo = nomeEmpresa.toLowerCase().replace(/\s+/g, '-');
    const dataArquivo = new Date(diagnostico.createdAt).toISOString().split('T')[0];
    doc.save(`diagnostico-aprofundado-${nomeArquivo}-${dataArquivo}.pdf`);
    toast.success("Download do PDF iniciado!");

  } catch (e) {
    console.error("Erro ao gerar PDF:", e);
    toast.error("Não foi possível gerar o PDF. Tente novamente.");
  }
};


  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-slate-800 p-12 rounded-lg shadow-xl w-full text-center">
          <Loader text="Carregando seu diagnóstico..." />
          <p className="text-slate-400 mt-4 text-sm">Preparando análise completa...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full text-center">
          <div className="text-red-400 mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Erro ao Carregar</h2>
            <p className="text-slate-300">{error}</p>
          </div>
          <Button 
            onClick={() => router.push("/pos-login")} 
            className="mt-6"
            variant="outline"
          >
            Voltar ao Painel
          </Button>
        </div>
      );
    }
    if (diagnostico) {
      const nomeEmpresa = typeof diagnostico.empresa === 'string' 
        ? (user?.nome_empresa || 'Empresa') 
        : diagnostico.empresa.nome_empresa;
      
      const dataFormatada = new Date(diagnostico.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }) + ' às ' + new Date(diagnostico.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      return (
        // O layout da página permanece o mesmo, apenas a função de download mudou
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-h-[80vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-slate-700 relative">
          {/* Header com informações */}
          <div className="text-center mb-8 pb-6 border-b-2 border-pink-500/30 sticky top-0 bg-slate-800 z-10 -mx-8 px-8 pt-8 -mt-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 mb-3">
              Diagnóstico Aprofundado
            </h1>
            <div className={`flex ${ (nomeEmpresa?.length || 0) > 24 ? 'flex-col' : 'flex-col sm:flex-row'} items-center justify-center gap-2 sm:gap-4 text-slate-400 text-sm mt-4`}>
              <div className="flex items-center gap-2 text-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="font-medium text-slate-300">{nomeEmpresa}</span>
              </div>
              {((nomeEmpresa?.length || 0) <= 24) && (
                <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
              )}
              <div className="flex items-center gap-2 text-center">
                <span>📅</span>
                <span>{dataFormatada}</span>
              </div>
            </div>
          </div>
          
          {/* Conteúdo com padding */}
          <div className="px-8 pb-8">
          {/* Card de Resumo Rápido - se houver dados estruturados */}
          {diagnostico.structuredData && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
                <span>📊</span>
                Dados Coletados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(diagnostico.structuredData)
                  .filter(([key]) => !key.includes('problema') && !key.includes('desafio'))
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 p-3 rounded hover:bg-slate-800/70 transition-colors">
                      <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-slate-200 font-medium">
                        {String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Relatório Completo */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 prose prose-invert prose-lg max-w-none mb-8 
            [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-slate-100 [&>h1]:mb-6 [&>h1]:pb-3 [&>h1]:border-b [&>h1]:border-pink-500/30
            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-pink-400 [&>h2]:mt-8 [&>h2]:mb-4
            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-pink-300 [&>h3]:mt-6 [&>h3]:mb-3
            [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-blue-300 [&>h4]:mt-5 [&>h4]:mb-2
            [&>p]:text-slate-300 [&>p]:leading-relaxed [&>p]:mb-4
            [&>ul]:text-slate-300 [&>ul]:mb-4 [&>ul]:ml-6
            [&>ul>li]:mb-2 [&>ul>li]:leading-relaxed
            [&>ul>li::marker]:text-pink-400
            [&>strong]:text-slate-100 [&>strong]:font-semibold
            [&>em]:text-pink-300 [&>em]:italic
            [&>hr]:border-slate-600 [&>hr]:my-8
            [&>blockquote]:border-l-4 [&>blockquote]:border-pink-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-400
            [&_h3:has(+_h4:contains('Trilha'))]:text-purple-400
            [&_h4:contains('Trilha')]:text-emerald-400 [&_h4:contains('Trilha')]:bg-emerald-900/20 [&_h4:contains('Trilha')]:p-3 [&_h4:contains('Trilha')]:rounded-lg [&_h4:contains('Trilha')]:border [&_h4:contains('Trilha')]:border-emerald-700/30
            [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_thead_th]:bg-slate-800/60 [&_th]:text-slate-300 [&_th]:px-4 [&_th]:py-2 [&_td]:px-4 [&_td]:py-2 [&_td]:border-t [&_td]:border-slate-700
          ">
            {(() => {
              const empresaNome = typeof diagnostico.empresa === 'string' 
                ? (user?.nome_empresa || 'Empresa')
                : diagnostico.empresa.nome_empresa;
              const stripJsonBlocks = (txt: string) => txt.replace(/```json[\s\S]*?```/gi, "");
              const stripJsonHeading = (txt: string) => txt
                .replace(/^\s{0,3}#{1,6}.*Saída\s+Estruturada[\s\S]*?\(\s*JSON\s*\)\s*$/gim, "")
                .replace(/^\s{0,3}#{1,6}.*JSON.*Saída\s+Estruturada.*$/gim, "")
                .replace(/Saída\s+Estruturada\s*–?\s*Trilhas\s+Mapeadas\s*\(\s*JSON\s*\)/gi, "");
              const processed = stripJsonBlocks(stripJsonHeading((diagnostico.finalReport || '')
                .split('\n')
                .filter((ln) => !/^#\s*Relat[óo]rio de Diagn[óo]stico Profundo/i.test(ln.trim()))
                .join('\n')
                .replace(/\bSua Empresa\b/gi, empresaNome)));
              return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{processed}</ReactMarkdown>;
            })()}
          </div>
          <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-center gap-4">
            <PrimaryButton 
              size="lg" 
              onClick={handleDownloadPdf}
              className="group"
            >
              <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Baixar PDF
            </PrimaryButton>
            <Button
              size="lg"
              variant="outline"
              className="border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white group"
              onClick={() => router.push("/pos-login")}
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Painel
            </Button>
          </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen text-white flex flex-col relative overflow-hidden">
      {/* Header de Navegação */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo-container hover:scale-100">
            <Link href="/pos-login">
              <Image
                src="/img/logo.png"
                alt="EchoNova"
                width={120}
                height={40}
                className="h-8 w-auto object-contain sm:h-10 md:h-12 lg:h-14"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <span className="text-gray-300 text-sm">{user.nome_empresa}</span>
              </div>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-slate-800 p-0 cursor-pointer"
                onClick={toggleMenu}
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {user?.nome_empresa?.charAt(0) || "U"}
                </div>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.nome_empresa || "Empresa"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email || "email@exemplo.com"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <section className="flex-1 flex items-center justify-center p-4 pt-28 md:pt-32">
        <div className="w-full max-w-5xl relative z-10">{renderContent()}</div>
      </section>
      
      <div className="-z-10">
        <Ondas />
      </div>
    </main>
  );
}