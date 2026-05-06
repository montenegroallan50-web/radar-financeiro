"use client";

import { useState } from "react";
import { Camera, Check } from "lucide-react";
import { UserProfile } from "@/lib/mock-data";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Props {
  user: UserProfile;
}

export default function ProfileForm({ user }: Props) {
  const [name, setName]   = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-5">
      <h2 className="font-bold text-gray-900">Informações Pessoais</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center text-white text-xl font-bold">
            {user.avatarInitials}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={18} className="text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-400">Clique para trocar a foto</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="E-mail"
          value={user.email}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-400 -mt-2">Para alterar o e-mail, entre em contato com o suporte.</p>
        <Input
          label="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>

      <Button onClick={handleSave} size="md">
        {saved ? <><Check size={15} /> Salvo!</> : "Salvar alterações"}
      </Button>
    </div>
  );
}
