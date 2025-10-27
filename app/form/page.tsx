"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ArrowLeft,
  ArrowRight,
  Upload,
  User,
  Briefcase,
  Check,
  Clock,
  Sparkles,
  Loader2,
  ExternalLink, // Ícone para o link externo
  ImageUp, // Ícone para o novo botão
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// --- Interfaces ---
interface Submission {
  id: string;
  status: string;
}

interface FormDataState {
  name: string;
  email: string; // Mantido para exibição, mas backend usará o user.email
  profession: string;
  specialty: string;
  desiredElements: string;
  photos: File[];
}
// --- Fim Interfaces ---

// --- NOVO TIPO PARA ETAPAS ---
// Adicionamos 'driveLink' como uma etapa possível
type FormStep = 1 | "driveLink" | 2 | 3;

// --- CONSTANTE PARA O LINK DO DRIVE ---
// ***** IMPORTANTE: Substitua pelo seu link real do Google Drive *****
const EVENT_DRIVE_LINK =
  "https://drive.google.com/drive/folders/1gj2brke8uY2AuethcKVQTUIzi7XSlEKe";

export default function FormPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // --- Estados ---
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [existingSubmission, setExistingSubmission] =
    useState<Submission | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(""); // Para preencher o campo email
  const [createdSubmissionId, setCreatedSubmissionId] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "", // Será preenchido pelo usuário autenticado
    profession: "",
    specialty: "",
    desiredElements: "",
    photos: [],
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false); // Loading específico da Etapa 1
  const [isSubmittingPhotos, setIsSubmittingPhotos] = useState(false); // Loading específico do envio final

  const professions = [
    { value: "medico", label: "Médico(a)" },
    { value: "dentista", label: "Dentista" },
    { value: "psicologo", label: "Psicólogo(a)" },
    { value: "fisioterapeuta", label: "Fisioterapeuta" },
    { value: "nutricionista", label: "Nutricionista" },
    { value: "enfermeiro", label: "Enfermeiro(a)" },
    // Adicione mais se necessário
  ];

  // --- UseEffect para verificar usuário e submissão existente ---
  useEffect(() => {
    const checkUserAndSubmission = async () => {
      setIsLoadingStatus(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth Error or No User:", authError);
        router.push("/login"); // Redireciona se não houver usuário
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? ""); // Define o email no estado
      setFormData((prev) => ({ ...prev, email: user.email ?? "" })); // Preenche o formData

      // Busca a submissão MAIS RECENTE do usuário
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .select("id, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (submissionError) {
        console.error("Erro ao buscar submissão:", submissionError);
      } else if (submission) {
        setExistingSubmission(submission);
        setCreatedSubmissionId(submission.id); // Guarda o ID se já existe

        if (submission.status === "completed") {
          router.push(`/results?id=${submission.id}`);
          return; // Sai se já completou
        }
        // Se for pending_drive_link, vai para a etapa do link
        if (submission.status === "pending_drive_link") {
          setCurrentStep("driveLink");
        }
        // Se for 'pending' ou 'processing' (após upload das fotos),
        // a lógica de renderização condicional principal cuidará disso.
      }
      // Se não encontrou submissão, continua na etapa 1 (default)

      setIsLoadingStatus(false); // Terminou a verificação
    };

    checkUserAndSubmission();
  }, [supabase, router]);
  // --- Fim UseEffect ---

  // --- Funções de Drag and Drop e Manipulação de Fotos ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...files].slice(0, 15),
      })); // Limita a 15 fotos por segurança
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...files].slice(0, 15),
      })); // Limita a 15 fotos
      e.target.value = ""; // Limpa o input para permitir selecionar o mesmo arquivo novamente
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };
  // --- Fim Funções ---

  // --- Validações ---
  const canProceedStep1 =
    formData.name &&
    formData.profession &&
    formData.specialty &&
    formData.desiredElements;
  const canProceedStep2 = formData.photos.length >= 5;
  // --- Fim Validações ---

  // --- Envio da Etapa 1 ---
  const handleStep1Submit = async () => {
    if (!canProceedStep1) return;
    setIsSubmittingStep1(true); // Inicia loading da etapa 1
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      // formDataToSend.append("email", formData.email); // Não precisa enviar, backend pega do user logado
      formDataToSend.append("profession", formData.profession);
      formDataToSend.append("specialty", formData.specialty);
      formDataToSend.append("desiredElements", formData.desiredElements);

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Erro desconhecido ao processar resposta da API",
        }));
        console.error("Submit Step 1 Error Response:", errorData);
        throw new Error(errorData.error || "Falha ao enviar informações");
      }

      const data = await response.json();
      if (data.submissionId) {
        setCreatedSubmissionId(data.submissionId);
        setCurrentStep("driveLink"); // Avança para a nova etapa
        setExistingSubmission({
          id: data.submissionId,
          status: "pending_drive_link",
        }); // Atualiza o estado da submissão existente
      } else {
        throw new Error("ID da submissão não recebido da API");
      }
    } catch (error) {
      console.error("[v0] Erro ao enviar etapa 1:", error);
      alert(
        `Erro ao enviar informações: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsSubmittingStep1(false); // Finaliza loading da etapa 1
    }
  };
  // --- Fim Envio Etapa 1 ---

  // --- Envio Final (Fotos do Usuário - PATCH) ---
  const handleSubmitPhotos = async () => {
    if (!createdSubmissionId) {
      alert("Erro: ID da submissão não encontrado.");
      return;
    }
    if (!canProceedStep2) {
      alert("É necessário anexar pelo menos 5 fotos.");
      return;
    }

    setIsSubmittingPhotos(true); // Inicia loading do envio final
    try {
      const formDataToSend = new FormData();
      formData.photos.forEach((photo, index) => {
        // Usa o nome esperado pela API PATCH (ou ajuste a API PATCH para `user-photo-x`)
        formDataToSend.append(`user-photo-${index}`, photo);
      });
      // Envia o novo status para indicar que as fotos foram enviadas
      formDataToSend.append("status", "pending");

      const response = await fetch(`/api/submissions/${createdSubmissionId}`, {
        method: "PATCH",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Erro desconhecido ao processar resposta da API",
        }));
        console.error("Submit Photos Error Response:", errorData);
        throw new Error(errorData.error || "Falha ao enviar fotos");
      }

      // Atualiza o estado local para refletir a mudança de status
      setExistingSubmission((prev) =>
        prev ? { ...prev, status: "pending" } : null
      );
      // Redireciona para a página de resultados
      router.push(`/results?id=${createdSubmissionId}`);
    } catch (error) {
      console.error("[v0] Erro ao enviar fotos:", error);
      alert(
        `Erro ao enviar fotos: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsSubmittingPhotos(false); // Finaliza loading do envio final
    }
  };
  // --- Fim Envio Final ---

  // --- Navegação entre Etapas ---
  const handleNext = () => {
    if (currentStep === 1 && canProceedStep1) {
      handleStep1Submit(); // Chama o envio da Etapa 1
    } else if (currentStep === 2 && canProceedStep2) {
      setCurrentStep(3); // Vai para a Confirmação
    }
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep("driveLink");
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === "driveLink") setCurrentStep(1); // Permite voltar da tela do Drive Link
  };
  // --- Fim Navegação ---

  // --- Renderização de Carregamento Inicial ---
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
        <span className="ml-3 text-muted-foreground">Verificando...</span>
      </div>
    );
  }
  // --- Fim Renderização ---

  // --- Componente da Etapa Intermediária (Link do Drive) ---
  const DriveLinkStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4">
        <Check className="w-8 h-8 text-[#ff6b35]" />
      </div>
      <h2 className="text-3xl font-bold text-foreground">
        Informações Recebidas!
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Seu cadastro inicial foi concluído. Acesse as fotos do evento no link
        abaixo.
      </p>
      <div className="bg-white rounded-3xl border-2 border-[#ffe8df] p-8 space-y-6 shadow-lg">
        <p className="font-medium text-lg">Fotos do Evento:</p>
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 text-base font-medium rounded-2xl border-2 border-[#ffe8df] hover:bg-[#fff5f2] justify-center text-[#ff6b35] hover:text-[#f05520] hover:border-[#ff8c5c]"
          asChild
        >
          <a href={EVENT_DRIVE_LINK} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 w-5 h-5" />
            Acessar Pasta no Google Drive
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          Abra o link para visualizar e baixar as fotos.
        </p>
      </div>
      <p className="text-muted-foreground pt-4">
        Gostaria de transformar suas próprias fotos com nossa IA?
      </p>
      <Button
        onClick={() => setCurrentStep(2)} // Vai para a etapa de Upload (Etapa 2)
        size="lg"
        className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl"
        disabled={isSubmittingStep1} // Desabilita se ainda estiver enviando a etapa 1
      >
        <ImageUp className="mr-2 w-5 h-5" />
        Sim, Transformar Minhas Fotos com IA
      </Button>
      <Button
        onClick={handleBack} // Volta para a Etapa 1
        variant="ghost"
        size="sm"
        className="mt-4 text-muted-foreground"
        disabled={isSubmittingStep1}
      >
        <ArrowLeft className="mr-1 w-4 h-4" /> Voltar e Editar Informações
      </Button>
    </div>
  );
  // --- Fim Componente ---

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-[#ffe8df] bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f05520] flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fotograf-IA
            </span>
          </Link>
          {/* Mostra 'Minhas Fotos/Status' se já existe submissão E NÃO está na etapa 1 */}
          {existingSubmission && currentStep !== 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/results?id=${existingSubmission.id}`)
              }
              className="border-[#ffe8df]"
            >
              Ver Status/Resultados {/* Texto mais genérico */}
            </Button>
          ) : (
            // Senão, mostra o botão Voltar (exceto na primeira etapa)
            currentStep !== 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isSubmittingStep1 || isSubmittingPhotos}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl flex-grow">
        {/* --- Renderização Condicional Principal --- */}
        {/* Mostra status PENDING ou PROCESSING (depois do upload final) */}
        {existingSubmission &&
        (existingSubmission.status === "pending" ||
          existingSubmission.status === "processing") ? (
          <div className="text-center space-y-6 flex flex-col items-center justify-center h-full pt-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4 animate-pulse">
              <Clock className="w-10 h-10 text-[#ff6b35]" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              {existingSubmission.status === "pending"
                ? "Suas Fotos Estão na Fila!"
                : "Processando suas Fotos"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              {" "}
              {/* Adicionado mx-auto */}
              Nossa IA está trabalhando nelas. Você receberá um e-mail quando
              estiverem prontas (geralmente em até 24 horas).
            </p>
            <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-3xl border-2 border-[#ff8c5c] p-8 space-y-4 w-full max-w-md">
              <div className="flex items-center justify-center gap-3">
                {" "}
                {/* Animação de bolinhas */}
                <div
                  className="w-3 h-3 rounded-full bg-[#ff6b35] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 rounded-full bg-[#ff6b35] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 rounded-full bg-[#ff6b35] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <p className="text-sm text-foreground font-medium">
                Status:{" "}
                {existingSubmission.status === "pending"
                  ? "Aguardando processamento"
                  : "Em processamento"}
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/results?id=${existingSubmission.id}`)
              } // Apenas atualiza
              variant="outline"
              className="border-2 border-[#ffe8df] bg-transparent mt-6"
            >
              Atualizar Página de Status
            </Button>
          </div>
        ) : (
          // Mostra Formulário (Etapa 1, driveLink, 2 ou 3)
          <>
            {/* Progress Steps (Ajustado para não mostrar na etapa driveLink) */}
            {currentStep !== "driveLink" && (
              <div className="mb-12">
                {/* Lógica para destacar a etapa correta com CORREÇÃO do erro */}
                {(() => {
                  // Variável numérica auxiliar para controle visual
                  let displayStepNumeric: number;

                  if (currentStep === 1) {
                    displayStepNumeric = 1;
                  } else if ((currentStep as unknown) === "driveLink") {
                    // Decidimos qual step visual representar quando for "driveLink"
                    // Mantém destacando a etapa 1 visualmente
                    displayStepNumeric = 1;
                  } else if (currentStep === 2) {
                    displayStepNumeric = 2;
                  } else if (currentStep === 3) {
                    displayStepNumeric = 3;
                  } else {
                    displayStepNumeric = 1; // Fallback
                  }

                  const steps = [1, 2, 3]; // As etapas visuais
                  const labels = ["Informações", "Suas Fotos", "Confirmação"];

                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        {steps.map((stepNum) => (
                          <div
                            key={stepNum}
                            className="flex items-center flex-1"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                                stepNum < displayStepNumeric
                                  ? "bg-[#ff6b35] text-white shadow-lg"
                                  : stepNum === displayStepNumeric
                                  ? "bg-gradient-to-br from-[#ff6b35] to-[#f05520] text-white shadow-xl scale-110"
                                  : "bg-[#fff5f2] text-[#ff8c5c] border-2 border-[#ffe8df]"
                              }`}
                            >
                              {stepNum < displayStepNumeric ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                stepNum
                              )}
                            </div>
                            {stepNum < steps.length && (
                              <div
                                className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                                  stepNum < displayStepNumeric
                                    ? "bg-[#ff6b35]"
                                    : "bg-[#ffe8df]"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm">
                        {labels.map((label, index) => (
                          <span
                            key={label}
                            className={
                              steps[index] === displayStepNumeric
                                ? "text-[#ff6b35] font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Renderiza a Etapa Atual */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Cabeçalho Step 1 */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4">
                    <User className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Suas Informações
                  </h2>
                  <p className="text-muted-foreground">
                    Conte-nos um pouco sobre você
                  </p>
                </div>
                {/* Conteúdo Step 1 (Inputs) */}
                <div className="bg-white rounded-3xl border-2 border-[#ffe8df] p-8 space-y-6 shadow-lg">
                  {/* Input Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Digite seu nome"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                      required
                    />
                  </div>
                  {/* Input Email (Desabilitado) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      E-mail (Login)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35] bg-gray-100 cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                  {/* Radio Profissão */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Profissão</Label>
                    <RadioGroup
                      value={formData.profession}
                      onValueChange={(value) =>
                        setFormData({ ...formData, profession: value })
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {professions.map((prof) => (
                          <div key={prof.value} className="relative">
                            <RadioGroupItem
                              value={prof.value}
                              id={prof.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={prof.value}
                              className="flex items-center justify-center p-4 rounded-xl border-2 border-[#ffe8df] cursor-pointer transition-all hover:border-[#ff8c5c] hover:bg-[#fff5f2] peer-data-[state=checked]:border-[#ff6b35] peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-[#fff5f2] peer-data-[state=checked]:to-[#ffe8df] peer-data-[state=checked]:shadow-md"
                            >
                              <Briefcase className="w-4 h-4 mr-2 text-[#ff6b35]" />
                              <span className="font-medium">{prof.label}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  {/* Input Especialidade */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="specialty"
                      className="text-base font-medium"
                    >
                      Especialidade/Nicho
                    </Label>
                    <Input
                      id="specialty"
                      placeholder="Ex: Cardiologia, Ortodontia, Psicologia Infantil..."
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                      required
                    />
                  </div>
                  {/* Textarea Elementos */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="desiredElements"
                      className="text-base font-medium"
                    >
                      Elementos que você deseja
                    </Label>
                    <Textarea
                      id="desiredElements"
                      placeholder="Descreva elementos específicos que gostaria nas fotos (fundo, iluminação, estilo, etc.)"
                      value={formData.desiredElements}
                      onChange={(e) => {
                        if (e.target.value.length <= 500)
                          setFormData({
                            ...formData,
                            desiredElements: e.target.value,
                          });
                      }}
                      className="min-h-[120px] rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35] resize-none"
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.desiredElements.length}/500 caracteres
                    </p>
                  </div>
                </div>
                {/* Botão Continuar Step 1 */}
                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep1 || isSubmittingStep1}
                  size="lg"
                  className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingStep1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Salvando...
                    </>
                  ) : (
                    "Continuar"
                  )}
                  {!isSubmittingStep1 && (
                    <ArrowRight className="ml-2 w-5 h-5" />
                  )}
                </Button>
              </div>
            )}

            {currentStep === "driveLink" && <DriveLinkStep />}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Cabeçalho Step 2 */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4">
                    <Upload className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Envie Suas Fotos
                  </h2>
                  <p className="text-muted-foreground">
                    Mínimo de 5 fotos para melhores resultados
                  </p>
                </div>
                {/* Área de Upload */}
                <div
                  className={`relative bg-white rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
                    dragActive
                      ? "border-[#ff6b35] bg-[#fff5f2]"
                      : "border-[#ffe8df] hover:border-[#ff8c5c]"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4 pointer-events-none">
                    {" "}
                    {/* Evita que os elementos internos capturem o drop */}
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] flex items-center justify-center">
                      <Upload className="w-10 h-10 text-[#ff6b35]" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground mb-1">
                        Arraste suas fotos aqui
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ou clique para selecionar
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG até 10MB cada
                    </p>
                  </div>
                </div>
                {/* Preview das Fotos */}
                {formData.photos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {formData.photos.length} foto
                        {formData.photos.length !== 1 ? "s" : ""} selecionada
                        {formData.photos.length !== 1 ? "s" : ""}
                      </p>
                      {formData.photos.length < 5 && (
                        <p className="text-sm text-[#ff6b35] font-medium">
                          Faltam {5 - formData.photos.length} foto
                          {5 - formData.photos.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-2xl overflow-hidden bg-[#fff5f2] border-2 border-[#ffe8df] group"
                        >
                          <img
                            src={
                              URL.createObjectURL(photo) || "/placeholder.svg"
                            }
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#ff6b35] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-[#f05520]"
                            aria-label={`Remover foto ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Botões Step 2 */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base font-medium rounded-2xl border-2 border-[#ffe8df] hover:bg-[#fff5f2]"
                    disabled={isSubmittingPhotos}
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" /> Voltar
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedStep2 || isSubmittingPhotos}
                    size="lg"
                    className="flex-1 h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Cabeçalho Step 3 */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4">
                    <Check className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Confirme os Dados
                  </h2>
                  <p className="text-muted-foreground">
                    Revise as informações antes de enviar suas fotos para a IA
                  </p>
                </div>
                {/* Resumo Informações Pessoais */}
                <div className="bg-white rounded-3xl border-2 border-[#ffe8df] overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-[#fff5f2] to-[#ffe8df] p-6 border-b-2 border-[#ffe8df]">
                    <h3 className="text-lg font-semibold text-foreground">
                      Informações Pessoais
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-[#ffe8df]">
                      {" "}
                      <span className="text-muted-foreground text-sm sm:text-base">
                        Nome
                      </span>{" "}
                      <span className="font-medium text-foreground text-right">
                        {formData.name}
                      </span>{" "}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-[#ffe8df]">
                      {" "}
                      <span className="text-muted-foreground text-sm sm:text-base">
                        E-mail
                      </span>{" "}
                      <span className="font-medium text-foreground text-right">
                        {formData.email}
                      </span>{" "}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-[#ffe8df]">
                      {" "}
                      <span className="text-muted-foreground text-sm sm:text-base">
                        Profissão
                      </span>{" "}
                      <span className="font-medium text-foreground text-right">
                        {
                          professions.find(
                            (p) => p.value === formData.profession
                          )?.label
                        }
                      </span>{" "}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-[#ffe8df]">
                      {" "}
                      <span className="text-muted-foreground text-sm sm:text-base">
                        Especialidade
                      </span>{" "}
                      <span className="font-medium text-foreground text-right">
                        {formData.specialty}
                      </span>{" "}
                    </div>
                    <div className="py-3">
                      {" "}
                      <span className="text-muted-foreground block mb-2 text-sm sm:text-base">
                        Elementos desejados
                      </span>{" "}
                      <p className="font-medium text-foreground text-sm leading-relaxed">
                        {formData.desiredElements ||
                          "Nenhum elemento específico descrito."}
                      </p>{" "}
                    </div>
                  </div>
                </div>
                {/* Resumo Fotos Enviadas */}
                <div className="bg-white rounded-3xl border-2 border-[#ffe8df] overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-[#fff5f2] to-[#ffe8df] p-6 border-b-2 border-[#ffe8df]">
                    <h3 className="text-lg font-semibold text-foreground">
                      Fotos a Enviar ({formData.photos.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {formData.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden bg-[#fff5f2] border-2 border-[#ffe8df]"
                        >
                          <img
                            src={
                              URL.createObjectURL(photo) || "/placeholder.svg"
                            }
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Aviso */}
                <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-3xl border-2 border-[#ff8c5c] p-6">
                  <p className="text-sm text-foreground leading-relaxed">
                    Ao clicar em "Enviar Minhas Fotos", você concorda que as
                    fotos acima serão processadas por nossa IA para gerar
                    imagens profissionais. Você receberá um e-mail quando suas
                    fotos estiverem prontas (até 24 horas).
                  </p>
                </div>
                {/* Botões Step 3 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base font-medium rounded-2xl border-2 border-[#ffe8df] hover:bg-[#fff5f2]"
                    disabled={isSubmittingPhotos}
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" /> Voltar
                  </Button>
                  <Button
                    onClick={handleSubmitPhotos}
                    size="lg"
                    disabled={isSubmittingPhotos || !createdSubmissionId}
                    className="flex-1 h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmittingPhotos ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Enviando...
                      </>
                    ) : (
                      "Enviar Minhas Fotos"
                    )}
                    {!isSubmittingPhotos && <Check className="ml-2 w-5 h-5" />}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        {/* --- Fim Renderização Condicional --- */}
      </main>
    </div>
  );
}
