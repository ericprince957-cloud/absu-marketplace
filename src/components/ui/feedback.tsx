import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info" | "warning";

const tones: Record<Tone, { box: string; icon: typeof Info }> = {
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: AlertCircle },
  success: { box: "border-brand-200 bg-brand-50 text-brand-900", icon: CheckCircle2 },
  info: { box: "border-sky-200 bg-sky-50 text-sky-900", icon: Info },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: TriangleAlert },
};

export function Alert({ tone = "info", title, children, className }: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-3.5 text-sm", box, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed">{children}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-stone-400">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm text-stone-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-stone-100 text-stone-700",
  green: "bg-brand-100 text-brand-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-800",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", badgeTones[tone])}>
      {children}
    </span>
  );
}

const statusTone: Record<string, keyof typeof badgeTones> = {
  approved: "green",
  active: "green",
  success: "green",
  completed: "green",
  confirmed: "blue",
  pending: "amber",
  rejected: "red",
  failed: "red",
  cancelled: "red",
  abandoned: "neutral",
  expired: "red",
  sold: "blue",
  archived: "neutral",
  refunded: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "neutral"}>{status.replace(/_/g, " ")}</Badge>;
}
