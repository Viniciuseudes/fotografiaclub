import { createServerClient } from "@supabase/ssr";

// ESTE CLIENTE USA A SERVICE ROLE KEY E DEVE SER USADO APENAS NO BACKEND (API ROUTES)
// PARA OPERAÇÕES ADMINISTRATIVAS. ELE IGNORA O RLS.

export function getSupabaseAdminClient() {
  // Validação para garantir que as variáveis de ambiente estão definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase URL or Service Role Key environment variables.");
  }

  // Criamos um cliente sem cookies, pois ele não representa um usuário,
  // mas sim o sistema (admin).
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Impede o cliente de tentar usar/salvar um cookie de sessão
        persistSession: false,
      },
      // CORREÇÃO: Forneça funções vazias para satisfazer a tipagem do createServerClient
      cookies: {
        getAll() {
          return [];
        },
        setAll(_) {
          // Não faz nada
        },
      },
    }
  );
}