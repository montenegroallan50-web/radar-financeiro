import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionUserId } from "@/lib/supabase-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── GET — busca todos os alertas do usuário ──────────────────────────────────
export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ alerts: data });
  } catch (err) {
    console.error("GET /api/alerts:", err);
    return NextResponse.json({ error: "Erro ao buscar alertas" }, { status: 500 });
  }
}

// ── POST — cria um alerta novo ───────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description } = body;

    if (!type || !title || !description) {
      return NextResponse.json({ error: "Campos obrigatórios: type, title, description" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("alerts")
      .insert({ user_id: userId, type, title, description })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ alert: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/alerts:", err);
    return NextResponse.json({ error: "Erro ao criar alerta" }, { status: 500 });
  }
}

// ── PATCH — marca alerta como lido ──────────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "Campo obrigatório: id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("alerts")
      .update({ read: read ?? true })
      .eq("id", id)
      .eq("user_id", userId) // segurança: só atualiza o próprio alerta
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ alert: data });
  } catch (err) {
    console.error("PATCH /api/alerts:", err);
    return NextResponse.json({ error: "Erro ao atualizar alerta" }, { status: 500 });
  }
}
