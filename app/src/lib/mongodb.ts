import mongoose from "mongoose"; // Importa o Mongoose para conectar ao MongoDB

// Mostra no console a URI que está sendo usada (útil para debug)
console.log("MONGODB_URI =", process.env.MONGODB_URI);

// Pega a variável de ambiente MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI;

// Se a variável não estiver definida, lança um erro
if (!MONGODB_URI) {
  throw new Error("Defina a variável de ambiente MONGODB_URI no .env.local");
}

// Interface para armazenar a conexão e a promise da conexão
interface Cached {
  conn: typeof mongoose | null; // Conexão atual
  promise: Promise<typeof mongoose> | null; // Promise da conexão (evita reconectar várias vezes)
}

// Declara uma variável global para cache da conexão (evita reconectar em hot reload do Next.js)
declare global {
  var mongoose: Cached;
}

// Inicializa o cache global
let cached: Cached = global.mongoose;

// Se não existir cache ainda, cria um objeto vazio
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Função para conectar ao banco de dados
export async function connectDB() {
  // Se já existe uma conexão, retorna ela
  if (cached.conn) return cached.conn;

  // Se não existe promise de conexão, cria uma nova
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!)
      .then((mongoose) => mongoose);
  }

  // Espera a promise resolver e guarda a conexão no cache
  cached.conn = await cached.promise;
  return cached.conn;
}
