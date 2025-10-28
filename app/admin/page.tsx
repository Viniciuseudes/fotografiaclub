"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera, Upload, Check, Clock, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Photo {
  id: string;
  photo_type: string;
  photo_url: string;
  created_at: string;
}

// --- INTERFACE ATUALIZADA ---
interface Submission {
  id: string;
  user_name: string;
  user_email: string;
  specialty: string; // Profissão (ex: Médico)
  user_specialty: string; // Especialidade específica (ex: Cardiologia)
  desired_elements: string; // Detalhes desejados
  status: string;
  created_at: string;
  photos: Photo[];
}
// --- FIM DA ATUALIZAÇÃO DA INTERFACE ---

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [uploadingPhotos, setUploadingPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions"); // Esta rota usa o Admin Client
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();
      // --- VERIFICAÇÃO ADICIONADA ---
      // Certifica que a API retornou um array e que cada item tem os campos esperados
      if (Array.isArray(data.submissions)) {
        // Filtrar ou mapear para garantir que todos os objetos têm a estrutura esperada (opcional mas recomendado)
        const validatedSubmissions = data.submissions.map((sub: any) => ({
          id: sub.id || "",
          user_name: sub.user_name || "N/A",
          user_email: sub.user_email || "N/A",
          specialty: sub.specialty || "N/A", // Profissão
          user_specialty: sub.user_specialty || "", // Especialidade (pode ser vazia)
          desired_elements: sub.desired_elements || "", // Detalhes (pode ser vazio)
          status: sub.status || "unknown",
          created_at: sub.created_at || new Date().toISOString(),
          photos: Array.isArray(sub.photos) ? sub.photos : [],
        }));
        setSubmissions(validatedSubmissions);
      } else {
        console.error("[v0] API did not return an array of submissions:", data);
        setSubmissions([]); // Define como array vazio se a resposta não for válida
      }
      // --- FIM DA VERIFICAÇÃO ---
    } catch (error) {
      console.error("[v0] Error fetching submissions:", error);
      setSubmissions([]); // Define como array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadingPhotos(files);
    }
  };

  const handleUploadProcessed = async (submissionId: string) => {
    if (uploadingPhotos.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      // Não precisa enviar 'status: completed' aqui, a API [id]/route.ts já faz isso
      // se fotos processadas forem enviadas.

      uploadingPhotos.forEach((photo, index) => {
        // Usa o prefixo 'processed-' como esperado pela API
        formData.append(`processed-${index}`, photo);
      });

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to upload processed photos" }));
        throw new Error(errorData.error || "Failed to upload");
      }

      alert("Fotos processadas enviadas com sucesso!");
      setUploadingPhotos([]);
      setSelectedSubmission(null); // Fecha os detalhes após o upload
      fetchSubmissions(); // Recarrega a lista para mostrar o status atualizado
    } catch (error) {
      console.error("[v0] Error uploading processed photos:", error);
      alert(
        `Erro ao enviar fotos processadas: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Função para marcar como 'processing' (usa a mesma API PATCH)
  const updateStatus = async (submissionId: string, status: string) => {
    // Adiciona loading visual se necessário
    const originalSubmissions = [...submissions];
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, status: "processing..." } : s
      )
    ); // Feedback visual

    try {
      const formData = new FormData();
      formData.append("status", status);

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to update status" }));
        throw new Error(errorData.error || "Failed to update status");
      }

      fetchSubmissions(); // Recarrega para confirmar a mudança
    } catch (error) {
      console.error("[v0] Error updating status:", error);
      alert(
        `Erro ao atualizar status: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
      setSubmissions(originalSubmissions); // Reverte em caso de erro
    }
    // Remove o loading visual aqui se adicionado
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_drive_link: "bg-[#fff0e6] text-[#ff8c1a] border-[#ffd9b3]", // Novo estilo para link pendente
      pending: "bg-[#fff5f2] text-[#ff6b35] border-[#ffe8df]",
      processing: "bg-[#ffe8df] text-[#f05520] border-[#ffd1bf]",
      completed: "bg-[#d4edda] text-[#155724] border-[#c3e6cb]",
      "processing...":
        "bg-gray-200 text-gray-600 border-gray-300 animate-pulse", // Estilo para loading visual
      unknown: "bg-gray-200 text-gray-600 border-gray-300", // Estilo para status desconhecido
    };
    const labels = {
      pending_drive_link: "Aguardando Foto", // Novo label
      pending: "Aguardando Processamento",
      processing: "Processando",
      completed: "Concluído",
      "processing...": "Atualizando...",
      unknown: "Desconhecido",
    };
    // Usa um tipo mais seguro ou fallback
    const statusKey = status as keyof typeof styles;
    const styleClass = styles[statusKey] ?? styles.unknown;
    const labelText = labels[statusKey] ?? labels.unknown;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${styleClass}`}
      >
        {labelText}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/admin/login");
  };

  if (!isAuthenticated) {
    // Retorna null ou um loader básico enquanto verifica a autenticação
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#ffe8df] bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f05520] flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fotograf-IA Admin
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/home">Ver Site</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie as submissões de fotos dos usuários
          </p>
        </div>

        {submissions.length === 0 ? (
          <Card className="p-12 text-center border-2 border-[#ffe8df]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#fff5f2] flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-[#ff6b35]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma submissão ainda
            </h3>
            <p className="text-muted-foreground">
              As submissões dos usuários aparecerão aqui
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const originalPhotos = submission.photos.filter(
                (p) => p.photo_type === "original"
              );
              const processedPhotos = submission.photos.filter(
                (p) => p.photo_type === "processed"
              );
              const isSelected = selectedSubmission === submission.id;

              return (
                <Card
                  key={submission.id}
                  className={`p-6 border-2 transition-all ${
                    isSelected
                      ? "border-[#ff8c5c] shadow-lg"
                      : "border-[#ffe8df] hover:border-[#ffc0a3]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                    {/* --- INFORMAÇÕES DO USUÁRIO ATUALIZADAS --- */}
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {submission.user_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.user_email}
                      </p>
                      <p className="text-sm text-[#5f6368] mt-1">
                        <strong>Profissão:</strong> {submission.specialty}{" "}
                        {/* Campo 'specialty' agora é a profissão */}
                      </p>
                      <p className="text-sm text-[#5f6368] mt-1">
                        <strong>Especialidade:</strong>{" "}
                        {submission.user_specialty || "Não informada"}{" "}
                        {/* Novo campo */}
                      </p>
                    </div>
                    {/* --- FIM DA ATUALIZAÇÃO --- */}
                    <div className="flex items-center gap-3 flex-shrink-0 mt-2 sm:mt-0">
                      {getStatusBadge(submission.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedSubmission(
                            isSelected ? null : submission.id
                          )
                        }
                        className="border-[#ffe8df] hover:bg-[#fff5f2]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {isSelected ? "Ocultar Detalhes" : "Ver Detalhes"}
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Enviado em{" "}
                    {new Date(submission.created_at).toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "2-digit", year: "numeric" }
                    )}{" "}
                    às{" "}
                    {new Date(submission.created_at).toLocaleTimeString(
                      "pt-BR",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </div>
                  {/* Detalhes expansíveis */}
                  {isSelected && (
                    <div className="space-y-6 pt-4 border-t-2 border-[#ffe8df] animate-in fade-in duration-300">
                      {/* --- EXIBIR DETALHES DESEJADOS --- */}
                      {submission.desired_elements && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-foreground mb-2 text-sm">
                            Detalhes Desejados pelo Usuário:
                          </h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {submission.desired_elements}
                          </p>
                        </div>
                      )}
                      {/* --- FIM DA EXIBIÇÃO --- */}
                      {/* Original Photos */}
                      {originalPhotos.length > 0 ? (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">
                            Fotos Originais ({originalPhotos.length})
                          </h4>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {originalPhotos.map((photo) => (
                              <a
                                key={photo.id}
                                href={photo.photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-square rounded-xl overflow-hidden border-2 border-[#ffe8df] hover:border-[#ff6b35] transition-all block relative group bg-gray-100"
                              >
                                <img
                                  src={photo.photo_url || "/placeholder.svg"}
                                  alt="Original"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  loading="lazy" // Adiciona lazy loading
                                />
                                {/* Overlay para indicar clique */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white/80" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Nenhuma foto original enviada ainda.
                        </p>
                      )}
                      {/* Processed Photos */}
                      {processedPhotos.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">
                            Fotos Processadas ({processedPhotos.length})
                          </h4>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {processedPhotos.map((photo) => (
                              <a
                                key={photo.id}
                                href={photo.photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-square rounded-xl overflow-hidden border-2 border-[#c3e6cb] hover:border-[#28a745] transition-all block relative group bg-gray-100"
                              >
                                <img
                                  src={photo.photo_url || "/placeholder.svg"}
                                  alt="Processed"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white/80" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Upload Processed Photos - Só mostra se o status não for 'completed' */}
                      {submission.status !== "completed" && (
                        <div className="bg-[#fffaf8] rounded-2xl p-6 border-2 border-[#ffe8df]">
                          <h4 className="font-semibold text-foreground mb-4">
                            Enviar Fotos Processadas
                          </h4>

                          <div className="space-y-4">
                            <div className="relative">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                id={`file-upload-${submission.id}`} // ID único para o label
                              />
                              <label // Usar label para melhor acessibilidade
                                htmlFor={`file-upload-${submission.id}`}
                                className="border-2 border-dashed border-[#ff8c5c] rounded-xl p-8 text-center block hover:bg-[#ffe8df] transition-all cursor-pointer"
                              >
                                <Upload className="w-8 h-8 mx-auto mb-2 text-[#ff6b35]" />
                                <p className="text-sm font-medium text-foreground">
                                  {uploadingPhotos.length > 0
                                    ? `${uploadingPhotos.length} foto(s) selecionada(s)`
                                    : "Clique ou arraste para selecionar fotos"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG (Recomendado abaixo de 5MB cada)
                                </p>
                              </label>
                            </div>

                            {uploadingPhotos.length > 0 && (
                              <div className="grid grid-cols-4 gap-3">
                                {uploadingPhotos.map((photo, index) => (
                                  <div
                                    key={index}
                                    className="aspect-square rounded-xl overflow-hidden border-2 border-[#ff6b35] relative"
                                  >
                                    <img
                                      src={
                                        URL.createObjectURL(photo) ||
                                        "/placeholder.svg"
                                      }
                                      alt={`Preview Upload ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onLoad={() =>
                                        URL.revokeObjectURL(photo.name)
                                      } // Liberar memória
                                    />
                                    {/* Botão para remover (opcional) */}
                                    <button
                                      onClick={() =>
                                        setUploadingPhotos((prev) =>
                                          prev.filter((_, i) => i !== index)
                                        )
                                      }
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-red-600"
                                      aria-label={`Remover ${photo.name}`}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                              {/* Botão Marcar como Processando só aparece se status for 'pending' ou 'pending_drive_link' */}
                              {(submission.status === "pending" ||
                                submission.status === "pending_drive_link") && (
                                <Button
                                  onClick={() =>
                                    updateStatus(submission.id, "processing")
                                  }
                                  variant="outline"
                                  className="flex-1 border-[#ffe8df] hover:bg-[#fff0e6]"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Marcar como Processando
                                </Button>
                              )}
                              <Button
                                onClick={() =>
                                  handleUploadProcessed(submission.id)
                                }
                                disabled={
                                  uploadingPhotos.length === 0 || isUploading
                                }
                                className="flex-1 bg-gradient-to-r from-[#28a745] to-[#218838] text-white hover:from-[#218838] hover:to-[#1e7e34]" // Mudado para verde
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Enviar Fotos e Concluir
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}{" "}
                      {/* Fim do if status !== 'completed' */}
                    </div>
                  )}{" "}
                  {/* Fim do isSelected */}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
