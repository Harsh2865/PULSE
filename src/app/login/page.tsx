import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/SetupNotice";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4">
        <SetupNotice />
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-[0.25em] text-foreground">
            PULSE
          </h1>
          <p className="mt-2 text-sm text-muted">
            Turn campus chaos into your next move.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
