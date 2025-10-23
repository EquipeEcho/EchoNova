import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

interface Trilha {
  meta: string;
  trilha: string;
  explicacao?: string;
}

interface DiagnosticoDimensao {
  dimensao: string;
  trilhasDeMelhoria: Trilha[];
}

function gerarPDFRelatorio(diagnosticos: DiagnosticoDimensao[]) {
  let hoje = new Date();
  let dia  = hoje.getDate().toString();
  let mes  = (hoje.getMonth() + 1).toString();
  let ano  = hoje.getFullYear().toString();
  let data = dia + "/" + mes + "/" + ano;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fundo preto
  doc.setFillColor(15, 15, 25);
  doc.rect(0, 0, pageWidth, pageHeight, "F");


  // Adiciona a imagem do logo no topo
  const logoPath = path.join(process.cwd(), "public", "img", "PDFlgo.png");
  const logoData = fs.readFileSync(logoPath);
  doc.addImage(logoData, "PNG", 0, 0, pageHeight, 0); // Ajustei as dimensões para não cobrir todo o conteúdo
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);

  // Título
  doc.text("Resultado do Diagnóstico", pageWidth / 2, 20, { align: "center" });

  // Linha divisória
  doc.setDrawColor(255, 255, 255);
  doc.line(20, 25, pageWidth - 20, 25);

  // Nova posição de escrita
  let yPos = 35;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Gerenciador de páginas + quebra
  function escreverTextoGrande(text: string) {
    const linhas = doc.splitTextToSize(text, pageWidth - 30);

    for (let i = 0; i < linhas.length; i++) {
      if (yPos >= pageHeight - 20) {
        doc.addPage();
        doc.setFillColor(15, 15, 25);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setTextColor(255, 255, 255);
        yPos = 20;
      }

      doc.text(linhas[i], 15, yPos);
      yPos += 6;
    }

    yPos += 10;
  }

  // Processar cada dimensão
  diagnosticos.forEach((dimensao, index) => {
    // Título da dimensão
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${dimensao.dimensao}:`, 15, yPos);
    yPos += 8;

    // Processar trilhas de melhoria
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    if (dimensao.trilhasDeMelhoria.length > 0) {
      dimensao.trilhasDeMelhoria.forEach((trilha) => {
        // Meta
        doc.setFont("helvetica", "bold");
        escreverTextoGrande(`Meta: ${trilha.meta}`);
        
        // Trilha
        doc.setFont("helvetica", "normal");
        escreverTextoGrande(`Trilha: ${trilha.trilha}`);
        
        // Explicação (se existir)
        if (trilha.explicacao) {
          doc.setFont("helvetica", "italic");
          escreverTextoGrande(`Explicação: ${trilha.explicacao}`);
        }
        
        yPos += 5; // Espaço extra entre trilhas
      });
    } else {
      escreverTextoGrande("Nenhuma trilha de melhoria identificada para esta dimensão.");
    }

    // Adicionar espaço entre dimensões
    yPos += 10;
  });

  // Rodapé
  doc.setFontSize(10);
  
  // Adiciona a imagem do logo no rodapé
  const footerLogoPath = path.join(process.cwd(), "public", "img", "PDFlogo.png");
  const footerLogoData = fs.readFileSync(footerLogoPath);
  doc.addImage(footerLogoData, "PNG", 0, 150, pageHeight, 0); // Posicionado um pouco acima do texto do rodapé
  doc.text(
    "Documento gerado automaticamente - Não requer assinatura.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

export async function POST(request: Request) {
  try {
    const { nome, email, diagnostico } = await request.json();

    console.log('Email Recebido na rota', email)

    // Configura o transporte SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail", // pode usar outro, tipo Outlook, ou SMTP customizado
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Monta o conteúdo do e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Seu Diagnóstico Entrenova",
      attachments: [
        {
          filename: 'diagnostico.pdf',
          content: gerarPDFRelatorio(diagnostico),
          contentType: 'application/pdf',
        },
      ],
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);

    return Response.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao enviar o e-mail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}