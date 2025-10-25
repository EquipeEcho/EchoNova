import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { nome, email } = await request.json();

    const Dados = [
      "ID da Compra: #2025-001",
      "Nome: Ryan Araújo",
      "Produto: Teclado Mecânico RGB",
      "Valor: R$ 249,90",
      "Status: Pagamento Confirmado",
      "Entrega: Correios - 5 dias úteis",
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

      const logoPath = path.join(process.cwd(), "public", "img", "PDFlogo.png");
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        doc.addImage(logoData, "PNG", 10, 10, 40, 20);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("VALIDAÇÃO DE COMPRA", pageWidth / 2, 40, { align: "center" });

      doc.setDrawColor(255, 255, 255);
      doc.line(20, 45, pageWidth - 20, 45);

      doc.setFontSize(11);
      doc.text(`Data: ${data}`, 20, 55);

      let yPos = 70;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      textos.forEach((texto) => {
        doc.text(`${texto}`, 20, yPos);
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
      subject: "Seu Diagnóstico Entrenova",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${nome}!</h2>
          <h3>Seu Pagamento foi confirmado!</h3>
          <p>Segue o comprovante em anexo.</p>
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

    await transporter.sendMail(mailOptions);
    return Response.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao enviar o e-mail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
