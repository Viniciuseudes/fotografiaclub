// app/page.tsx
"use client"; // Necessário para usar hooks como useRef

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  // Camera, // Remover a importação da Camera se não for mais usada
  Zap,
  Shield,
  LogIn,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image"; // Importar o componente Image
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNext, // Remover se não usar
  // CarouselPrevious, // Remover se não usar
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; // Importar o plugin Autoplay
import * as React from "react"; // Importar React para useRef

export default function HomePage() {
  // Array de imagens de exemplo para o carrossel (use suas imagens reais aqui)
  const exampleImages = [
    "/professional-headshot-of-healthcare-professional-i.jpg",
    "/professional-healthcare-headshot.jpg",
    "/professional-healthcare-portrait.jpg",
    "/professional-doctor-headshot.png",
    "/professional-medical-portrait.png",
  ];

  // Configuração do plugin Autoplay
  const plugin = React.useRef<any>(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }) // Delay de 2000ms (2 segundos)
  );

  return (
    // Div principal com fundo gradiente, ocupando toda a tela
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B47] to-[#FF476B] text-white flex flex-col font-sans overflow-x-hidden">
      {/* Header Modificado */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-br from-[#FF6B47]/80 to-[#FF476B]/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-br supports-[backdrop-filter]:from-[#FF6B47]/60 supports-[backdrop-filter]:to-[#FF476B]/60">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo Modificado */}
          <Link href="/" className="flex items-center space-x-2 group">
            {/* Substituir o div com ícone pelo componente Image */}
            <div className="w-10 h-10 relative group-hover:scale-105 transition-transform flex-shrink-0">
              <Image
                src="/logo.png" // Caminho para o seu logo na pasta public
                alt="Fotograf-IA Logo"
                fill // Para preencher o container div
                className="object-contain" // Ajuste conforme necessário (contain, cover, etc.)
              />
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              Fotograf-IA
            </span>
          </Link>
          {/* Botões Admin e Login/Cadastro */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white/80 hover:text-white hover:bg-white/10 px-2 sm:px-3"
            >
              <Link href="/admin/login">
                <Shield className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-white text-[#FF6B47] hover:bg-gray-100 hover:text-[#FF476B] px-3 sm:px-4"
            >
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Login / Cadastro</span>
                <span className="sm:hidden">Entrar</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 xl:gap-16 py-12 md:py-16 px-4 flex-grow">
        {/* Lado Esquerdo - Títulos e Call to Action */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-[45%] flex-shrink-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight max-w-lg">
            SUA IMAGEM PROFISSIONAL ELEVADA POR{" "}
            <span className="font-bold text-black">
              INTELIGÊNCIA ARTIFICIAL
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-light max-w-md">
            Crie sua persona digital perfeita para o mundo profissional.
          </p>
          <Link href="/cadastro" passHref>
            <Button className="mt-6 px-8 py-3 bg-white text-[#FF6B47] hover:bg-gray-100 hover:text-[#FF476B] text-lg font-semibold rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 h-14">
              Começar Agora <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Lado Direito - Imagem Entrada -> Seta -> Carrossel Saída */}
        <div className="lg:w-[55%] flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mt-10 lg:mt-0 w-full">
          {/* Imagem de Entrada */}
          <div className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 relative shadow-2xl rounded-xl overflow-hidden border-2 border-white/30">
            <Image
              src="/casual-photo-of-healthcare-professional.jpg"
              alt="Foto de entrada"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <p className="absolute bottom-2 left-2 text-xs font-semibold bg-black/50 px-2 py-0.5 rounded">
              Sua Foto
            </p>
          </div>

          {/* Seta */}
          <div className="text-white/80 transform rotate-90 sm:rotate-0 my-2 sm:my-0">
            <ChevronsRight className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
          </div>

          {/* Carrossel de Saída Modificado */}
          <div className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-xs lg:max-w-sm xl:max-w-md relative">
            <p className="text-center text-xs font-semibold mb-2 opacity-80">
              Resultados da IA
            </p>
            <Carousel
              plugins={[plugin.current]} // Adicionar o plugin Autoplay aqui
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full shadow-2xl rounded-xl border-2 border-white/30 overflow-hidden"
              // Adicionar handlers para pausar/retomar ao passar o mouse (opcional, já configurado no plugin)
              // onMouseEnter={plugin.current.stop}
              // onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {exampleImages.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[3/4] relative bg-white/10">
                      <Image
                        src={src}
                        alt={`Exemplo IA ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 text-black size-8" /> */}
              {/* <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 text-black size-8" /> */}
            </Carousel>
          </div>
        </div>
      </main>

      {/* Seção Inferior - Vídeos (sem alterações) */}
      <section className="container mx-auto my-16 py-12 px-4 bg-white/10 rounded-xl shadow-2xl backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="lg:w-1/2 flex justify-center items-center w-full">
          <div className="relative w-full max-w-sm aspect-video bg-gray-700/50 rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-xl">Imagem Vídeo</span>
          </div>
        </div>
        <div className="lg:w-1/2 text-center lg:text-left space-y-4 w-full">
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            CONSTRUÇÃO DE VÍDEOS DE ACORDO COM SEU PÚBLICO-ALVO.
          </h2>
          <p className="text-lg font-light">
            Destaque-se com conteúdos visuais que engajam e comunicam sua
            mensagem de forma eficaz.
          </p>
        </div>
      </section>

      {/* Footer / Informações de Contato (sem alterações) */}
      <footer className="w-full bg-white/10 mt-auto py-8 px-4 rounded-t-xl text-center lg:text-left">
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <div className="text-2xl font-bold text-black bg-white px-3 py-1 rounded-md shadow-md">
              Fotograf-IA Club
            </div>
            <div className="text-lg font-semibold text-white/90">
              Fusion Clinic
            </div>
          </div>
          <div className="text-sm space-y-1 text-white/90">
            <p>Telefone: (11) 91811-9054</p>
            <p>E-mail: equipe@fusionclinic.com.br</p>
            <p>Rede social: @fusionclinic</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold text-white/90">
              Fale com a gente!
            </p>
            <div className="w-24 h-24 bg-white rounded-md flex items-center justify-center text-black font-bold border border-gray-300">
              QR Code
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
