import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import NovaProducaoForm from "@/app/_components/producoes/NovaProducaoForm";

// Tela 5.10 - Cadastrar Produção Científica (/producoes/nova)
export default function NovaProducaoPage() {
  return (
    <PermissaoGuard permissao="gerenciarProducoes">
      <NovaProducaoForm />
    </PermissaoGuard>
  );
}
