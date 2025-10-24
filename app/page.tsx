import Link from "next/link";
import { ArrowRight, Sparkles, Camera, Zap, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Camera className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fotograf-IA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground"
            >
              <Link href="/admin/login">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login / Cadastre-se
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Content */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Powered by AI
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              Crie sua sessão profissional com IA
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              Envie sua foto e receba imagens prontas para o seu perfil
              profissional.
            </p>

            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-medium rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl"
              >
                <Link href="/form">
                  Começar agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Before/After Showcase */}
          <div className="grid md:grid-cols-2 gap-6 pt-8">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-secondary border border-border shadow-lg">
                <Image
                  src="/casual-photo-of-healthcare-professional.jpg"
                  alt="Foto original"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border">
                  <span className="text-sm font-medium text-foreground">
                    Antes
                  </span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Foto casual comum
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-secondary border-2 border-accent shadow-xl">
                <Image
                  src="/professional-headshot-of-healthcare-professional-i.jpg"
                  alt="Foto profissional"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground backdrop-blur-sm">
                  <span className="text-sm font-medium flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Depois
                  </span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Imagem profissional gerada por IA
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-2xl bg-secondary border border-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Rápido</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Suas fotos profissionais prontas em até 24 horas
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-secondary border border-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Personalizado
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fotos adaptadas para sua área de atuação
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-secondary border border-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Profissional
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Qualidade de estúdio fotográfico
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
