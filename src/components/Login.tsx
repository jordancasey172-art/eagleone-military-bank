import { useState } from "react";
import { BANK_NAME, CREDENTIALS } from "../data";
import { Button, Field, OtpStep, inputCls } from "./ui";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [stage, setStage] = useState<"creds" | "otp">("creds");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === CREDENTIALS.userId && password === CREDENTIALS.password) {
      setError("");
      setStage("otp");
    } else {
      setAttempts((a) => a + 1);
      setError("The User ID or password you entered is incorrect.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-950 via-blue-950 to-slate-950">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
          {/* Brand panel */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-sky-800 to-blue-950 p-10 text-white md:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-400 text-2xl text-blue-950">✈</div>
                <div>
                  <p className="text-xl font-extrabold tracking-wide">{BANK_NAME.toUpperCase()}</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-sky-300">Military Banking</p>
                </div>
              </div>
              <h2 className="mt-12 text-3xl font-bold leading-tight">Aim High.<br />Bank Secure.</h2>
              <p className="mt-4 text-sm text-sky-200">
                Serving Airmen, Guardians, veterans and their families worldwide — including APO/FPO and deployed locations.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-sky-200">
              <li>✓ Deployment Security Hold protection</li>
              <li>✓ One-time passcode on every sign-in</li>
              <li>✓ 24/7 worldwide member support</li>
            </ul>
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full border-[24px] border-white/5" />
          </div>

          {/* Form panel */}
          <div className="p-8 sm:p-10">
            <div className="mb-6 flex items-center gap-2 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-blue-950">✈</div>
              <p className="font-extrabold text-blue-950">{BANK_NAME.toUpperCase()}</p>
            </div>

            {stage === "creds" ? (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Secure Sign In</h1>
                  <p className="text-sm text-slate-500">Enter your Online Banking credentials.</p>
                </div>
                <Field label="User ID">
                  <input className={inputCls} autoComplete="username" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <input
                      className={inputCls + " pr-16"}
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                    <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-900">
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </Field>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                    {attempts >= 3 && <p className="mt-1 text-xs">Multiple failed attempts. For your security, contact member support if you've forgotten your credentials.</p>}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="rounded" /> Remember User ID</label>
                  <button type="button" className="font-semibold text-blue-900 hover:underline">Forgot User ID / Password?</button>
                </div>
                <Button type="submit" className="w-full py-2.5">Sign In</Button>
                <p className="text-center text-[11px] text-slate-400">
                  Protected by one-time passcode verification. Unauthorized access is prohibited.
                </p>
              </form>
            ) : (
              <div>
                <h1 className="mb-1 text-2xl font-bold text-slate-900">Verify it's you</h1>
                <p className="mb-4 text-sm text-slate-500">A one-time passcode is required to complete sign-in.</p>
                <OtpStep onBack={() => setStage("creds")} onVerified={onSuccess} />
              </div>
            )}

            <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
              Need help? Call Member Support 1-800-555-0142 · Available 24/7 worldwide.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
