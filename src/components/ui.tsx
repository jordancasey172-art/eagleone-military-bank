import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { EMAIL, OTP_CODES, type TxStatus } from "../data";

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          {title && <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: TxStatus | "VERIFIED" | "LOCKED" | "PENDING" }) {
  const styles: Record<string, string> = {
    POSTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    VERIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    LOCKED: "bg-red-50 text-red-700 ring-red-200",
    FAILED: "bg-red-50 text-red-700 ring-red-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", styles[status])}>
      {(status === "LOCKED" || status === "FAILED") && <LockIcon className="h-3 w-3" />}
      {status}
    </span>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const v = {
    primary: "bg-blue-900 text-white hover:bg-blue-800 disabled:bg-slate-300",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
    ghost: "text-blue-900 hover:bg-blue-50",
  }[variant];
  return (
    <button
      className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed", v, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              i < current ? "bg-emerald-600 text-white" : i === current ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span className={cn("hidden text-xs font-medium sm:block", i === current ? "text-slate-900" : "text-slate-400")}>{s}</span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}

export function SummaryRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={cn("text-right text-sm font-medium text-slate-900", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

export function OtpStep({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [resent, setResent] = useState(false);
  const [remaining, setRemaining] = useState(OTP_TTL_SECONDS);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setRemaining(Math.max(0, OTP_TTL_SECONDS - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [resent]);

  const expired = remaining === 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = (remaining / OTP_TTL_SECONDS) * 100;
  const urgent = remaining <= 60 && !expired;

  const submit = () => {
    if (expired) {
      setErr("This code has expired. Tap 'Resend code' to receive a new one.");
      return;
    }
    if (OTP_CODES.includes(code.trim())) onVerified();
    else setErr("The code entered is incorrect. Check your email and try again.");
  };

  const resend = () => {
    startedAt.current = Date.now();
    setRemaining(OTP_TTL_SECONDS);
    setResent(true);
    setErr("");
    setCode("");
    window.setTimeout(() => setResent(false), 4000);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Security Notification</p>
        <p className="mt-1 text-sm text-blue-900">
          A one-time passcode was sent to your email on file, <span className="font-semibold">{EMAIL}</span>.
        </p>
        <p className="mt-1 text-xs text-blue-700">Enter the 6-digit code below to continue.</p>
      </div>

      {/* Countdown timer */}
      <div
        className={cn(
          "mb-4 rounded-lg border p-3",
          expired
            ? "border-red-200 bg-red-50"
            : urgent
            ? "border-amber-200 bg-amber-50"
            : "border-slate-200 bg-slate-50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon
              className={cn(
                "h-4 w-4",
                expired ? "text-red-600" : urgent ? "text-amber-600" : "text-slate-500"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                expired ? "text-red-700" : urgent ? "text-amber-700" : "text-slate-600"
              )}
            >
              {expired ? "Code expired" : "Code expires in"}
            </span>
          </div>
          <span
            className={cn(
              "font-mono text-lg font-bold tabular-nums",
              expired ? "text-red-700" : urgent ? "text-amber-700" : "text-slate-800"
            )}
            aria-live="polite"
          >
            {mm}:{ss}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              expired ? "bg-red-500" : urgent ? "bg-amber-500" : "bg-blue-700"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Field label="One-time passcode">
        <input
          className={cn(inputCls, "text-center font-mono text-xl tracking-[0.4em]", expired && "opacity-60")}
          maxLength={6}
          inputMode="numeric"
          value={code}
          disabled={expired}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            setErr("");
          }}
          placeholder="••••••"
        />
      </Field>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-5 flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={submit} disabled={code.length !== 6 || expired}>
          Verify & Continue
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        Didn't receive a code?{" "}
        <button className="font-semibold text-blue-900 hover:underline" onClick={resend}>
          Resend code
        </button>
        {resent && <span className="ml-1 text-emerald-600">A new code was sent to {EMAIL}.</span>}
      </p>
    </div>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function LockedResult({ title, message, details, onDone }: { title: string; message: string; details?: ReactNode; onDone: () => void }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <LockIcon className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-red-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      {details && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-left">{details}</div>}
      <p className="mt-4 text-xs text-slate-400">
        No ACH, wire, card, or bank transfer was initiated. This attempt has been recorded in your activity log with status LOCKED.
      </p>
      <Button className="mt-5" onClick={onDone}>Return</Button>
    </div>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-red-300 bg-white px-4 py-3 shadow-xl">
      <LockIcon className="h-5 w-5 text-red-600" />
      <span className="text-sm font-medium text-slate-800">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
    </div>
  );
}
