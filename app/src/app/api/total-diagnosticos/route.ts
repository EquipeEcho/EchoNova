import Diagnostico from "@/models/Diagnostico";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const total = await Diagnostico.countDocuments();

    return Response.json({
      success: true,
      data: total,
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: "Erro ao contar diagnósticos"
    }, { status: 500 });
  }
}
