// ----------------------
// FORMATTERS
// ----------------------
export const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatCard = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};

export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{2})(\d{2})/, '$1/$2');
};


// ======= Funções de validação =======

export function validateRequired(value: string): boolean {
  return value.trim() !== "";
}

export function validateEmail(email: string): boolean {
  if (!email) return false;

  const trimmed = email.trim();

  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(trimmed);
}

export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/[^\d]+/g, "");
  if (cleaned.length !== 14) return false;

  let tamanho = cleaned.length - 2;
  let numeros = cleaned.substring(0, tamanho);
  const digitos = cleaned.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += +numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== +digitos.charAt(0)) return false;

  tamanho++;
  numeros = cleaned.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += +numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === +digitos.charAt(1);
}

export function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  return cleaned
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}
// validator.ts (adicionar ou substituir a função equalCNPJ existente)
export async function equalCNPJ(cnpjFormatted: string): Promise<boolean> {
  try {
    // envia sem formatação extra (o backend deverá normalizar se necessário)
    const res = await fetch("/api/empresas/check-cnpj", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnpj: cnpjFormatted }),
    });

    if (!res.ok) {
      // se o backend retornar 4xx/5xx, tratar como "não pode confirmar" – evita bloquear por erro de rede
      console.warn("equalCNPJ: resposta não ok do servidor", res.status);
      return false;
    }

    const data = await res.json();
    // assumir que o backend responde { exists: true } ou { exists: false } ou { error: '...' }
    if (typeof data.exists === "boolean") {
      return data.exists;
    }

    // fallback: se backend tiver outro shape
    if (data.transacao || data.message) {
      // não é o esperado, retornar false para não bloquear por segurança
      return false;
    }

    return false;
  } catch (err) {
    console.error("Erro em equalCNPJ:", err);
    return false;
  }
}




export const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  const firstDigit = (sum % 11) < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(digits[9], 10) !== firstDigit) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  const secondDigit = (sum % 11) < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(digits[10], 10) !== secondDigit) return false;

  return true;
};

export function validateDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date);
  return !Number.isNaN(d.getTime());
}

export function validatePhone(phone: string): boolean {
  return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone);
}
export const validateCEP = (cep: string) => cep.replace(/\D/g, '').length === 8;
export const validateCard = (card: string) => card.replace(/\D/g, '').length === 16;
export const validateCVV = (cvv: string) => cvv.length >= 3 && cvv.length <= 4;

export const validateExpiry = (expiry: string) => {
  const digits = expiry.replace(/\D/g, '');
  if (digits.length !== 4) return false;

  const month = parseInt(digits.substring(0, 2), 10);
  const year = parseInt(digits.substring(2, 4), 10);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;

  return true;
};
export const debugCPFValidation = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return console.log("CPF deve ter 11 dígitos");

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  const firstDigit = (sum % 11) < 2 ? 0 : 11 - (sum % 11);

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  const secondDigit = (sum % 11) < 2 ? 0 : 11 - (sum % 11);

  const isValid = firstDigit === parseInt(digits[9], 10) && secondDigit === parseInt(digits[10], 10);
  console.log(`CPF ${cpf} ${isValid ? "VÁLIDO" : "INVÁLIDO"} ✓`);
};

// ======= Validação de Senha =======
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password.trim()) {
    return { valid: false, message: "Senha obrigatória" };
  }
  if (password.trim().length < 6) { 
    return { valid: false, message: "A senha deve ter pelo menos 6 caracteres" };
  }
  return { valid: true };
}

export function validateConfirmPassword(password: string, confirm: string): { valid: boolean; message?: string } {
  if (!confirm.trim()) {
    return { valid: false, message: "Confirmação de senha obrigatória" };
  }
  if (password !== confirm) {
    return { valid: false, message: "As senhas não coincidem" };
  }
  return { valid: true };
}

// ======= Validador genérico =======
export function validateField(
  fieldId: string,
  value: string
): { valid: boolean; message?: string } {

  if (!validateRequired(value)) {
    return { valid: false, message: "Campo obrigatório" };
  }
  

  const id = fieldId.toLowerCase();

  if (id.includes("email") && !validateEmail(value)) {
    return { valid: false, message: "E-mail inválido" };
  }

  if (id.includes("cnpj") && !validateCNPJ(value)) {
    return { valid: false, message: "CNPJ inválido" };
  }

  if (id.includes("cnpj") && !equalCNPJ(value)) {
    return { valid: false, message: "CNPJ já cadastrado" };
  }

  if (id.includes("data") && !validateDate(value)) {
    return { valid: false, message: "Data inválida" };
  }

  if (id.includes("telefone") && !validatePhone(value)) {
    return { valid: false, message: "Telefone inválido" };
  }
  if (id.includes("senha")) {
    return validatePassword(value);
  }

  if (id.includes("confirmar")) {
    // pega o valor atual da senha (sem usar document)
    const senhaValue = (globalThis as unknown as { currentPasswordValue?: string }).currentPasswordValue ?? "";
    return validateConfirmPassword(senhaValue, value);
  }
  return { valid: true };
}


