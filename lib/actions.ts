"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=invalid-credentials");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const ddd = formData.get("ddd") as string;
  const numero = formData.get("numero") as string;

  if (password !== confirmPassword) {
    return redirect("/cadastro?message=password-mismatch");
  }

  const phone = `${ddd}${numero}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        phone: phone,
      },
    },
  });

  if (error) {
    console.error("Sign up error:", error.message);
    return redirect("/cadastro?message=signup-error");
  }

  // Redireciona para a página de login com uma mensagem para verificar o e-mail (comportamento padrão do Supabase)
  return redirect("/login?message=check-email");
}
