import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin" // Importe o admin client

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Esta rota é usada pelo usuário na página /results
  // Deve usar o cliente padrão (baseado em cookies) para respeitar o RLS.
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient() // Cliente Padrão

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: submission, error } = await supabase
      .from("submissions")
      .select(`
        *,
        photos (*)
      `)
      .eq("id", id)
      .eq("user_id", user.id) // RLS é verificado aqui
      .single()

    if (error) {
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ error: "Submission not found or access denied" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Esta rota PATCH é usada pelo /admin.
  // Deve usar o ADMIN CLIENT para bypassar o RLS e atualizar QUALQUER submissão.
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient() // Cliente Admin aqui!
    const formData = await request.formData()

    const status = formData.get("status") as string

    // Update submission status
    if (status) {
      const { error: updateError } = await supabase
        .from("submissions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (updateError) throw updateError
    }

    // Upload processed photos if provided
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (key.startsWith("processed-") && value instanceof File) {
        const file = value
        const fileName = `${id}/processed/${Date.now()}-${file.name}`

        // O upload de storage também deve ser feito pelo admin client
        const { data: uploadData, error: uploadError } = await supabase.storage.from("photos").upload(fileName, file)

        if (uploadError) {
          console.error("[v0] Upload error:", uploadError)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(fileName)

        await supabase.from("photos").insert({
          submission_id: id,
          photo_type: "processed",
          photo_url: publicUrl,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
  }
}