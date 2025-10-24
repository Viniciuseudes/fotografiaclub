"use client";

import type React from "react";
import { useState, useEffect } from "react"; // Import useEffect
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
  Loader2, // Importar ícones necessários
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client"; // Importar cliente browser

// --- Interfaces (adicionadas para clareza) ---
interface Submission {
  id: string;
  status: string;
}

interface FormDataState {
  name: string;
  email: string;
  profession: string;
  specialty: string;
  desiredElements: string;
  photos: File[];
}
// --- Fim Interfaces ---

type FormStep = 1 | 2 | 3;

export default function FormPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient(); // Obter cliente Supabase

  // --- Novos Estados ---
  const [isLoadingStatus, setIsLoadingStatus] = useState(true); // Estado de carregamento da verificação
  const [existingSubmission, setExistingSubmission] =
    useState<Submission | null>(null); // Armazena a submissão existente
  const [userId, setUserId] = useState<string | null>(null); // Armazena o ID do usuário logado
  // --- Fim Novos Estados ---

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    profession: "",
    specialty: "",
    desiredElements: "",
    photos: [],
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const professions = [
    { value: "medico", label: "Médico(a)" },
    { value: "dentista", label: "Dentista" },
    { value: "psicologo", label: "Psicólogo(a)" },
    { value: "fisioterapeuta", label: "Fisioterapeuta" },
    { value: "nutricionista", label: "Nutricionista" },
    { value: "enfermeiro", label: "Enfermeiro(a)" },
  ];

  // --- UseEffect para verificar usuário e submissão existente ---
  useEffect(() => {
    const checkUserAndSubmission = async () => {
      setIsLoadingStatus(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        // Buscar a submissão MAIS RECENTE do usuário
        const { data: submission, error } = await supabase
          .from("submissions")
          .select("id, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(); // maybeSingle retorna null se não encontrar, sem erro

        if (error) {
          console.error("Erro ao buscar submissão:", error);
        } else if (submission) {
          // Se encontrou uma submissão
          setExistingSubmission(submission);
          // Se já estiver completa, redireciona AGORA
          if (submission.status === "completed") {
            router.push(`/results?id=${submission.id}`);
            // Não precisa setar isLoadingStatus para false aqui, pois já vai redirecionar
            return; // Sai da função
          }
        }
        // Se não encontrou ou se o status não é 'completed', continua
      } else {
        // Se não tem usuário logado, redireciona para login
        router.push("/login");
        return; // Sai da função
      }
      setIsLoadingStatus(false); // Terminou a verificação
    };

    checkUserAndSubmission();
  }, [supabase, router]);
  // --- Fim UseEffect ---

  // Funções handleDrag, handleDrop, handleFileInput, removePhoto (permanecem iguais)
  const handleDrag = (e: React.DragEvent) => {
    /* ...código igual...*/ e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    /* ...código igual...*/ e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* ...código igual...*/ if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };
  const removePhoto = (index: number) => {
    /* ...código igual...*/ setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Validações (permanecem iguais)
  const canProceedStep1 =
    formData.name &&
    formData.email &&
    formData.profession &&
    formData.specialty &&
    formData.desiredElements;
  const canProceedStep2 = formData.photos.length >= 5;

  // Função handleSubmit (permanece igual)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("profession", formData.profession);
      formDataToSend.append("specialty", formData.specialty);
      formDataToSend.append("desiredElements", formData.desiredElements);
      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photo-${index}`, photo);
      });

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        // A linha que deu erro antes
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        console.error("Submit Error Response:", errorData);
        throw new Error(errorData.error || "Failed to submit");
      }

      const data = await response.json();
      router.push(`/results?id=${data.submissionId}`);
    } catch (error) {
      console.error("[v0] Error submitting form:", error);
      alert(
        `Erro ao enviar formulário: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função handleNext (permanece igual)
  const handleNext = () => {
    if (currentStep === 1 && canProceedStep1) setCurrentStep(2);
    else if (currentStep === 2 && canProceedStep2) setCurrentStep(3);
  };

  // --- Renderização de Carregamento ---
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
        <span className="ml-3 text-muted-foreground">
          Verificando suas fotos...
        </span>
      </div>
    );
  }
  // --- Fim Renderização de Carregamento ---

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header (Adapte para incluir "Minhas Fotos" se desejar aqui) */}
      <header className="border-b border-[#ffe8df] bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {" "}
            {/* Mudado href para / */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f05520] flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fotograf-IA
            </span>
          </Link>
          {/* Botão Minhas Fotos (aparece se já existe submissão) OU Voltar */}
          {existingSubmission ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/results?id=${existingSubmission.id}`)
              }
              className="border-[#ffe8df]"
            >
              Minhas Fotos
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                {" "}
                {/* Mudado href para / */}
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl flex-grow">
        {/* --- Renderização Condicional: Status ou Formulário --- */}
        {existingSubmission && existingSubmission.status !== "completed" ? (
          // Mostrar Status Pendente/Processando
          <div className="text-center space-y-6 flex flex-col items-center justify-center h-full">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4 animate-pulse">
              <Clock className="w-10 h-10 text-[#ff6b35]" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              {existingSubmission.status === "pending"
                ? "Recebemos suas Fotos!"
                : "Processando suas Fotos"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Nossa IA está trabalhando para criar suas fotos profissionais.
              Você receberá um e-mail quando estiverem prontas (até 24 horas).
            </p>

            <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-3xl border-2 border-[#ff8c5c] p-8 space-y-4 w-full max-w-md">
              <div className="flex items-center justify-center gap-3">
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
              }
              variant="outline"
              className="border-2 border-[#ffe8df] bg-transparent mt-6"
            >
              Ver Página de Status
            </Button>
            {/* Você pode adicionar um botão para "Enviar Novas Fotos" aqui se quiser permitir */}
            {/* <Button onClick={() => setExistingSubmission(null)} className="mt-4">Enviar Novas Fotos</Button> */}
          </div>
        ) : (
          // Mostrar Formulário (se não houver submissão ou se explicitamente permitido reenviar)
          <>
            {/* Progress Steps */}
            <div className="mb-12">
              {/* ...código dos steps igual ... */}
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step < currentStep
                          ? "bg-[#ff6b35] text-white shadow-lg"
                          : step === currentStep
                          ? "bg-gradient-to-br from-[#ff6b35] to-[#f05520] text-white shadow-xl scale-110"
                          : "bg-[#fff5f2] text-[#ff8c5c] border-2 border-[#ffe8df]"
                      }`}
                    >
                      {step < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                          step < currentStep ? "bg-[#ff6b35]" : "bg-[#ffe8df]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={
                    currentStep === 1
                      ? "text-[#ff6b35] font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Informações
                </span>
                <span
                  className={
                    currentStep === 2
                      ? "text-[#ff6b35] font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Upload
                </span>
                <span
                  className={
                    currentStep === 3
                      ? "text-[#ff6b35] font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Confirmação
                </span>
              </div>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ... conteúdo do Step 1 igual ... */}
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
                <div className="bg-white rounded-3xl border-2 border-[#ffe8df] p-8 space-y-6 shadow-lg">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                  </div>
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
                    />
                  </div>
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
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.desiredElements.length}/500 caracteres
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  size="lg"
                  className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Step 2: Photo Upload */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ... conteúdo do Step 2 igual ... */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4">
                    <Upload className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Envie suas Fotos
                  </h2>
                  <p className="text-muted-foreground">
                    Mínimo de 5 fotos para melhores resultados
                  </p>
                </div>
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
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-3 gap-4">
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
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base font-medium rounded-2xl border-2 border-[#ffe8df] hover:bg-[#fff5f2]"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedStep2}
                    size="lg"
                    className="flex-1 h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ... conteúdo do Step 3 igual ... */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4">
                    <Check className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Confirme seus Dados
                  </h2>
                  <p className="text-muted-foreground">
                    Revise as informações antes de enviar
                  </p>
                </div>
                <div className="bg-white rounded-3xl border-2 border-[#ffe8df] overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-[#fff5f2] to-[#ffe8df] p-6 border-b-2 border-[#ffe8df]">
                    <h3 className="text-lg font-semibold text-foreground">
                      Informações Pessoais
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-[#ffe8df]">
                      <span className="text-muted-foreground">Nome</span>
                      <span className="font-medium text-foreground">
                        {formData.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#ffe8df]">
                      <span className="text-muted-foreground">E-mail</span>
                      <span className="font-medium text-foreground">
                        {formData.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#ffe8df]">
                      <span className="text-muted-foreground">Profissão</span>
                      <span className="font-medium text-foreground">
                        {
                          professions.find(
                            (p) => p.value === formData.profession
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#ffe8df]">
                      <span className="text-muted-foreground">
                        Especialidade
                      </span>
                      <span className="font-medium text-foreground">
                        {formData.specialty}
                      </span>
                    </div>
                    <div className="py-3">
                      <span className="text-muted-foreground block mb-2">
                        Elementos desejados
                      </span>
                      <p className="font-medium text-foreground text-sm leading-relaxed">
                        {formData.desiredElements}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl border-2 border-[#ffe8df] overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-[#fff5f2] to-[#ffe8df] p-6 border-b-2 border-[#ffe8df]">
                    <h3 className="text-lg font-semibold text-foreground">
                      Fotos Enviadas
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-3">
                      {formData.photos.slice(0, 8).map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden bg-[#fff5f2] border-2 border-[#ffe8df]"
                        >
                          <img
                            src={
                              URL.createObjectURL(photo) || "/placeholder.svg"
                            }
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {formData.photos.length > 8 && (
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                          +{formData.photos.length - 8} foto
                          {formData.photos.length - 8 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-3xl border-2 border-[#ff8c5c] p-6">
                  <p className="text-sm text-foreground leading-relaxed">
                    Ao enviar, você concorda que suas fotos serão processadas
                    por nossa IA para gerar imagens profissionais. Você receberá
                    um e-mail quando suas fotos estiverem prontas (até 24
                    horas).
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base font-medium rounded-2xl border-2 border-[#ffe8df] hover:bg-[#fff5f2]"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={isSubmitting}
                    className="flex-1 h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Fotos"}
                    <Check className="ml-2 w-5 h-5" />
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
