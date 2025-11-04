import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";

export async function POST(request: Request) {
  try {
    const { transacaoId, nome, email } = await request.json();

    if (!transacaoId || !nome || !email) {
      return Response.json({ success: false, error: "Dados incompletos." }, { status: 400 });
    }

    await connectDB();
    const transacao = await Transacao.findById(transacaoId).populate('empresaId', 'nome_empresa');

    if (!transacao) {
      return Response.json({ success: false, error: "Transação não encontrada" }, { status: 404 });
    }

    // --- CORREÇÃO: Dados dinâmicos baseados na transação ---
    const Dados = [
      `ID da Transação: #${transacao._id.toString()}`,
      `Empresa: ${transacao.empresaId.nome_empresa}`,
      `Comprador: ${nome}`,
      `Plano Adquirido: ${transacao.plano.charAt(0).toUpperCase() + transacao.plano.slice(1)}`,
      `Valor: R$ ${transacao.valor.toFixed(2)}`,
      "Status: Pagamento Confirmado",
    ];

    function gerarPDFValidacaoCompra(textos: string[]) {
      const hoje = new Date();
      const dia = hoje.getDate().toString().padStart(2, "0");
      const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");
      const ano = hoje.getFullYear().toString();
      const data = `${dia}/${mes}/${ano}`;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(15, 15, 25);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      const logoPath = path.join(process.cwd(), "public", "img", "PDFlgo.png");
      const logoData = fs.readFileSync(logoPath);
      doc.addImage(logoData, "PNG", 0, 0, pageHeight, 0); 
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);

      doc.text("CONFIRMAÇÃO DE COMPRA", pageWidth / 2, 40, { align: "center" });

      doc.setDrawColor(255, 255, 255);
      doc.line(20, 45, pageWidth - 20, 45);

      doc.setFontSize(11);
      doc.text(`Data da Emissão: ${data}`, 20, 55);

      let yPos = 70;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const footerLogoPath = path.join(process.cwd(), "public", "img", "PDFlogo.png");
      const footerLogoData = fs.readFileSync(footerLogoPath);
      doc.addImage(footerLogoData, "PNG", 0, 150, pageHeight, 0);
      
      textos.forEach((texto) => {
        doc.text(texto, 20, yPos);
        yPos += 8;
        if (yPos >= pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
      });

      return doc.output("arraybuffer");
    }

    const pdfBuffer = gerarPDFValidacaoCompra(Dados);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmação de Pagamento - Entrenova",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${nome}!</h2>
          <h3>Seu Pagamento foi confirmado!</h3>
          <p>Agradecemos por escolher a Entrenova. Segue o comprovante em anexo.</p>
          <p>Você já pode acessar a plataforma para iniciar seu diagnóstico aprofundado.</p>
          <p>Atenciosamente,</p>
          <strong>Equipe Entrenova</strong>
        </div>
      `,
      attachments: [
        {
          filename: "Comprovante.pdf",
          content: Buffer.from(pdfBuffer),
        },
      ],
    };

    transporter.sendMail(mailOptions);
    return Response.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao enviar o e-mail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}