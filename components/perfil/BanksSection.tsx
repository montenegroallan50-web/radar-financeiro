import Badge from "@/components/ui/Badge";

const banks = [
  { name: "Nubank",  color: "bg-purple-600", connected: true  },
  { name: "Itaú",    color: "bg-orange-600", connected: true  },
  { name: "XP",      color: "bg-brand",      connected: true  },
  { name: "+ Banco", color: "bg-gray-200",   connected: false },
];

export default function BanksSection() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
      <div>
        <h2 className="font-bold text-gray-900">Bancos Conectados</h2>
        <p className="text-xs text-gray-400 mt-0.5">Via Open Finance · Em breve novas integrações</p>
      </div>
      <div className="space-y-3">
        {banks.map((bank) => (
          <div key={bank.name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${bank.color}`}>
              {bank.name[0]}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800">{bank.name}</span>
            {bank.connected
              ? <Badge variant="success">Conectado</Badge>
              : <button className="text-xs text-brand hover:underline font-medium opacity-50 cursor-not-allowed" disabled>Em breve</button>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
