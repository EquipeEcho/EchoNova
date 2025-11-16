import mongoose from "mongoose"; // Importa o Mongoose para conectar ao MongoDB

// NOTE: Do not log MONGODB_URI here to avoid leaking secrets in logs.

// Pega a variável de ambiente MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI;

// Se a variável não estiver definida, usa uma URI padrão para desenvolvimento
if (!MONGODB_URI) {
  console.warn("MONGODB_URI não definida, usando URI padrão para desenvolvimento");
}

// Interface para armazenar a conexão e a promise da conexão
interface Cached {
  conn: typeof mongoose | null; // Conexão atual
  promise: Promise<typeof mongoose> | null; // Promise da conexão (evita reconectar várias vezes)
}

// Declara uma variável global para cache da conexão (evita reconectar em hot reload do Next.js)
declare global {
  var __echonova_mongoose: Cached | undefined;
}

// Inicializa o cache global
const cached: Cached = global.__echonova_mongoose || { conn: null, promise: null };

// Se não existir cache ainda, cria um objeto vazio
if (!global.__echonova_mongoose) {
  global.__echonova_mongoose = cached;
}

// Função para conectar ao banco de dados
export async function connectDB() {
  // Se já existe uma conexão, retorna ela
  if (cached.conn) return cached.conn;

  // Se não existe promise de conexão, cria uma nova
  if (!cached.promise) {
    const uri = MONGODB_URI || "mongodb://localhost:27017/echonova";
    cached.promise = mongoose
      .connect(uri)
      .then((mongoose) => mongoose);
  }

  // Espera a promise resolver e guarda a conexão no cache
  cached.conn = await cached.promise;
  return cached.conn;
}
