"use client";
import { useState, useEffect } from "react";
import { Headernaofix, Ondas } from "../clientFuncs";
import { Button } from "@/components/ui/button";
import { CheckIcon, CreditCardIcon, UserIcon, BuildingIcon } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
// NOTE: Avoid useSearchParams() here because it triggers prerender-time warnings
// (it expects a browser environment). Instead we read window.location.search on mount.
import {
  formatCPF,
  validateConfirmPassword,
  validatePassword,
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
  // We'll read search params on the client to avoid prerender issues
  const [searchTransacaoId, setSearchTransacaoId] = useState<string | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<string>("Essencial");
  const [preco, setPreco] = useState<string>("590");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setSearchTransacaoId(sp.get("transacaoId"));
      setPlanoSelecionado(sp.get("plano") || "Essencial");
      setPreco(sp.get("preco") || "590");
    }
  }, []);

  const [etapaPagamento, setEtapaPagamento] = useState<'dados' | 'pagamento' | 'confirmacao'>('dados');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  type PaymentFormData = {
    // Dados pessoais
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    senha: string;
    confirmar: string;

    // Dados da empresa
    nomeEmpresa: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;

    // Dados do cartão
    numeroCartao: string;
    nomeCartao: string;
    validadeCartao: string;
    cvv: string;

    // Endereço de cobrança
    enderecoCobranca: string;
    cidadeCobranca: string;
    estadoCobranca: string;
    cepCobranca: string;
  };

  const [formData, setFormData] = useState<PaymentFormData>({
    // Dados pessoais
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    senha: '',
    confirmar: '',

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

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("dadosQuestionario");
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        setFormData((prev) => ({
          ...prev,
          nome: dados.nome || "",
          email: dados.email || "",
          cnpj: dados.cnpj || "",
          nomeEmpresa: dados.empresa || "",
        }));
        console.log("🟢 Dados carregados automaticamente do questionário:", dados);
      } catch (error) {
        console.error("Erro ao carregar dados do questionário:", error);
      }
    }
  }, []);

  // Redirecionamento automático após confirmação do pagamento
  useEffect(() => {
    if (etapaPagamento === "confirmacao") {
      // Remove dados sensíveis após o pagamento
      localStorage.removeItem("dadosQuestionario");
      localStorage.removeItem("empresaId");
      localStorage.removeItem("diagnosticoCompleto");
      console.log(" Dados locais limpos após pagamento concluído.");

      // Redireciona para pos-login após 5 segundos
      const timer = setTimeout(() => {
        window.location.href = "/pos-login";
      }, 5000);

      // Evita vazamento de memória
      return () => clearTimeout(timer);
    }
  }, [etapaPagamento]);


  // Exemplo de uso do ID da transação (para debug e validação futura)
  useEffect(() => {
    if (searchTransacaoId) {
      console.log("🔗 Transação carregada:", searchTransacaoId);
      // No futuro: buscar detalhes da transação via fetch(`/api/transacoes/${transacaoId}`)
    } else {
      console.warn(" Nenhum ID de transação encontrado na URL.");
    }
  }, [searchTransacaoId]);

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;

    // Aplicar formatação específica para cada campo
    switch (field) {
      case "cpf":
        formattedValue = formatCPF(value);
        break;
      case "cnpj":
        formattedValue = formatCNPJ(value);
        break;
      case "telefone":
        formattedValue = formatPhone(value);
        break;
      case "cep":
      case "cepCobranca":
        formattedValue = formatCEP(value);
        break;
      case "numeroCartao":
        formattedValue = formatCard(value);
        break;
      case "validadeCartao":
        formattedValue = formatExpiry(value);
        break;
      case "cvv":
        formattedValue = value.replace(/\D/g, "").substring(0, 4);
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Validar campo em tempo real
    validateField(field, formattedValue);
  };


  const validateField = (field: keyof PaymentFormData, value: string) => {
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
      case 'senha': {
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.valid) {
          error = passwordValidation.message ?? 'Senha inválida'; // valor padrão caso seja undefined
        } else {
          (globalThis as unknown as { currentPasswordValue?: string }).currentPasswordValue = value;
        }
        break;
      }

      case 'confirmar': {
        const password = (globalThis as unknown as { currentPasswordValue?: string }).currentPasswordValue ?? '';
        const confirmValidation = validateConfirmPassword(password, value);
        if (!confirmValidation.valid) {
          error = confirmValidation.message ?? 'As senhas não coincidem'; // valor padrão
        }
        break;
      }
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
    const requiredFields: Array<keyof PaymentFormData> = ['nome', 'email', 'telefone', 'senha', 'confirmar', 'nomeEmpresa', 'cnpj', 'endereco', 'cidade', 'estado', 'cep'];
    let hasErrors = false;

    requiredFields.forEach(field => {
      validateField(field, formData[field]);
      if (!formData[field] || errors[field as string]) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  const validateEtapaPagamento = () => {
    const requiredFields = [
      "numeroCartao",
      "nomeCartao",
      "validadeCartao",
      "cvv",
      "enderecoCobranca",
      "cidadeCobranca",
      "estadoCobranca",
      "cepCobranca",
    ];

    // --- START: fallback para endereço de cobrança usando o endereço principal ---
    const billingFallback: Partial<PaymentFormData> = {
      enderecoCobranca: formData.endereco || "",
      cidadeCobranca: formData.cidade || "",
      estadoCobranca: formData.estado || "",
      cepCobranca: formData.cep || "",
    };
    // Função para obter o valor real (campo especifico ou fallback)
    const getFieldValue = (field: keyof PaymentFormData) => {
      if (field in billingFallback) {
        const v = formData[field] as string | undefined;
        return v?.trim() ? v : (billingFallback[field] as string | undefined);
      }
      return formData[field] as string | undefined;
    };
    // --- END: fallback ---

    const newErrors: { [key: string]: string } = {};
    let hasErrors = false;

    for (const field of requiredFields) {
      const f = field as keyof PaymentFormData;
      const value = getFieldValue(f) ?? "";

      if (!value || !value.trim()) {
        newErrors[field] = "Campo obrigatório";
        hasErrors = true;
        continue;
      }

      // Validações específicas
      switch (field) {
        case "numeroCartao":
          if (!validateCard(value)) {
            newErrors[field] = "Número do cartão inválido";
            hasErrors = true;
          }
          break;
        case "validadeCartao":
          if (!validateExpiry(value)) {
            newErrors[field] = "Validade inválida";
            hasErrors = true;
          }
          break;
        case "cvv":
          if (!validateCVV(value)) {
            newErrors[field] = "CVV inválido";
            hasErrors = true;
          }
          break;
        case "cepCobranca":
          if (!validateCEP(value)) {
            newErrors[field] = "CEP inválido";
            hasErrors = true;
          }
          break;
      }
    }

    setErrors(newErrors);
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
  const teste = async () => {
    if (validateEtapaPagamento()) {
      try {
        const transacaoId = searchTransacaoId || new URLSearchParams(window.location.search).get("id");
        console.log("🚀 Enviando para finalizar:", { transacaoId, email: formData.email, cnpj: formData.cnpj, senha: formData.senha });

        const response = await fetch("/api/transacoes/finalizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            transacaoId,
            email: formData.email,
            cnpj: formData.cnpj,
            senha: formData.senha,
          }),
        });

        const data = await response.json();

        const enviar = await fetch("/api/send-pagamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            transacaoId,
            nome: formData.nome,
            email: formData.email,
            status: etapaPagamento,
          }),
        });

        await enviar.json();

        if (!response.ok) throw new Error(data.error || "Erro ao finalizar");

        console.log("Transação concluída:", data);

        // Após finalizar a transação, faz login automático do usuário
        await autoLoginUser(formData.email, formData.cnpj, formData.senha);

        // Aguarda um breve momento para garantir que o localStorage foi atualizado
        await new Promise(resolve => setTimeout(resolve, 100));

        setEtapaPagamento("confirmacao");
      } catch (error) {
        console.error("Erro ao finalizar transação:", error);
        toast.error("Erro ao processar pagamento. Tente novamente.");
      }
    }
  }

  // Função para login automático após conclusão do pagamento
  const autoLoginUser = async (email: string, cnpj: string, senha: string) => {
    try {
      const loginResponse = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          cnpj,
          senha,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        // Salva os dados do usuário no localStorage para persistência
        const userData = {
          id: loginData.user.id,
          nome_empresa: loginData.user.nome_empresa,
          email: loginData.user.email,
          planoAtivo: loginData.user.plano,
        };

        // Salva no localStorage seguindo exatamente o formato do store
        const storageData = {
          state: {
            user: userData
          },
          version: 0
        };

        localStorage.setItem('auth-storage', JSON.stringify(storageData));

        // Força uma atualização do store
        window.dispatchEvent(new Event('storage'));

        console.log("Login automático realizado com sucesso");
      } else {
        console.error("Erro no login automático:", loginData.error);
      }
    } catch (error) {
      console.error("Erro ao realizar login automático:", error);
    }
  };

  const voltarEtapa = () => {
    if (etapaPagamento === 'pagamento') {
      setEtapaPagamento('dados');
    } else if (etapaPagamento === 'confirmacao') {
      setEtapaPagamento('pagamento');
    }
  };

  // === Finalização da transação ===
  const _finalizarTransacao = async () => {
  const transacaoId = searchTransacaoId;

    if (!transacaoId) {
      console.error("Transação não encontrada");
      setEtapaPagamento("confirmacao"); // fallback caso o id falhe
      return;
    }

    try {
      const resposta = await fetch("/api/transacoes/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transacaoId }),
      });

      const data = await resposta.json();

      const enviar = await fetch("/api/send-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          transacaoId,
          nome: formData.nome,
          email: formData.email,
          status: etapaPagamento,
        }),
      });

      await enviar.json();
      //
      if (!resposta.ok) throw new Error(data.error || "Erro ao finalizar transação");

      console.log("Transação finalizada com sucesso:", data);
      setEtapaPagamento("confirmacao");
    } catch (error) {
      console.error("Erro ao finalizar transação:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    }
  };

  return (
    <main className="flex flex-col overflow-hidden min-h-screen">
      <Headernaofix Link="" />

      <section className="flex-1 main-bg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 relative">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight max-w-4xl text-white mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
            Finalizar Compra
          </h1>

          {/* Resumo do plano selecionado */}
          <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 max-w-md mx-auto border border-green-400/30 animate-fade-in-up-delay shadow-lg mb-8">
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
                    <label htmlFor="nome" className="block text-gray-300 mb-2">Nome Completo</label>
                    <input
                      id="nome"
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
                    <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                    <input
                      id="email"
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
                    <label htmlFor="telefone" className="block text-gray-300 mb-2">Telefone</label>
                    <input
                      id="telefone"
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
                    <label htmlFor="senha" className="block text-gray-300 mb-2">Senha</label>
                    <PasswordInput
                      id="senha"
                      name="senha"
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.senha ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="••••••••••••••••"
                    />
                    {errors.senha && <p className="text-red-400 text-sm mt-1">{errors.senha}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmar" className="block text-gray-300 mb-2">Confirmar Senha</label>
                    <PasswordInput
                      id="confirmar"
                      name="confirmar"
                      onChange={(e) => handleInputChange('confirmar', e.target.value)}
                      className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.confirmar ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                        }`}
                      placeholder="••••••••••••••••"
                    />
                    {errors.confirmar && <p className="text-red-400 text-sm mt-1">{errors.confirmar}</p>}
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BuildingIcon className="w-5 h-5 text-emerald-400" />
                    Dados da Empresa
                  </h3>

                  <div>
                    <label htmlFor="nomeEmpresa" className="block text-gray-300 mb-2">Nome da Empresa</label>
                    <input
                      id="nomeEmpresa"
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
                    <label htmlFor="cnpj" className="block text-gray-300 mb-2">CNPJ</label>
                    <input
                      id="cnpj"
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
                    <label htmlFor="endereco" className="block text-gray-300 mb-2">Endereço</label>
                    <input
                      id="endereco"
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
                      <label htmlFor="cidade" className="block text-gray-300 mb-2">Cidade</label>
                      <input
                        id="cidade"
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
                      <label htmlFor="estado" className="block text-gray-300 mb-2">Estado</label>
                      <input
                        id="estado"
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
                    <label htmlFor="cep" className="block text-gray-300 mb-2">CEP</label>
                    <input
                      id="cep"
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
                  className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
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

              <div className="">
                {/* Dados do Cartão */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">💳 Cartão de Crédito</h3>

                    <div>
                      <label htmlFor="numeroCartao" className="block text-gray-300 mb-2">Número do Cartão</label>
                      <input
                        id="numeroCartao"
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
                      <label htmlFor="nomeCartao" className="block text-gray-300 mb-2">Nome no Cartão</label>
                      <input
                        id="nomeCartao"
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
                        <label htmlFor="validadeCartao" className="block text-gray-300 mb-2">Validade</label>
                        <input
                          id="validadeCartao"
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
                        <label htmlFor="cvv" className="block text-gray-300 mb-2">CVV</label>
                        <input
                          id="cvv"
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          className={`w-full p-3 bg-slate-800 border rounded-lg text-white focus:outline-none transition-colors ${errors.cvv ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-emerald-400'
                            }`}
                          placeholder="000"
                          maxLength={3}
                        />
                        {errors.cvv && <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>


              </div>

              <div className="flex justify-between mt-8">
                <Button
                  onClick={voltarEtapa}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-all duration-300"
                >
                  ← Voltar
                </Button>

                <Button
                  onClick={teste}
                  className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
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

              <h2 className="text-3xl font-bold text-white mb-4">Compra Realizada com Sucesso!</h2>

              <div className="bg-slate-800/50 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-2">Resumo da Compra</h3>
                <p className="text-gray-300 mb-2">Plano: <span className="text-emerald-400 font-semibold">{planoSelecionado}</span></p>
                {preco !== 'Sob Consulta' && (
                  <p className="text-gray-300 mb-4">Valor: <span className="text-emerald-400 font-semibold">R$ {preco}/mês</span></p>
                )}
                <p className="text-sm text-gray-400">Você receberá um email de confirmação em breve.</p>
                <p className="text-sm text-emerald-400 mt-4">Redirecionando para o diagnóstico aprofundado em 5 segundos...</p>
              </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => { window.location.href = "/pos-login"; }}
                  className="px-8 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Acessar o diagnostico aprofundado agora
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main >
  );
}
