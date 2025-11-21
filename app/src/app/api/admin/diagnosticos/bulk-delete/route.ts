import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

export async function POST(req: Request) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(req as any, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (!ids.length) {
      return NextResponse.json({ success: false, error: "Nenhum id informado." }, { status: 400 });
    }

    const result = await Diagnostico.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
