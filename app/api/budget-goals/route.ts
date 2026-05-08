import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getSessionUserId } from "@/lib/supabase-server";

const DEFAULT_GOALS = [
  { category: "Alimentação", target: 700  },
  { category: "Transporte",  target: 400  },
  { category: "Moradia",     target: 2800 },
  { category: "Saúde",       target: 500  },
  { category: "Lazer",       target: 300  },
  { category: "Educação",    target: 250  },
  { category: "Outros",      target: 300  },
];

// ── GET — busca metas do usuário ─────────────────────────────────────────────
export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = createAdminClient();

    let { data, error } = await supabase
      .from("budget_goals")
      .select("*")
      .eq("user_id", userId)
      .order("category");

    if (error) throw error;

    // Se não tem metas ainda, cria com valores padrão
    if (!data || data.length === 0) {
      const inserts = DEFAULT_GOALS.map(g => ({ ...g, user_id: userId }));
      const { data: newData, error: insertError } = await supabase
        .from("budget_goals")
        .insert(inserts)
        .select();

      if (insertError) throw insertError;
      data = newData;
    }

    return NextResponse.json({ goals: data });
  } catch (err) {
    console.error("GET /api/budget-goals:", err);
    return NextResponse.json({ error: "Erro ao buscar metas" }, { status: 500 });
  }
}

// ── PATCH — atualiza meta de uma categoria ───────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { category, target } = body;

    if (!category || target === undefined) {
      return NextResponse.json({ error: "Campos obrigatórios: category, target" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("budget_goals")
      .upsert(
        { user_id: userId, category, target, updated_at: new Date().toISOString() },
        { onConflict: "user_id,category" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ goal: data });
  } catch (err) {
    console.error("PATCH /api/budget-goals:", err);
    return NextResponse.json({ error: "Erro ao salvar meta" }, { status: 500 });
  }
}
