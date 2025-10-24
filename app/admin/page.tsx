"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Camera, Upload, Check, Clock, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Photo {
  id: string
  photo_type: string
  photo_url: string
  created_at: string
}

interface Submission {
  id: string
  user_name: string
  user_email: string
  specialty: string
  status: string
  created_at: string
  photos: Photo[]
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [uploadingPhotos, setUploadingPhotos] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin")
    if (isAdmin !== "true") {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions()
    }
  }, [isAuthenticated])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions")
      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error("[v0] Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadingPhotos(files)
    }
  }

  const handleUploadProcessed = async (submissionId: string) => {
    if (uploadingPhotos.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("status", "completed")

      uploadingPhotos.forEach((photo, index) => {
        formData.append(`processed-${index}`, photo)
      })

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload")

      alert("Fotos processadas enviadas com sucesso!")
      setUploadingPhotos([])
      setSelectedSubmission(null)
      fetchSubmissions()
    } catch (error) {
      console.error("[v0] Error uploading:", error)
      alert("Erro ao enviar fotos processadas")
    } finally {
      setIsUploading(false)
    }
  }

  const updateStatus = async (submissionId: string, status: string) => {
    try {
      const formData = new FormData()
      formData.append("status", status)

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update")

      fetchSubmissions()
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-[#fff5f2] text-[#ff6b35] border-[#ffe8df]",
      processing: "bg-[#ffe8df] text-[#f05520] border-[#ffd1bf]",
      completed: "bg-[#d4edda] text-[#155724] border-[#c3e6cb]",
    }
    const labels = {
      pending: "Pendente",
      processing: "Processando",
      completed: "Concluído",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem("isAdmin")
    router.push("/admin/login")
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    )
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
            <span className="text-xl font-bold text-foreground">Fotograf-IA Admin</span>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie as submissões de fotos dos usuários</p>
        </div>

        {submissions.length === 0 ? (
          <Card className="p-12 text-center border-2 border-[#ffe8df]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#fff5f2] flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-[#ff6b35]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma submissão ainda</h3>
            <p className="text-muted-foreground">As submissões dos usuários aparecerão aqui</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const originalPhotos = submission.photos.filter((p) => p.photo_type === "original")
              const processedPhotos = submission.photos.filter((p) => p.photo_type === "processed")
              const isSelected = selectedSubmission === submission.id

              return (
                <Card
                  key={submission.id}
                  className="p-6 border-2 border-[#ffe8df] hover:border-[#ff8c5c] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">{submission.user_name}</h3>
                      <p className="text-sm text-muted-foreground">{submission.user_email}</p>
                      <p className="text-sm text-[#ff6b35] font-medium mt-1">{submission.specialty}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(submission.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(isSelected ? null : submission.id)}
                        className="border-[#ffe8df]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {isSelected ? "Ocultar" : "Ver Detalhes"}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    Enviado em {new Date(submission.created_at).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(submission.created_at).toLocaleTimeString("pt-BR")}
                  </div>

                  {isSelected && (
                    <div className="space-y-6 pt-4 border-t-2 border-[#ffe8df]">
                      {/* Original Photos */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">
                          Fotos Originais ({originalPhotos.length})
                        </h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {originalPhotos.map((photo) => (
                            <a
                              key={photo.id}
                              href={photo.photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-square rounded-xl overflow-hidden border-2 border-[#ffe8df] hover:border-[#ff6b35] transition-all"
                            >
                              <img
                                src={photo.photo_url || "/placeholder.svg"}
                                alt="Original"
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Processed Photos */}
                      {processedPhotos.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">
                            Fotos Processadas ({processedPhotos.length})
                          </h4>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            {processedPhotos.map((photo) => (
                              <a
                                key={photo.id}
                                href={photo.photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-square rounded-xl overflow-hidden border-2 border-[#d4edda] hover:border-[#28a745] transition-all"
                              >
                                <img
                                  src={photo.photo_url || "/placeholder.svg"}
                                  alt="Processed"
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload Processed Photos */}
                      <div className="bg-[#fff5f2] rounded-2xl p-6 border-2 border-[#ffe8df]">
                        <h4 className="font-semibold text-foreground mb-4">Enviar Fotos Processadas</h4>

                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="border-2 border-dashed border-[#ff8c5c] rounded-xl p-8 text-center hover:bg-[#ffe8df] transition-all">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-[#ff6b35]" />
                              <p className="text-sm font-medium text-foreground">
                                Clique para selecionar fotos processadas
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {uploadingPhotos.length > 0
                                  ? `${uploadingPhotos.length} foto(s) selecionada(s)`
                                  : "PNG, JPG até 10MB cada"}
                              </p>
                            </div>
                          </div>

                          {uploadingPhotos.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                              {uploadingPhotos.map((photo, index) => (
                                <div
                                  key={index}
                                  className="aspect-square rounded-xl overflow-hidden border-2 border-[#ff6b35]"
                                >
                                  <img
                                    src={URL.createObjectURL(photo) || "/placeholder.svg"}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Button
                              onClick={() => updateStatus(submission.id, "processing")}
                              variant="outline"
                              className="flex-1 border-[#ffe8df]"
                              disabled={submission.status === "processing"}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Marcar como Processando
                            </Button>
                            <Button
                              onClick={() => handleUploadProcessed(submission.id)}
                              disabled={uploadingPhotos.length === 0 || isUploading}
                              className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Enviar e Concluir
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
