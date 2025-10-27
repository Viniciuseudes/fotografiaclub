// app/api/submissions/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server"; // Cliente padrão (para usuário)
import { getSupabaseAdminClient } from "@/lib/supabase/admin";   // Cliente Admin (para admin)

// GET continua igual (usado pelo usuário para ver seus resultados)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient(); // Cliente Padrão

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: submission, error } = await supabase
      .from("submissions")
      .select(`
        *,
        photos (*)
      `)
      .eq("id", id)
      .eq("user_id", user.id) // Garante que o usuário só veja a sua submissão
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Submission not found or access denied" }, { status: 404 });
      }
      console.error("[v0] GET Submission Error:", error);
      throw error;
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("[v0] API GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}


// PATCH modificado para lidar com uploads do Usuário e do Admin
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const entries = Array.from(formData.entries()); // Para iterar múltiplas vezes

    // --- Lógica para Upload de Fotos do Usuário ---
    const userPhotoEntries = entries.filter(([key]) => key.startsWith("user-photo-"));
    if (userPhotoEntries.length > 0) {
        const supabase = await getSupabaseServerClient(); // Usa cliente padrão para validação RLS
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized: User not authenticated" }, { status: 401 });
        }

        // Verifica se a submissão pertence ao usuário logado ANTES de fazer upload
        const { data: submissionData, error: submissionCheckError } = await supabase
            .from('submissions')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle();

        if (submissionCheckError || !submissionData) {
            console.error("[v0] Submission check error or not found/authorized:", submissionCheckError);
            return NextResponse.json({ error: "Submission not found or access denied for user photos" }, { status: 404 });
        }

        // Processa o upload das fotos do usuário
        for (const [key, value] of userPhotoEntries) {
            if (value instanceof File) {
                const file = value;
                // Salva na pasta /user_originals/ dentro do ID da submissão
                const fileName = `${id}/user_originals/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`; // Nome de arquivo seguro

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("photos")
                    .upload(fileName, file);

                if (uploadError) {
                    console.error(`[v0] User Photo Upload error (${key}):`, uploadError);
                    continue; // Pula esta foto se der erro, mas tenta as outras
                }

                const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(fileName);

                // Insere no banco com tipo 'original'
                const { error: insertError } = await supabase.from("photos").insert({
                    submission_id: id,
                    photo_type: "original", // Salva como 'original'
                    photo_url: publicUrl,
                });
                if (insertError){
                     console.error(`[v0] User Photo Insert DB error (${key}):`, insertError);
                     // Considerar: deveria deletar o arquivo do storage se a inserção falhar? (rollback manual)
                }
            }
        }

        // Atualiza o status da submissão para 'pending' APÓS o upload das fotos do usuário
        const newStatus = formData.get("status") as string || "pending"; // Pega status do form ou default 'pending'
        const { error: updateStatusError } = await supabase
            .from("submissions")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id); // Garante que só atualize a própria submissão

        if (updateStatusError) {
            console.error("[v0] User Submission Status Update Error:", updateStatusError);
            // Mesmo com erro aqui, as fotos foram salvas. Retorna sucesso parcial?
            // Por enquanto, vamos retornar sucesso, mas logamos o erro.
        }

        return NextResponse.json({ success: true, message: "User photos uploaded." });

    // --- Lógica para Upload de Fotos Processadas pelo Admin ---
    } else if (entries.some(([key]) => key.startsWith("processed-")) || formData.has("status")) {
        const supabaseAdmin = getSupabaseAdminClient(); // Usa cliente Admin para bypassar RLS
        const status = formData.get("status") as string;

        // Atualiza o status (se enviado) - Admin pode mudar qualquer status
        if (status) {
            const { error: updateError } = await supabaseAdmin
                .from("submissions")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id);
            if (updateError) {
                console.error("[v0] Admin Status Update Error:", updateError);
                // Não joga erro aqui para permitir o upload mesmo se a atualização de status falhar
            }
        }

        // Processa o upload das fotos processadas pelo admin
        const processedPhotoEntries = entries.filter(([key]) => key.startsWith("processed-"));
        for (const [key, value] of processedPhotoEntries) {
            if (value instanceof File) {
                const file = value;
                 // Salva na pasta /processed/ dentro do ID da submissão
                const fileName = `${id}/processed/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`; // Nome de arquivo seguro

                const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                    .from("photos")
                    .upload(fileName, file);

                if (uploadError) {
                    console.error(`[v0] Admin Processed Photo Upload error (${key}):`, uploadError);
                    continue; // Pula esta foto se der erro
                }

                const { data: { publicUrl } } = supabaseAdmin.storage.from("photos").getPublicUrl(fileName);

                // Insere no banco com tipo 'processed'
                const { error: insertError } = await supabaseAdmin.from("photos").insert({
                    submission_id: id,
                    photo_type: "processed", // Salva como 'processed'
                    photo_url: publicUrl,
                });
                 if (insertError){
                     console.error(`[v0] Admin Processed Photo Insert DB error (${key}):`, insertError);
                 }
            }
        }

         // Se o status foi explicitamente setado para completed OU se fotos processadas foram enviadas
         // e nenhum status foi enviado, assume completed.
         if (status === 'completed' || (processedPhotoEntries.length > 0 && !status)) {
             const { error: finalUpdateError } = await supabaseAdmin
                 .from("submissions")
                 .update({ status: 'completed', updated_at: new Date().toISOString() })
                 .eq("id", id);
             if (finalUpdateError) {
                  console.error("[v0] Admin Final Status Update Error:", finalUpdateError);
             }
         }

        return NextResponse.json({ success: true, message: "Admin update processed." });

    } else {
        // Se não enviou nem fotos do usuário nem fotos processadas/status
        return NextResponse.json({ error: "No valid data provided for update" }, { status: 400 });
    }

  } catch (error) {
    console.error("[v0] API PATCH Error:", error);
     if (error && typeof error === 'object' && 'code' in error) {
       const message =
         error instanceof Error
           ? error.message
           : (error && typeof error === 'object' && 'message' in error)
             ? String((error as any).message)
             : String(error);
       return NextResponse.json({ error: `Database/Storage error: ${message}` }, { status: 500 });
     }
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}