import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getSessionUserId } from "@/lib/supabase-server";

// ── GET — busca configurações do usuário ─────────────────────────────────────
export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Busca configurações existentes
    const { data, error } = await supabase
      .from("alert_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Se não existe ainda, cria com valores padrão
    if (error && error.code === "PGRST116") {
      const { data: newData, error: insertError } = await supabase
        .from("alert_settings")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      return NextResponse.json({ settings: newData });
    }

    if (error) throw error;

    return NextResponse.json({ settings: data });
  } catch (err) {
    console.error("GET /api/alert-settings:", err);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

// ── PATCH — atualiza configurações ──────────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("alert_settings")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ settings: data });
  } catch (err) {
    console.error("PATCH /api/alert-settings:", err);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
