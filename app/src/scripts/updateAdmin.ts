import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

async function updateAdmin() {
  try {
    await connectDB();
    const result = await Empresa.updateOne(
      { email: "admin@echonova.com" },
      { $set: { tipo_usuario: "ADMIN" } }
    );
    console.log("Update result:", result);
    if (result.matchedCount === 0) {
      console.log("Empresa não encontrada com email admin@echonova.com");
    } else {
      console.log("Empresa atualizada para ADMIN");
    }
  } catch (error) {
    console.error("Erro ao atualizar:", error);
  } finally {
    process.exit(0);
  }
}

updateAdmin();