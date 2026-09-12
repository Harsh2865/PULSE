import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeadlineForm } from "../DeadlineForm";

export const metadata = { title: "Add deadline — PULSE" };

export default function NewDeadlinePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/deadlines"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Deadline Radar
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Add deadline</h1>
        <p className="mt-2 text-sm font-medium text-muted">
          Only the title and due date are required.
        </p>
      </div>
      <div className="rounded-3xl border border-border-subtle bg-surface p-8 shadow-xl">
        <DeadlineForm />
      </div>
    </div>
  );
}
