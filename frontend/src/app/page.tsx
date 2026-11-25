import { redirect } from "next/navigation";

export const instant = false;

// A raiz apenas encaminha para o dashboard (o AuthGuard manda para /login se não houver sessão).
export default function Home() {
  redirect("/dashboard");
}
