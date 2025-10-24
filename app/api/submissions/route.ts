import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin" // Importe o admin client

export async function POST(request: NextRequest) {
  try {
    // Cliente padrão para o usuário logado
    const supabase = await getSupabaseServerClient() 
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const formData = await request.formData()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const profession = formData.get("profession") as string

    // Insere dados com o ID do usuário
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id, 
        user_name: name,
        user_email: email,
        specialty: profession,
        status: "pending",
      })
      .select()
      .single()

    if (submissionError) throw submissionError

    // Upload de fotos (continua igual)
    const photoUrls: string[] = []
    const entries = Array.from(formData.entries())

    for (const [key, value] of entries) {
      if (key.startsWith("photo-") && value instanceof File) {
        const file = value
        const fileName = `${submission.id}/${Date.now()}-${file.name}`

        const { data: uploadData, error: uploadError } = await supabase.storage.from("photos").upload(fileName, file)

        if (uploadError) {
          console.error("[v0] Upload error:", uploadError)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(fileName)

        photoUrls.push(publicUrl)

        await supabase.from("photos").insert({
          submission_id: submission.id,
          photo_type: "original",
          photo_url: publicUrl,
        })
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      photoCount: photoUrls.length,
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}

export async function GET() {
  // Esta rota é usada pelo /admin.
  // Usamos o ADMIN CLIENT para bypassar o RLS e ver TUDO.
  try {
    const supabase = getSupabaseAdminClient() // Cliente Admin aqui!

    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(`
        *,
        photos (*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}