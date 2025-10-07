// Formatters
export const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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

// Validators
export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[9]) !== firstDigit) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[10]) !== secondDigit) return false;
  
  return true;
};

export const validateCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  
  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[12]) !== firstDigit) return false;
  
  // Segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[13]) !== secondDigit) return false;
  
  return true;
};

export const validatePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11;
};

export const validateCEP = (cep: string) => {
  const digits = cep.replace(/\D/g, '');
  return digits.length === 8;
};

export const validateCard = (card: string) => {
  const digits = card.replace(/\D/g, '');
  return digits.length === 16;
};

export const validateCVV = (cvv: string) => {
  return cvv.length >= 3 && cvv.length <= 4;
};

export const validateExpiry = (expiry: string) => {
  const digits = expiry.replace(/\D/g, '');
  if (digits.length !== 4) return false;
  
  const month = parseInt(digits.substring(0, 2));
  const year = parseInt(digits.substring(2, 4));
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (month < 1 || month > 12) return false;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
  
  return true;
};

// Debug function for CPF validation
export const debugCPFValidation = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) {
    console.log('CPF deve ter 11 dígitos');
    return;
  }
  
  console.log(`\n--- VALIDANDO CPF: ${cpf} ---`);
  console.log(`Dígitos: ${digits.split('').join(' ')}`);
  
  // Primeiro dígito
  console.log('\n1° Dígito Verificador:');
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(digits[i]);
    const weight = 10 - i;
    const product = digit * weight;
    sum += product;
    console.log(`${digit} x ${weight} = ${product}`);
  }
  console.log(`Soma total: ${sum}`);
  console.log(`Resto da divisão por 11: ${sum % 11}`);
  const firstDigit = (sum % 11) < 2 ? 0 : 11 - (sum % 11);
  console.log(`1° dígito calculado: ${firstDigit}`);
  console.log(`1° dígito do CPF: ${digits[9]}`);
  console.log(`1° dígito ${firstDigit === parseInt(digits[9]) ? 'CORRETO' : 'INCORRETO'}`);
  
  // Segundo dígito
  console.log('\n2° Dígito Verificador:');
  sum = 0;
  for (let i = 0; i < 10; i++) {
    const digit = parseInt(digits[i]);
    const weight = 11 - i;
    const product = digit * weight;
    sum += product;
    console.log(`${digit} x ${weight} = ${product}`);
  }
  console.log(`Soma total: ${sum}`);
  console.log(`Resto da divisão por 11: ${sum % 11}`);
  const secondDigit = (sum % 11) < 2 ? 0 : 11 - (sum % 11);
  console.log(`2° dígito calculado: ${secondDigit}`);
  console.log(`2° dígito do CPF: ${digits[10]}`);
  console.log(`2° dígito ${secondDigit === parseInt(digits[10]) ? 'CORRETO' : 'INCORRETO'}`);
  
  const isValid = firstDigit === parseInt(digits[9]) && secondDigit === parseInt(digits[10]);
  console.log(`\nCPF ${isValid ? 'VÁLIDO' : 'INVÁLIDO'} ✓`);
};