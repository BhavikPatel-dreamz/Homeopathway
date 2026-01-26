import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?from=/my-requests");
  }

  return <>{children}</>;
}
