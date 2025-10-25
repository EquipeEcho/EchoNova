import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { nome, email, status } = await request.json();

    //console.log('Email Recebido na rota', email)


    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const Dados = [
        "ID da Compra: #2025-001",
        "Nome: Ryan Araújo",
        "Produto: Teclado Mecânico RGB",
        "Valor: R$ 249,90",
        "Status: Pagamento Confirmado",
        "Entrega: Correios - 5 dias úteis",
        ];

    function gerarPDFValidacaoCompra(textos: string[]) {
  let hoje = new Date();
  let dia = hoje.getDate().toString().padStart(2, "0");
  let mes = (hoje.getMonth() + 1).toString().padStart(2, "0");
  let ano = hoje.getFullYear().toString();
  let data = ${dia}/${mes}/${ano};

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

    // Header
    const logoPath = path.join(process.cwd(), "public", "img", "PDFlgo.png");
    const logoData = fs.readFileSync(logoPath);
    doc.addImage(logoData, "PNG", 0, 0, pageHeight, 0); // Ajustei as dimensões para não cobrir todo o conteúdo
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    doc.text("VALIDAÇÃO DE COMPRA", pageWidth / 2, 20, { align: "center" });

    // Linha divisória
    doc.setDrawColor(255, 255, 255);
    doc.line(20, 25, pageWidth - 20, 25);

    // Data
    doc.setFontSize(11);
    doc.text(Data: ${data}, 20, 32);

    // Detalhes
    let yPos = 45;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    textos.forEach((texto) => {
        doc.text(- ${texto}, 20, yPos);

        yPos += 8;

        // Se chegar no fim da página → cria nova página
        if (yPos >= pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        }
    });

    // Rodapé
    const footerLogoPath = path.join(process.cwd(), "public", "img", "PDFlogo.png");
    const footerLogoData = fs.readFileSync(footerLogoPath);
    doc.addImage(footerLogoData, "PNG", 0, 150, pageHeight, 0); // Posicionado um pouco acima do texto do rodapé
    doc.text(
        "Documento gerado automaticamente - Não requer assinatura.",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
    );
    }


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Seu Diagnóstico Entrenova",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${nome}!</h2>
          <h3>Seu Pagamento foi confirmado!<h3>
          <p>Segue abaixo os detalhes do seu comprovante.</p>
          <div style="background-color:#f3f4f6; padding:12px; border-radius:8px;">
            <h1>AQUI VAI FICAR O PDF<h1>
          </div>
          <br/>
          <p>Em breve entraremos em contato com uma trilha de melhoria personalizada para sua empresa.</p>
          <p>Atenciosamente,</p>
          <strong>Equipe Entrenova</strong>
        </div>
      `,
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);

    return Response.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao enviar o e-mail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}