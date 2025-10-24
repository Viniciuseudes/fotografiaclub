import Link from "next/link";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/actions";

// CORREÇÃO 1: Função agora é 'async'
export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  // CORREÇÃO 2: Usar 'await' para 'desembrulhar' a promise
  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="flex flex-col items-center space-y-3 group">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance text-center">
            Fotograf-IA
          </h1>
        </Link>

        <div className="bg-white rounded-3xl border-2 border-[#ffe8df] p-8 shadow-lg space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Crie sua Conta</h2>
            <p className="text-muted-foreground text-sm">Rápido e fácil</p>
          </div>

          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ddd">Telefone</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ddd"
                  name="ddd"
                  type="text"
                  placeholder="DDD"
                  maxLength={2}
                  required
                  className="w-1/4 h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35] text-center"
                />
                <Input
                  id="numero"
                  name="numero"
                  type="text"
                  placeholder="Número"
                  maxLength={9}
                  required
                  className="w-3/4 h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="h-12 rounded-xl border-[#ffe8df] focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>

            {message && (
              <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {message === "password-mismatch" && "As senhas não conferem."}
                {message === "signup-error" &&
                  "Erro ao criar conta. Tente novamente."}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#f05520] text-white hover:from-[#f05520] hover:to-[#d13f0f] transition-all shadow-lg hover:shadow-xl"
            >
              Criar Conta
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-[#ff6b35] hover:underline"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
