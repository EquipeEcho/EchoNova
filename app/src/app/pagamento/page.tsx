"use client";
import { useState } from "react";
import { Header, Ondas } from "../clientFuncs";
import { Button } from "@/components/ui/button";
import { CheckIcon, ArrowLeftIcon, CreditCardIcon, UserIcon, BuildingIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatCard,
  formatExpiry,
  validateEmail,
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
  validateCard,
  validateCVV,
  validateExpiry,
  debugCPFValidation
} from "../form/validator";

export default function PagamentoPage() {
  const searchParams = useSearchParams();
  const planoSelecionado = searchParams.get('plano') || 'Essencial';
  const preco = searchParams.get('preco') || '590';

  const [etapaPagamento, setEtapaPagamento] = useState<'dados' | 'pagamento' | 'confirmacao'>('dados');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    email: '',
    telefone: '',
    cpf: '',

    // Dados da empresa
    nomeEmpresa: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',

    // Dados do cartão
    numeroCartao: '',
    nomeCartao: '',
    validadeCartao: '',
    cvv: '',

    // Endereço de cobrança
    enderecoCobranca: '',
    cidadeCobranca: '',
    estadoCobranca: '',
    cepCobranca: ''
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Aplicar formatação específica para cada campo
    switch (field) {
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      case 'cnpj':
        formattedValue = formatCNPJ(value);
        break;
      case 'telefone':
        formattedValue = formatPhone(value);
        break;
      case 'cep':
      case 'cepCobranca':
        formattedValue = formatCEP(value);
        break;
      case 'numeroCartao':
        formattedValue = formatCard(value);
        break;
      case 'validadeCartao':
        formattedValue = formatExpiry(value);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Validar campo em tempo real
    validateField(field, formattedValue);
  };

  const validateField = (field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'nome':
        if (!value.trim()) error = 'Nome é obrigatório';
        else if (value.trim().length < 2) error = 'Nome deve ter pelo menos 2 caracteres';
        break;
      case 'email':
        if (!value.trim()) error = 'Email é obrigatório';
        else if (!validateEmail(value)) error = 'Email inválido';
        break;
      case 'telefone':
        if (!value.trim()) error = 'Telefone é obrigatório';
        else if (!validatePhone(value)) error = 'Telefone inválido';
        break;
      case 'cpf':
        if (!value.trim()) error = 'CPF é obrigatório';
        else if (!validateCPF(value)) {
          const digits = value.replace(/\D/g, '');
          if (digits.length !== 11) {
            error = 'CPF deve ter 11 dígitos';
          } else if (/^(\d)\1{10}$/.test(digits)) {
            error = 'CPF não pode ter todos os dígitos iguais';
          } else {
            error = 'CPF inválido - verifique os dígitos';
            // Para debug - mostra como o cálculo funciona
            if (digits.length === 11) {
              debugCPFValidation(value);
            }
          }
        } else if (value.replace(/\D/g, '').length === 11) {
          // CPF válido - mostra como foi validado
          console.log(`\u2713 CPF ${value} é VÁLIDO!`);
        }
        break;
      case 'nomeEmpresa':
        if (!value.trim()) error = 'Nome da empresa é obrigatório';
        break;
      case 'cnpj':
        if (!value.trim()) error = 'CNPJ é obrigatório';
        else if (!validateCNPJ(value)) {
          const digits = value.replace(/\D/g, '');
          if (digits.length !== 14) {
            error = 'CNPJ deve ter 14 dígitos';
          } else if (/^(\d)\1{13}$/.test(digits)) {
            error = 'CNPJ não pode ter todos os dígitos iguais';
          } else {
            error = 'CNPJ inválido - verifique os dígitos';
          }
        }
        break;
      case 'endereco':
      case 'enderecoCobranca':
        if (!value.trim()) error = 'Endereço é obrigatório';
        break;
      case 'cidade':
      case 'cidadeCobranca':
        if (!value.trim()) error = 'Cidade é obrigatória';
        break;
      case 'estado':
      case 'estadoCobranca':
        if (!value.trim()) error = 'Estado é obrigatório';
        else if (value.length !== 2) error = 'Estado deve ter 2 caracteres (ex: SP)';
        break;
      case 'cep':
      case 'cepCobranca':
        if (!value.trim()) error = 'CEP é obrigatório';
        else if (!validateCEP(value)) error = 'CEP inválido';
        break;
      case 'numeroCartao':
        if (!value.trim()) error = 'Número do cartão é obrigatório';
        else if (!validateCard(value)) error = 'Número do cartão inválido';
        break;
      case 'nomeCartao':
        if (!value.trim()) error = 'Nome no cartão é obrigatório';
        break;
      case 'validadeCartao':
        if (!value.trim()) error = 'Validade é obrigatória';
        else if (!validateExpiry(value)) error = 'Validade inválida';
        break;
      case 'cvv':
        if (!value.trim()) error = 'CVV é obrigatório';
        else if (!validateCVV(value)) error = 'CVV inválido';
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateEtapaDados = () => {
    const requiredFields = ['nome', 'email', 'telefone', 'cpf', 'nomeEmpresa', 'cnpj', 'endereco', 'cidade', 'estado', 'cep'];
    let hasErrors = false;

    requiredFields.forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
      if (!formData[field as keyof typeof formData] || errors[field]) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  const validateEtapaPagamento = () => {
    const requiredFields = ['numeroCartao', 'nomeCartao', 'validadeCartao', 'cvv', 'enderecoCobranca', 'cidadeCobranca', 'estadoCobranca', 'cepCobranca'];
    let hasErrors = false;

    requiredFields.forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
      if (!formData[field as keyof typeof formData] || errors[field]) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  const avancarEtapa = () => {
    if (etapaPagamento === 'dados') {
      if (validateEtapaDados()) {
        setEtapaPagamento('pagamento');
      }
    } else if (etapaPagamento === 'pagamento') {
      if (validateEtapaPagamento()) {
        setEtapaPagamento('confirmacao');
      }
    }
  };

  const voltarEtapa = () => {
    if (etapaPagamento === 'pagamento') {
      setEtapaPagamento('dados');
    } else if (etapaPagamento === 'confirmacao') {
      setEtapaPagamento('pagamento');
    }
  };

  return (
    <main className="flex flex-col overflow-hidden min-h-screen">
      <Header />

      <section className="flex-1 main-bg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 relative">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight max-w-4xl text-white mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
            Finalizar Compra
          </h1>

          {/* Resumo do plano selecionado */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 max-w-md mx-auto border border-green-400/30 animate-fade-in-up-delay shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Plano {planoSelecionado}</h2>
            {preco !== 'Sob Consulta' && (
              <p className="text-3xl font-bold text-emerald-400">R$ {preco}/mês</p>
            )}
          </div>
        </div>

        {/* Indicador de progresso */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${etapaPagamento === 'dados' ? 'text-emerald-400' : etapaPagamento === 'pagamento' || etapaPagamento === 'confirmacao' ? 'text-emerald-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapaPagamento === 'dados' ? 'bg-emerald-500' : etapaPagamento === 'pagamento' || etapaPagamento === 'confirmacao' ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">Dados</span>
            </div>

            <div className={`flex-1 h-0.5 mx-4 ${etapaPagamento === 'pagamento' || etapaPagamento === 'confirmacao' ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>

            <div className={`flex items-center gap-2 ${etapaPagamento === 'pagamento' ? 'text-emerald-400' : etapaPagamento === 'confirmacao' ? 'text-emerald-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapaPagamento === 'pagamento' ? 'bg-emerald-500' : etapaPagamento === 'confirmacao' ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <CreditCardIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">Pagamento</span>
            </div>

            <div className={`flex-1 h-0.5 mx-4 ${etapaPagamento === 'confirmacao' ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>

            <div className={`flex items-center gap-2 ${etapaPagamento === 'confirmacao' ? 'text-emerald-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapaPagamento === 'confirmacao' ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">Confirmação</span>
            </div>
          </div>
        </div>

        {/* Formulário principal */}
        <div className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-700/40">
          {/* Etapa 1: Dados Pessoais e da Empresa */}
          {etapaPagamento === 'dados' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-emerald-400" />
                Dados Pessoais e da Empresa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Dados Pessoais</h3>

                  <div>
                    <label className="block text-gray-300 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.nome ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="Seu nome completo"
                    />
                    {errors.nome && <p className="text-red-400 text-sm mt-1">{errors.nome}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.telefone ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                    {errors.telefone && <p className="text-red-400 text-sm mt-1">{errors.telefone}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cpf ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {errors.cpf && <p className="text-red-400 text-sm mt-1">{errors.cpf}</p>}
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BuildingIcon className="w-5 h-5 text-emerald-400" />
                    Dados da Empresa
                  </h3>

                  <div>
                    <label className="block text-gray-300 mb-2">Nome da Empresa</label>
                    <input
                      type="text"
                      value={formData.nomeEmpresa}
                      onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.nomeEmpresa ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="Nome da sua empresa"
                    />
                    {errors.nomeEmpresa && <p className="text-red-400 text-sm mt-1">{errors.nomeEmpresa}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cnpj ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                    />
                    {errors.cnpj && <p className="text-red-400 text-sm mt-1">{errors.cnpj}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.endereco ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="Rua, número, complemento"
                    />
                    {errors.endereco && <p className="text-red-400 text-sm mt-1">{errors.endereco}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 mb-2">Cidade</label>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cidade ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                          }`}
                        placeholder="Cidade"
                      />
                      {errors.cidade && <p className="text-red-400 text-sm mt-1">{errors.cidade}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Estado</label>
                      <input
                        type="text"
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                        className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.estado ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                          }`}
                        placeholder="SP"
                        maxLength={2}
                      />
                      {errors.estado && <p className="text-red-400 text-sm mt-1">{errors.estado}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">CEP</label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cep ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {errors.cep && <p className="text-red-400 text-sm mt-1">{errors.cep}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={avancarEtapa}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Continuar para Pagamento →
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Dados de Pagamento */}
          {etapaPagamento === 'pagamento' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCardIcon className="w-6 h-6 text-emerald-400" />
                Dados de Pagamento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados do Cartão */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">💳 Cartão de Crédito</h3>

                  <div>
                    <label className="block text-gray-300 mb-2">Número do Cartão</label>
                    <input
                      type="text"
                      value={formData.numeroCartao}
                      onChange={(e) => handleInputChange('numeroCartao', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.numeroCartao ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                    {errors.numeroCartao && <p className="text-red-400 text-sm mt-1">{errors.numeroCartao}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Nome no Cartão</label>
                    <input
                      type="text"
                      value={formData.nomeCartao}
                      onChange={(e) => handleInputChange('nomeCartao', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.nomeCartao ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="Nome como está no cartão"
                    />
                    {errors.nomeCartao && <p className="text-red-400 text-sm mt-1">{errors.nomeCartao}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 mb-2">Validade</label>
                      <input
                        type="text"
                        value={formData.validadeCartao}
                        onChange={(e) => handleInputChange('validadeCartao', e.target.value)}
                        className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.validadeCartao ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                          }`}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      {errors.validadeCartao && <p className="text-red-400 text-sm mt-1">{errors.validadeCartao}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">CVV</label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cvv ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                          }`}
                        placeholder="000"
                        maxLength={4}
                      />
                      {errors.cvv && <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>

                {/* Endereço de Cobrança */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">📍 Endereço de Cobrança</h3>

                  <div>
                    <label className="block text-gray-300 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={formData.enderecoCobranca}
                      onChange={(e) => handleInputChange('enderecoCobranca', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.enderecoCobranca ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="Rua, número, complemento"
                    />
                    {errors.enderecoCobranca && <p className="text-red-400 text-sm mt-1">{errors.enderecoCobranca}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidadeCobranca}
                      onChange={(e) => handleInputChange('cidadeCobranca', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cidadeCobranca ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="Cidade"
                    />
                    {errors.cidadeCobranca && <p className="text-red-400 text-sm mt-1">{errors.cidadeCobranca}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 mb-2">Estado</label>
                      <input
                        type="text"
                        value={formData.estadoCobranca}
                        onChange={(e) => handleInputChange('estadoCobranca', e.target.value.toUpperCase())}
                        className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.estadoCobranca ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                          }`}
                        placeholder="SP"
                        maxLength={2}
                      />
                      {errors.estadoCobranca && <p className="text-red-400 text-sm mt-1">{errors.estadoCobranca}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">CEP</label>
                      <input
                        type="text"
                        value={formData.cepCobranca}
                        onChange={(e) => handleInputChange('cepCobranca', e.target.value)}
                        className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cepCobranca ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                          }`}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {errors.cepCobranca && <p className="text-red-400 text-sm mt-1">{errors.cepCobranca}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={voltarEtapa}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-all duration-300"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={avancarEtapa}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Finalizar Compra →
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Confirmação */}
          {etapaPagamento === 'confirmacao' && (
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">🎉 Compra Realizada com Sucesso!</h2>

              <div className="bg-slate-800/50 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-2">Resumo da Compra</h3>
                <p className="text-gray-300 mb-2">Plano: <span className="text-emerald-400 font-semibold">{planoSelecionado}</span></p>
                {preco !== 'Sob Consulta' && (
                  <p className="text-gray-300 mb-4">Valor: <span className="text-emerald-400 font-semibold">R$ {preco}/mês</span></p>
                )}
                <p className="text-sm text-gray-400">Você receberá um email de confirmação em breve.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main>
  );
}