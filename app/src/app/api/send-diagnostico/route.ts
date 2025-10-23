import nodemailer from "nodemailer";

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
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${nome}!</h2>
          <p>Segue abaixo o resultado do seu diagnóstico inicial:</p>
          <div style="background-color:#f3f4f6; padding:12px; border-radius:8px;">
            <p>${diagnostico}</p>
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