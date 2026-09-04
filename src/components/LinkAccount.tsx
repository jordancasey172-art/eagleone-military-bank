import { useState } from "react";
import { BANKS, HOLD, mask, today, uid, type LinkedAccount } from "../data";
import { Button, Card, Field, LockedResult, OtpStep, StatusBadge, Stepper, SummaryRow, inputCls } from "./ui";

interface Props {
  linked: LinkedAccount[];
  onLocked: (l: LinkedAccount) => void;
}

const EMPTY = { bank: "", other: "", type: "Checking", account: "", confirm: "", routing: "", nickname: "" };

export default function LinkAccount({ linked, onLocked }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const bankName = form.bank === "Other (enter manually)" ? form.other : form.bank;
  const valid =
    bankName.trim() && /^\d{6,17}$/.test(form.account) && form.account === form.confirm && /^\d{9}$/.test(form.routing);

  const submit = () => {
    onLocked({
      id: "L-" + uid(),
      bank: bankName,
      type: form.type,
      last4: form.account.slice(-4),
      routing: form.routing,
      status: "LOCKED",
      added: today(),
    });
    setStep(3);
  };

  const reset = () => { setStep(0); setForm(EMPTY); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Linked Accounts</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Link External Bank Account" className="lg:col-span-2">
          <Stepper steps={["Bank details", "Verification", "Passcode", "Result"]} current={step} />

          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bank">
                <select className={inputCls} value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })}>
                  <option value="">Select your bank…</option>
                  {BANKS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              {form.bank === "Other (enter manually)" ? (
                <Field label="Bank name">
                  <input className={inputCls} value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })} placeholder="Enter bank name" />
                </Field>
              ) : (
                <Field label="Account type">
                  <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option>Checking</option><option>Savings</option><option>Money Market</option><option>Business Checking</option>
                  </select>
                </Field>
              )}
              {form.bank === "Other (enter manually)" && (
                <Field label="Account type">
                  <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option>Checking</option><option>Savings</option><option>Money Market</option><option>Business Checking</option>
                  </select>
                </Field>
              )}
              <Field label="Routing number" hint="9-digit ABA routing number">
                <input className={inputCls} inputMode="numeric" maxLength={9} value={form.routing} onChange={(e) => setForm({ ...form, routing: e.target.value.replace(/\D/g, "") })} placeholder="021000021" />
              </Field>
              <Field label="Account number">
                <input className={inputCls} inputMode="numeric" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value.replace(/\D/g, "") })} placeholder="Account number" />
              </Field>
              <Field label="Confirm account number">
                <input className={inputCls} inputMode="numeric" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value.replace(/\D/g, "") })} placeholder="Re-enter account number" />
              </Field>
              <Field label="Nickname (optional)">
                <input className={inputCls} value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="e.g. Joint checking" />
              </Field>
              {form.confirm && form.account !== form.confirm && <p className="text-sm text-red-600 md:col-span-2">Account numbers do not match.</p>}
              <div className="flex justify-end md:col-span-2">
                <Button disabled={!valid} onClick={() => setStep(1)}>Continue to verification</Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Verify account ownership</h3>
              <dl className="rounded-lg border border-slate-200 p-4">
                <SummaryRow label="Bank" value={bankName} />
                <SummaryRow label="Account type" value={form.type} />
                <SummaryRow label="Account number" value={mask(form.account)} mono />
                <SummaryRow label="Routing number" value={form.routing} mono />
                {form.nickname && <SummaryRow label="Nickname" value={form.nickname} />}
                <SummaryRow label="Verification method" value="Micro-deposits (2 small deposits, 1–2 business days)" />
              </dl>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                By continuing, you authorize EagleOne Military Bank to send two micro-deposits to verify ownership. You'll confirm the amounts once they arrive.
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>Edit</Button>
                <Button onClick={() => setStep(2)}>Authorize & verify identity</Button>
              </div>
            </div>
          )}

          {step === 2 && <OtpStep onBack={() => setStep(1)} onVerified={submit} />}

          {step === 3 && (
            <LockedResult
              title="Account Linking Locked"
              message={`External bank connections are disabled during deployment under the active ${HOLD.name}. New external links can be established after verified return from deployment.`}
              details={
                <dl className="text-sm">
                  <SummaryRow label="Bank" value={bankName} />
                  <SummaryRow label="Account" value={`${form.type} ${mask(form.account)}`} />
                  <SummaryRow label="Hold reference" value={HOLD.reference} mono />
                  <SummaryRow label="Reason" value={HOLD.name} />
                  <SummaryRow label="Verification Status" value={<span className="font-bold text-red-700">LOCKED</span>} />
                </dl>
              }
              onDone={reset}
            />
          )}
        </Card>

        <Card title="Your Linked Accounts">
          <ul className="space-y-3">
            {linked.map((l) => (
              <li key={l.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{l.bank}</p>
                    <p className="text-xs text-slate-400">{l.type} · {mask(l.last4)}</p>
                    <p className="text-xs text-slate-400">RTN {l.routing} · Added {l.added}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Verification Status:</span>
                  <StatusBadge status={l.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
