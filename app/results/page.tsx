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
  CreditCard, // Importei o ícone de Cartão de Crédito
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
    } else {
      setLoading(false); // Se não houver ID, para de carregar
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    setLoading(true); // Garante que o loading seja ativado a cada fetch
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      if (!response.ok) {
        // Trata erros como 404 (não encontrado)
        console.error(`[v0] Error fetching submission: ${response.status}`);
        setSubmission(null); // Define como nulo se não encontrar
      } else {
        const data = await response.json();
        setSubmission(data.submission);
      }
    } catch (error) {
      console.error("[v0] Error fetching submission:", error);
      setSubmission(null); // Define como nulo em caso de erro de rede, etc.
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
          <p className="text-muted-foreground">
            Verifique o link ou tente novamente.
          </p>
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

  // --- MODIFICAÇÃO PARA INCLUIR pending_drive_link ---
  // Considere 'pending_drive_link' também como um estado de espera/processamento inicial
  const isWaitingOrProcessing =
    submission.status === "pending" ||
    submission.status === "processing" ||
    submission.status === "pending_drive_link"; // Adicionado aqui

  // Use a nova variável na condição if
  if (isWaitingOrProcessing) {
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
            {/* Ajusta o título se necessário */}
            <h1 className="text-4xl font-bold text-foreground">
              {submission.status === "pending_drive_link"
                ? "Enviando Fotos..."
                : submission.status === "pending"
                ? "Suas Fotos Estão na Fila!"
                : "Processando suas Fotos"}
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
                Status: {/* Ajusta o texto do status */}
                {submission.status === "pending_drive_link"
                  ? "Enviando..."
                  : submission.status === "pending"
                  ? "Aguardando processamento"
                  : "Em processamento"}
              </p>
            </div>

            <Button
              variant="outline"
              className="border-2 border-[#ffe8df] bg-transparent"
              // Adiciona um refresh para o caso de ter caído no pending_drive_link por timing
              onClick={() => window.location.reload()}
            >
              <span>Verificar Status</span>
            </Button>
            <Button
              asChild
              variant="link"
              className="text-muted-foreground text-sm block mx-auto mt-2"
            >
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  // --- FIM DA MODIFICAÇÃO ---

  // Se NÃO for nenhum dos status acima (nem loading, nem not found, nem waiting/processing),
  // mostra a página de resultados completos/paywall
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
            {processedPhotos.length > 0
              ? `Geramos ${processedPhotos.length} fotos profissionais. Sua amostra grátis está abaixo! Desbloqueie o pacote completo.`
              : "As fotos processadas estarão disponíveis aqui em breve."}
          </p>
        </div>

        {/* Photo Gallery */}
        {processedPhotos.length > 0 ? (
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
                      priority={index === 0} // Prioriza o carregamento da primeira imagem
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                          Preview Grátis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Download Button (only for unlocked) */}
                  {!isLocked && (
                    <a
                      href={photo.photo_url}
                      download={`fotograf_ia_${submissionId}_preview.jpg`} // Adiciona nome de arquivo sugerido
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-4 right-4"
                      aria-label="Baixar foto de preview"
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
        ) : (
          <div className="text-center text-muted-foreground mb-12">
            Nenhuma foto processada encontrada para esta submissão.
          </div>
        )}

        {/* Paywall Card */}
        {showPaywall &&
          processedPhotos.length > 0 && ( // Só mostra se houver fotos
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowPaywall(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#fff5f2] hover:bg-[#ffe8df] flex items-center justify-center transition-colors text-muted-foreground text-2xl leading-none z-10"
                  aria-label="Fechar popup de desbloqueio"
                >
                  &times; {/* Usar um 'x' mais padrão */}
                </button>

                <div className="text-center space-y-4 pt-8 sm:pt-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fff5f2] to-[#ffe8df]">
                    <Crown className="w-10 h-10 text-[#ff6b35]" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Desbloqueie Suas Fotos
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Escolha o pacote que mais combina com você:
                  </p>
                </div>

                {/* --- INÍCIO DO BLOCO DE PREÇOS ATUALIZADO --- */}
                <div className="space-y-4">
                  {/* OFERTA 1: PACOTE HEALTH SUMMIT */}
                  <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffe8df] rounded-2xl border-2 border-[#ff8c5c] p-6 space-y-4 relative overflow-hidden">
                    {/* Selo de Destaque */}
                    <div className="absolute -top-1 -right-1 w-24 h-24">
                      <div className="absolute transform rotate-45 bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white text-xs font-bold text-center py-1 right-[-40px] top-[32px] w-[170px] shadow-lg">
                        Health Summit
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-foreground">
                        Pacote Evento
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Exclusivo para participantes do Health Summit!
                      </p>
                      <div className="flex items-baseline justify-center gap-3 pt-2">
                        <span className="text-2xl font-medium text-muted-foreground line-through">
                          R$ 199,00
                        </span>
                        <span className="text-5xl font-extrabold text-[#ff6b35]">
                          R$ 99,90
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pagamento único
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t-2 border-[#ffe8df]">
                      {[
                        `Pacote com 11 fotos
                         em alta resolução`, // Ex: 11-1 = 10
                        "Download ilimitado",
                        "Uso comercial permitido",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Botão Pagar.me */}
                    <Link
                      href="https://payment-link-v3.pagar.me/pl_1v7m3AZMyaN9EdxIYHPZEBKneWRYVzp6" // SEU LINK DE PAGAMENTO
                      target="_blank"
                      rel="noopener noreferrer"
                      passHref
                    >
                      <Button
                        size="lg"
                        className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl"
                        asChild
                      >
                        <span>
                          <CreditCard className="mr-2 w-5 h-5" />
                          Pagar Agora (R$ 99,90)
                        </span>
                      </Button>
                    </Link>
                  </div>

                  {/* Divisor */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-xs font-medium text-muted-foreground">
                      OU
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>

                  {/* OFERTA 2: ENSAIO PERSONALIZADO */}
                  <div className="bg-white rounded-2xl border-2 border-border p-6 space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-foreground">
                        Ensaio Personalizado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ideal para quem quer se posicionar no seu nicho.
                      </p>
                      <div className="flex items-baseline justify-center gap-3 pt-2">
                        <span className="text-5xl font-extrabold text-foreground">
                          R$ 199,90
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t-2 border-border">
                      {[
                        "Sessão de fotos dedicada",
                        "Direção de arte e pose",
                        "Múltiplos cenários e looks",
                        "Entrega de alta qualidade",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Botão WhatsApp 2 (Mantido) */}
                    <Link
                      href="https://wa.me/SEUNUMERO?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20o%20Ensaio%20Personalizado%20de%20R%24199%2C90." // <-- SUBSTITUA SEUNUMERO
                      target="_blank"
                      rel="noopener noreferrer"
                      passHref
                    >
                      <Button
                        size="lg"
                        variant="outline" // Botão diferenciado
                        className="w-full h-14 text-base font-medium rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 hover:text-primary"
                        asChild
                      >
                        <span>
                          <Zap className="mr-2 w-5 h-5" />
                          Agendar via WhatsApp
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* --- FIM DO BLOCO DE PREÇOS ATUALIZADO --- */}

                <p className="text-xs text-center text-muted-foreground">
                  Pagamento seguro.
                </p>
              </div>
            </div>
          )}

        {/* CTA Section (Só mostra se houver fotos) */}
        {processedPhotos.length > 0 && (
          <div className="bg-gradient-to-br from-[#fff5f2] via-[#ffe8df] to-[#ffd1bf] rounded-3xl border-2 border-[#ff8c5c] p-8 md:p-12 text-center space-y-6 shadow-xl mt-12">
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
              Ver Opções de Desbloqueio
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
