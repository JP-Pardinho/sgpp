import type { ReactNode } from "react";
import AuthGuard from "@/app/_components/layout/AuthGuard";
import Rodape from "@/app/_components/layout/Rodape";
import Sidebar from "@/app/_components/layout/Sidebar";

// Layout compartilhado: Sidebar + (Header de cada página) + Rodapé.
// Tudo dentro de app/(sistema)/ exige login.
export default function SistemaLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-slate-100">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    {children}
                    <Rodape />
                </div>
            </div>
        </AuthGuard>
    );
}
