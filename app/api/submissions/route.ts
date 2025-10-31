// app/api/submissions/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Cliente padrão para o usuário logado
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const profession = formData.get("profession") as string;
    const specialty = formData.get("specialty") as string; // Pegar especialidade do form
    const desiredElements = formData.get("desiredElements") as string; // Pegar elementos do form

    // Validações básicas (pode adicionar mais se necessário)
    if (!name || !profession || !specialty || !desiredElements) {
       return NextResponse.json({ error: "Missing required form fields" }, { status: 400 });
    }


    // Cria o registo da submissão SÓ COM OS DADOS DO FORMULÁRIO
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id, // Adiciona o ID do usuário
        user_name: name,
        user_email: user.email!, // Pegar email do usuário autenticado
        specialty: profession, // Mantido como profissão principal
        user_specialty: specialty, // Salvar especialidade específica
        desired_elements: desiredElements, // Salvar elementos desejados
        phone: user.user_metadata?.phone, // Pegar telefone dos metadados do usuário
        status: "awaiting_photo", // MODIFICADO: Indica que o usuário precisa enviar a foto
      })
      .select()
      .single();

    if (submissionError) {
      console.error("[v0] Submission Error:", submissionError);
      throw submissionError; // Relança o erro para ser capturado abaixo
    }

    // --- LÓGICA DE UPLOAD DE FOTOS REMOVIDA DAQUI ---

    // Retorna sucesso e o ID da submissão criada
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });

  } catch (error) {
    console.error("[v0] API Error in POST /api/submissions:", error);
    // Verifica se é um erro conhecido do Supabase para dar uma resposta mais específica
     if (error && typeof error === 'object' && 'code' in error) {
       const message =
         'message' in error && typeof (error as any).message === 'string'
           ? (error as any).message
           : JSON.stringify(error);
       return NextResponse.json({ error: `Database error: ${message}` }, { status: 500 });
     }
    return NextResponse.json(
      { error: "Failed to create initial submission" },
      { status: 500 }
    );
  }
}

// O método GET permanece igual (usado pelo Admin)
export async function GET() {
  // Esta rota é usada pelo /admin.
  // Usamos o ADMIN CLIENT para bypassar o RLS e ver TUDO.
  try {
    const supabase = getSupabaseAdminClient(); // Cliente Admin aqui!

    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        photos (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("[v0] API Error in GET /api/submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}