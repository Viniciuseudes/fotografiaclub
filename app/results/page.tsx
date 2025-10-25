"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Download,
  Lock,
  Sparkles,
  Check,
  Crown,
  Zap,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Photo {
  id: string;
  photo_type: string;
  photo_url: string;
  created_at: string;
}

interface Submission {
  id: string;
  user_name: string;
  user_email: string;
  specialty: string;
  status: string;
  created_at: string;
  photos: Photo[];
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      const data = await response.json();
      setSubmission(data.submission);
    } catch (error) {
      console.error("[v0] Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (locked: boolean) => {
    if (locked) {
      setShowPaywall(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#fff5f2] flex items-center justify-center">
            <Camera className="w-8 h-8 text-[#ff6b35]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Submissão não encontrada
          </h2>
          <Button
            asChild
            className="bg-gradient-to-r from-[#ff6b35] to-[#f05520]"
          >
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const processedPhotos = submission.photos.filter(
    (p) => p.photo_type === "processed"
  );
  const isPending = submission.status === "pending";
  const isProcessing = submission.status === "processing";
  const isCompleted = submission.status === "completed";

  if (isPending || isProcessing) {
    return (
      <div className="min-h-screen bg-background">
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
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-2xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4 animate-pulse">
              <Clock className="w-10 h-10 text-[#ff6b35]" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Processando suas Fotos
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nossa IA está trabalhando para criar suas fotos profissionais.
              Você receberá um e-mail quando estiverem prontas (até 24 horas).
            </p>

            <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-3xl border-2 border-[#ff8c5c] p-8 space-y-4">
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
                {isPending ? "Aguardando processamento" : "Em processamento"}
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="border-2 border-[#ffe8df] bg-transparent"
            >
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#ffe8df] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f05520] flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fotograf-IA
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Voltar</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Success Message */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] mb-4 animate-in zoom-in duration-500">
            <Sparkles className="w-10 h-10 text-[#ff6b35]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Suas Fotos Estão Prontas!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Geramos {processedPhotos.length} fotos profissionais usando IA.
            Desbloqueie todas para usar em seus perfis.
          </p>
        </div>

        {/* Photo Gallery */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {processedPhotos.map((photo, index) => {
            const isLocked = index > 0; // First photo is preview, rest are locked

            return (
              <div
                key={photo.id}
                className="relative group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handlePhotoClick(isLocked)}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#fff5f2] border-2 border-[#ffe8df] shadow-lg transition-all group-hover:shadow-2xl group-hover:scale-[1.02]">
                  <Image
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={`Generated photo ${index + 1}`}
                    fill
                    className={`object-cover transition-all ${
                      isLocked ? "blur-md" : ""
                    }`}
                  />

                  {/* Locked Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                          <Lock className="w-8 h-8 text-[#ff6b35]" />
                        </div>
                        <p className="text-white font-semibold text-sm px-4">
                          Clique para desbloquear
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Preview Badge */}
                  {!isLocked && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white text-sm font-medium shadow-lg">
                      <span className="flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Download Button (only for unlocked) */}
                {!isLocked && (
                  <a
                    href={photo.photo_url}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-4 right-4"
                  >
                    <Button
                      size="sm"
                      className="rounded-xl bg-white/90 backdrop-blur-sm text-foreground hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Paywall Card */}
        {showPaywall && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500">
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#fff5f2] hover:bg-[#ffe8df] flex items-center justify-center transition-colors"
              >
                ×
              </button>

              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df]">
                  <Crown className="w-10 h-10 text-[#ff6b35]" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Desbloqueie Todas as Fotos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tenha acesso completo às {processedPhotos.length} fotos
                  profissionais em alta resolução
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-2xl border-2 border-[#ff8c5c] p-6 space-y-4">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-[#ff6b35]">
                      R$ 49
                    </span>
                    <span className="text-muted-foreground">/pacote</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pagamento único
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-[#ffe8df]">
                  {[
                    `${processedPhotos.length} fotos profissionais em alta resolução`,
                    "Download ilimitado",
                    "Uso comercial permitido",
                    "Suporte prioritário",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão Modificado para WhatsApp */}
              <Link
                href="https://wa.me/SEUNUMERO?text=Ol%C3%A1%21%20Gostaria%20de%20desbloquear%20minhas%20fotos%20do%20Fotograf-IA." // <-- SUBSTITUA SEUNUMERO
                target="_blank"
                rel="noopener noreferrer"
                passHref
              >
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl"
                  asChild // Importante para o Link funcionar corretamente com o Button
                >
                  <span>
                    {" "}
                    {/* Envolver o conteúdo em um span */}
                    <Zap className="mr-2 w-5 h-5" />
                    Desbloquear via WhatsApp
                  </span>
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                Pagamento seguro processado via WhatsApp
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#fff5f2] via-[#ffe8df] to-[#ffd1bf] rounded-3xl border-2 border-[#ff8c5c] p-8 md:p-12 text-center space-y-6 shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg">
            <Crown className="w-8 h-8 text-[#ff6b35]" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Pronto para Impressionar?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Desbloqueie todas as suas fotos profissionais e destaque-se em
              seus perfis profissionais
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowPaywall(true)} // Este botão continua abrindo o popup
            className="h-14 px-8 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl"
          >
            <Crown className="mr-2 w-5 h-5" />
            Desbloquear Todas as Fotos
          </Button>
        </div>
      </main>
    </div>
  );
}
