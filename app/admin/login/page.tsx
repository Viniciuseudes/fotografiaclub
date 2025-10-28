"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Senha simples para MVP - você pode mudar isso
    const ADMIN_PASSWORD = "admin123";

    if (password === ADMIN_PASSWORD) {
      // Salva no localStorage que está autenticado
      localStorage.setItem("isAdmin", "true");
      router.push("/admin");
    } else {
      setError("Senha incorreta");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Área Administrativa
            </h1>
            <p className="text-gray-600">Fotograf-IA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Administrador</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Digite a senha"
                className="border-orange-200 focus:border-orange-500"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-700">
              <strong>Senha padrão:</strong> admin123
            </p>
            <p className="text-xs text-gray-600 mt-1"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
