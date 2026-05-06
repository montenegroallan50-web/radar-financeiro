"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  current:  z.string().min(1, "Informe a senha atual"),
  newPass:  z.string().min(8, "Mínimo 8 caracteres").regex(/[A-Z]/, "Precisa de uma maiúscula").regex(/[0-9]/, "Precisa de um número"),
  confirm:  z.string(),
}).refine((d) => d.newPass === d.confirm, { message: "Senhas não conferem", path: ["confirm"] });

type F = z.infer<typeof schema>;

export default function PasswordForm() {
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    reset();
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (k: keyof typeof show) => setShow((v) => ({ ...v, [k]: !v[k] }));

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
      <h2 className="font-bold text-gray-900">Alterar Senha</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Senha atual" type={show.current ? "text" : "password"} error={errors.current?.message}
          suffix={<button type="button" onClick={() => toggle("current")} tabIndex={-1} className="text-gray-400 hover:text-gray-600">{show.current ? <EyeOff size={15}/> : <Eye size={15}/>}</button>}
          {...register("current")} />
        <Input label="Nova senha" type={show.newPass ? "text" : "password"} error={errors.newPass?.message}
          suffix={<button type="button" onClick={() => toggle("newPass")} tabIndex={-1} className="text-gray-400 hover:text-gray-600">{show.newPass ? <EyeOff size={15}/> : <Eye size={15}/>}</button>}
          {...register("newPass")} />
        <Input label="Confirmar nova senha" type={show.confirm ? "text" : "password"} error={errors.confirm?.message}
          suffix={<button type="button" onClick={() => toggle("confirm")} tabIndex={-1} className="text-gray-400 hover:text-gray-600">{show.confirm ? <EyeOff size={15}/> : <Eye size={15}/>}</button>}
          {...register("confirm")} />
        <Button type="submit" size="md">{saved ? "Senha alterada!" : "Alterar senha"}</Button>
      </form>
    </div>
  );
}
