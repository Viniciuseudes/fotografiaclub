import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// CORREÇÃO: A função foi renomeada de 'middleware' para 'proxy'
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Rotas protegidas
  if (pathname.startsWith("/form") || pathname.startsWith("/results")) {
    if (!session) {
      // Redireciona para /login se não houver sessão
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Combine todas as rotas exceto por:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (ícone)
     * - / (página inicial)
     * - /login
     * - /cadastro
     * - /admin (e sub-rotas)
     * - /api (e sub-rotas)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|cadastro|admin/:path*|api/:path*|\\/).*)",
  ],
};