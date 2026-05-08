import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getSessionUserId } from "@/lib/supabase-server";

export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const alertsCreated: string[] = [];
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    // ── 1. Busca configurações do usuário ─────────────────────────────────
    const { data: settings } = await supabase
      .from("alert_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Se não tem configurações, usa padrões
    const cfg = settings ?? {
      orcamento_estourado:    true,
      proximo_limite:         true,
      transacao_alta:         true,
      saldo_baixo:            false,
      vencimento_proximo:     true,
      rentabilidade_negativa: true,
      threshold_percent:      80,
    };

    // ── 2. Busca alertas já existentes hoje (evita duplicatas) ────────────
    const hoje = now.toISOString().split("T")[0];
    const { data: existingToday } = await supabase
      .from("alerts")
      .select("title")
      .eq("user_id", userId)
      .gte("created_at", `${hoje}T00:00:00Z`);

    const titulosHoje = new Set((existingToday || []).map((a: any) => a.title));

    async function criarAlerta(type: string, title: string, description: string) {
      if (titulosHoje.has(title)) return;
      await supabase.from("alerts").insert({ user_id: userId, type, title, description });
      alertsCreated.push(title);
    }

    // ── 3. Busca transações do mês atual ──────────────────────────────────
    const inicioMes = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, category, description, date, type")
      .eq("user_id", userId)
      .gte("date", inicioMes);

    // ── 4. Alerta de transação alta ───────────────────────────────────────
    if (cfg.transacao_alta) {
      const gastosAltos = (transactions || []).filter(
        (t: any) => t.type === "DEBIT" && Math.abs(t.amount) >= 500
      );
      for (const t of gastosAltos) {
        await criarAlerta(
          "gasto_alto",
          `Gasto alto: ${t.description}`,
          `Transação de R$ ${Math.abs(t.amount).toFixed(2)} detectada em ${t.category} no dia ${t.date}.`
        );
      }
    }

    // ── 5. Alerta de orçamento estourado e próximo do limite ──────────────
    if (cfg.orcamento_estourado || cfg.proximo_limite) {
      // Busca gastos reais por categoria no mês
      const gastosPorCategoria: Record<string, number> = {};
      (transactions || [])
        .filter((t: any) => t.type === "DEBIT")
        .forEach((t: any) => {
          const cat = t.category || "Outros";
          gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + Math.abs(t.amount);
        });

      // Busca metas do orçamento
      const { data: budgetData } = await supabase
        .from("budget_goals")
        .select("category, target")
        .eq("user_id", userId);

      for (const b of (budgetData || [])) {
        const gasto = gastosPorCategoria[b.category] || 0;
        const pct = b.target > 0 ? (gasto / b.target) * 100 : 0;

        // Orçamento estourado (> 100%)
        if (cfg.orcamento_estourado && pct > 100) {
          await criarAlerta(
            "meta_orcamento",
            `${b.category} estourou o orçamento`,
            `Você gastou R$ ${gasto.toFixed(2)} de R$ ${b.target.toFixed(2)} orçados em ${b.category}. Limite ultrapassado em R$ ${(gasto - b.target).toFixed(2)}.`
          );
        }
        // Próximo do limite (entre threshold% e 100%)
        else if (cfg.proximo_limite && pct >= cfg.threshold_percent && pct <= 100) {
          await criarAlerta(
            "meta_orcamento",
            `${b.category} em ${Math.round(pct)}% do orçamento`,
            `Você gastou R$ ${gasto.toFixed(2)} de R$ ${b.target.toFixed(2)} orçados em ${b.category}. Restam R$ ${(b.target - gasto).toFixed(2)}.`
          );
        }
      }
    }

    // ── 6. Alerta de investimento vencendo em 60 dias ─────────────────────
    if (cfg.vencimento_proximo) {
      const { data: investments } = await supabase
        .from("investments")
        .select("name, maturity_date, current_amount")
        .eq("user_id", userId)
        .not("maturity_date", "is", null);

      for (const inv of (investments || [])) {
        const diasParaVencer = Math.floor(
          (new Date(inv.maturity_date).getTime() - now.getTime()) / 86400000
        );
        if (diasParaVencer > 0 && diasParaVencer <= 60) {
          await criarAlerta(
            "vencimento_investimento",
            `${inv.name} vence em ${diasParaVencer} dias`,
            `Investimento de R$ ${Number(inv.current_amount).toFixed(2)} vence em ${diasParaVencer} dias. Considere o reinvestimento.`
          );
        }
      }
    }

    // ── 7. Alerta de saldo baixo ──────────────────────────────────────────
    if (cfg.saldo_baixo) {
      const { data: accounts } = await supabase
        .from("connected_accounts")
        .select("name, balance")
        .eq("user_id", userId);

      for (const acc of (accounts || [])) {
        if (acc.balance < 500) {
          await criarAlerta(
            "saldo_baixo",
            `Saldo baixo: ${acc.name}`,
            `Sua conta ${acc.name} está com saldo de R$ ${Number(acc.balance).toFixed(2)}, abaixo de R$ 500,00.`
          );
        }
      }
    }

    // ── 8. Alerta de rentabilidade negativa ──────────────────────────────────
    if (cfg.rentabilidade_negativa) {
      const { data: negativeInvest } = await supabase
        .from("investments")
        .select("name, return_percent")
        .eq("user_id", userId)
        .lt("return_percent", 0);

      for (const inv of (negativeInvest || [])) {
        await criarAlerta(
          "meta_orcamento",
          `${inv.name} com rentabilidade negativa`,
          `${inv.name} registrou ${Number(inv.return_percent).toFixed(1)}% de rentabilidade este mês. Considere avaliar sua posição.`
        );
      }
    }

    return NextResponse.json({
      success: true,
      alertsCreated: alertsCreated.length,
      titles: alertsCreated,
    });

  } catch (err) {
    console.error("POST /api/alerts/generate:", err);
    return NextResponse.json({ error: "Erro ao gerar alertas" }, { status: 500 });
  }
}
