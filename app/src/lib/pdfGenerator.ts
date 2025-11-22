import { jsPDF } from "jspdf";

interface DiagnosticoData {
  perfil: {
    empresa: string;
    cnpj?: string;
  };
  dimensoesSelecionadas: string[];
  resultados?: {
    [key: string]: {
      estagio: string;
      media: number;
      resumoExecutivo: {
        forca?: { meta: string } | null;
        fragilidade?: { meta: string } | null;
      };
      trilhasDeMelhoria: Array<{
        meta: string;
        trilha: string;
        explicacao?: string;
      }>;
    };
  };
  dataProcessamento?: string;
  dataFinalizacao?: string;
}

export function generateDiagnosticoPDF(diagnosticoData: DiagnosticoData): void {
  (async () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Carregar logo EchoNova (public/img/img_logo.png) como DataURL
  const loadImageAsDataUrl = async (src: string): Promise<string> => {
    const res = await fetch(src, { credentials: "include" });
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
    logoDataUrl = await loadImageAsDataUrl("/img/img_logo.png");
  } catch (e) {
    console.warn("Logo não carregado no PDF básico, usando fallback.", e);
  }

  // Função auxiliar para adicionar nova página se necessário
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      // Aplica fundo escuro na nova página
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      yPos = margin;
      return true;
    }
    return false;
  };

  // Função para escrever texto com quebra de linha
  const writeText = (
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    color: number[] = [255, 255, 255]
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkNewPage(10);
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });
  };

  // Fundo escuro (tema da página)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Título principal
  doc.setFillColor(236, 72, 153); // pink-500
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("DIAGNÓSTICO EMPRESARIAL", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("EchoNova", pageWidth / 2, 30, { align: "center" });

  yPos = 50;

  // Data do processamento
  const dataFormatada = new Date(
    diagnosticoData.dataProcessamento ||
      diagnosticoData.dataFinalizacao ||
      Date.now()
  ).toLocaleDateString("pt-BR");

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(`Data: ${dataFormatada}`, margin, yPos);
  yPos += 10;

  // Perfil da Empresa
  doc.setFillColor(236, 72, 153); // pink-500
  doc.rect(margin, yPos, maxWidth, 8, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("PERFIL DA EMPRESA", margin + 2, yPos + 5.5);
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Empresa: ${diagnosticoData.perfil.empresa}`, margin, yPos);
  yPos += 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `CNPJ: ${diagnosticoData.perfil.cnpj || "Não informado"}`,
    margin,
    yPos
  );
  yPos += 14;

  // Resultados por Dimensão
  if (diagnosticoData.resultados) {
    diagnosticoData.dimensoesSelecionadas.forEach((dimensao) => {
      const resultado = diagnosticoData.resultados?.[dimensao];
      if (!resultado) return;

      checkNewPage(60);

      // Cabeçalho da dimensão
      doc.setFillColor(219, 39, 119); // pink-600
      doc.rect(margin, yPos, maxWidth, 8, "F");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(dimensao.toUpperCase().replace(/E /g, "E "), margin + 2, yPos + 5.5);
      yPos += 12;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(251, 207, 232); // pink-200
      doc.text(`Estágio de Maturidade: ${resultado.estagio}`, margin, yPos);
      yPos += 10;

      // Ponto Forte
      if (resultado.resumoExecutivo.forca) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(134, 239, 172); // green-300
        doc.text("PONTO FORTE:", margin, yPos);
        yPos += 6;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(203, 213, 225);
        const forcaLines = doc.splitTextToSize(
          resultado.resumoExecutivo.forca.meta,
          maxWidth - 4
        );
        forcaLines.forEach((line: string) => {
          checkNewPage(6);
          doc.text(line, margin + 2, yPos);
          yPos += 5.5;
        });
        yPos += 4;
      }

      // Prioridade de Ação
      if (resultado.resumoExecutivo.fragilidade) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(252, 165, 165); // red-300
        doc.text("PRIORIDADE DE ACAO:", margin, yPos);
        yPos += 6;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(203, 213, 225);
        const fragilidadeLines = doc.splitTextToSize(
          resultado.resumoExecutivo.fragilidade.meta,
          maxWidth - 4
        );
        fragilidadeLines.forEach((line: string) => {
          checkNewPage(6);
          doc.text(line, margin + 2, yPos);
          yPos += 5.5;
        });
        yPos += 4;
      }

      // Trilhas de Melhoria
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(147, 197, 253); // blue-300
      doc.text("TRILHAS DE MELHORIA:", margin, yPos);
      yPos += 6;

      if (resultado.trilhasDeMelhoria.length > 0) {
        resultado.trilhasDeMelhoria.forEach((trilha) => {
          checkNewPage(15);

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(251, 207, 232); // pink-200
          doc.text(`• ${trilha.meta}`, margin, yPos);
          yPos += 6;

          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(203, 213, 225);
          const trilhaLines = doc.splitTextToSize(trilha.trilha, maxWidth - 4);
          trilhaLines.forEach((line: string) => {
            checkNewPage(6);
            doc.text(line, margin + 2, yPos);
            yPos += 5;
          });
          yPos += 2;

          if (trilha.explicacao) {
            checkNewPage(20);

            // Formata o texto para quebrar em novas linhas nos números
            let explicacaoFormatada = trilha.explicacao
              .replace(/(\d+\))/g, "\n$1") // Adiciona quebra de linha antes de cada número)
              .trim();

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(203, 213, 225); // slate-300

            const explicacaoLines = doc.splitTextToSize(
              explicacaoFormatada,
              maxWidth
            );
            explicacaoLines.forEach((line: string) => {
              checkNewPage(6);
              doc.text(line, margin, yPos, { align: "justify", maxWidth: maxWidth });
              yPos += 5;
            });
          }
          yPos += 4;
        });
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(134, 239, 172); // green-300
        doc.text("Nenhum ponto crítico identificado!", margin + 2, yPos);
        yPos += 6;
      }

      yPos += 6;
    });
  }

  // Rodapé com logo + EchoNova e textos adicionais
  const totalPages = doc.internal.pages.length - 1; // -1 porque pages[0] é undefined
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = pageHeight - 15; // Logo mais acima
    const centerX = pageWidth / 2;
    const logoSize = 7.2; // mm (20% maior)
    const logoX = centerX - 20; // ajustado por conta do novo tamanho
    const logoY = footerY - logoSize;

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch {
        // Fallback: círculo rosa com "E"
        doc.setFillColor(236, 72, 153);
        doc.circle(logoX + logoSize/2, footerY - 2, 3.6, 'F'); // 20% maior
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("E", logoX + logoSize/2, footerY - 0.5, { align: "center" });
      }
    } else {
      doc.setFillColor(236, 72, 153);
      doc.circle(logoX + logoSize/2, footerY - 2, 3.6, 'F'); // 20% maior
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("E", logoX + logoSize/2, footerY - 0.5, { align: "center" });
    }

    // Texto EchoNova ao lado do logo
    doc.setFontSize(10);
    doc.setTextColor(236, 72, 153); // rosa
    doc.setFont("helvetica", "bold");
    doc.text("EchoNova", logoX + logoSize + 2, footerY, { align: "left" });

    // Apenas número da página no canto inferior direito
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    doc.text(`${i}`, pageWidth - 10, pageHeight - 5, { align: "right" });
  }

  // Salvar PDF
  const nomeEmpresa = diagnosticoData.perfil.empresa;
  const fileName = `diagnostico-${nomeEmpresa
    .replace(/\s+/g, "-")
    .toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
  })();
}
