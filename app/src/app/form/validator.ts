import validator from "validator";

/**
 * Função para validar email usando a biblioteca validator
 */
export function isValidEmail(email: string): boolean {
    return validator.isEmail(email);
}

/**
 * Função para validar CNPJ brasileiro
 */
export function isValidCNPJ(cnpj: string): boolean {
    // Remove caracteres especiais
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se não é sequência de números iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Calcula primeiro dígito verificador
    let soma = 0;
    let multiplicador = 5;
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cleanCNPJ[i]) * multiplicador;
        multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
    }
    
    let resto = soma % 11;
    let dv1 = resto < 2 ? 0 : 11 - resto;
    
    if (dv1 !== parseInt(cleanCNPJ[12])) return false;
    
    // Calcula segundo dígito verificador
    soma = 0;
    multiplicador = 6;
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cleanCNPJ[i]) * multiplicador;
        multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
    }
    
    resto = soma % 11;
    let dv2 = resto < 2 ? 0 : 11 - resto;
    
    return dv2 === parseInt(cleanCNPJ[13]);
}

/**
 * Função para formatar CNPJ com máscara
 */
export function formatCNPJ(cnpj: string): string {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    return cleanCNPJ
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

/**
 * Função para sugerir correções de email comuns
 */
export function getSuggestedEmail(email: string): string | null {
    const commonDomains = [
        { wrong: 'gmail.com', correct: 'gmail.com' },
        { wrong: 'gmial.com', correct: 'gmail.com' },
        { wrong: 'gmai.com', correct: 'gmail.com' },
        { wrong: 'hotmail.com', correct: 'hotmail.com' },
        { wrong: 'hotmial.com', correct: 'hotmail.com' },
        { wrong: 'yahoo.com', correct: 'yahoo.com' },
        { wrong: 'yahooo.com', correct: 'yahoo.com' }
    ];

    const [localPart, domain] = email.split('@');
    if (!domain) return null;

    const suggestion = commonDomains.find(d => 
        domain.toLowerCase().includes(d.wrong.split('.')[0])
    );

    if (suggestion && domain.toLowerCase() !== suggestion.correct) {
        return `${localPart}@${suggestion.correct}`;
    }

    return null;
}