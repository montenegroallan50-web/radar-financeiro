"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de pelo menos uma maiúscula")
      .regex(/[0-9]/, "Precisa de pelo menos um número"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v, "Aceite os termos para continuar"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
];

export default function CadastroForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password", "");

  const onSubmit = async (_data: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Nome completo"
        type="text"
        placeholder="Maria Silva"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="space-y-2">
        <Input
          label="Senha"
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          suffix={
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register("password")}
        />
        {passwordValue.length > 0 && (
          <div className="flex gap-3 flex-wrap pt-1">
            {passwordRules.map((rule) => (
              <span
                key={rule.label}
                className={cn(
                  "flex items-center gap-1 text-xs transition-colors",
                  rule.test(passwordValue) ? "text-brand" : "text-gray-400"
                )}
              >
                <CheckCircle2 size={12} />
                {rule.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <Input
        label="Confirmar senha"
        type={showConfirm ? "text" : "password"}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        suffix={
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...register("confirmPassword")}
      />

      <div>
        <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-gray-300 text-brand focus:ring-brand"
            {...register("terms")}
          />
          <span>
            Concordo com os{" "}
            <button type="button" className="text-brand hover:underline font-medium">
              Termos de Uso
            </button>{" "}
            e{" "}
            <button type="button" className="text-brand hover:underline font-medium">
              Política de Privacidade
            </button>
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-red-500 mt-1">{errors.terms.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        Criar minha conta
      </Button>
    </form>
  );
}
