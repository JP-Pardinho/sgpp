import PermissaoGuard from "@/app/_components/layout/PermissaoGuard";
import NovoFinanciamentoForm from "@/app/_components/financiamentos/NovoFinanciamentoForm";

// Tela 5.6 - Criar Novo Financiamento (/financiamentos/novo)
export default function NovoFinanciamentoPage() {
  return (
    <PermissaoGuard permissao="gerenciarFinanciamentos">
      <NovoFinanciamentoForm />
    </PermissaoGuard>
  );
}
