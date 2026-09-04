import { useState } from "react";
import { ACCOUNTS, HOLD, fmt, mask, today, uid, type Transaction } from "../data";
import { Button, Card, Field, LockedResult, OtpStep, Stepper, SummaryRow, inputCls } from "./ui";
import { TxTable } from "./Dashboard";

interface Props {
  transfers: Transaction[];
  onLocked: (tx: Transaction) => void;
}

type Mode = "menu" | "internal" | "external";

const EMPTY = { from: "chk", recipient: "", bank: "", account: "", routing: "", amount: "", description: "" };

export default function TransferFlow({ transfers, onLocked }: Props) {
  const [mode, setMode] = useState<Mode>("menu");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [internal, setInternal] = useState({ from: "chk", to: "sav", amount: "" });
  const [internalDone, setInternalDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => { setMode("menu"); setStep(0); setForm(EMPTY); setInternalDone(false); };

  const valid =
    form.recipient.trim() && form.bank.trim() && /^\d{6,17}$/.test(form.account) && /^\d{9}$/.test(form.routing) && Number(form.amount) > 0;

  const submitExternal = () => {
    onLocked({
      id: "TX-" + uid(),
      date: today(),
      description: `External transfer to ${form.recipient} – ${form.bank}`,
      category: "External Transfer",
      amount: -Number(form.amount),
      status: "LOCKED",
      kind: "transfer",
      account: form.from,
      note: `${HOLD.name} · Acct ${mask(form.account)} · ${form.description || "No description"}`,
    });
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Transfers</h1>

      {mode === "menu" && (
        <div className="grid gap-4 md:grid-cols-2">
          <button onClick={() => setMode("internal")} className="rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-blue-800">
            <p className="text-lg font-semibold text-slate-900">Between my accounts</p>
            <p className="mt-1 text-sm text-slate-500">Move money instantly between your EagleOne Military Bank checking, savings, and money market accounts.</p>
          </button>
          <button onClick={() => setMode("external")} className="rounded-xl border-2 border-blue-900 bg-blue-50 p-6 text-left transition hover:bg-blue-100">
            <p className="text-lg font-semibold text-blue-950">Transfer to another bank</p>
            <p className="mt-1 text-sm text-blue-900/70">Send funds to an account at a different financial institution using account and routing numbers.</p>
          </button>
        </div>
      )}

      {mode === "internal" && (
        <Card title="Transfer between my accounts">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="From">
              <select className={inputCls} value={internal.from} onChange={(e) => setInternal({ ...internal, from: e.target.value })}>
                {ACCOUNTS.filter((a) => a.available > 0).map((a) => <option key={a.id} value={a.id}>{a.name} ({fmt(a.available)})</option>)}
              </select>
            </Field>
            <Field label="To">
              <select className={inputCls} value={internal.to} onChange={(e) => setInternal({ ...internal, to: e.target.value })}>
                {ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Amount">
              <input className={inputCls} type="number" min="0" step="0.01" value={internal.amount} onChange={(e) => setInternal({ ...internal, amount: e.target.value })} placeholder="0.00" />
            </Field>
          </div>
          <p className="mt-3 text-xs text-slate-400">Internal transfers between your own accounts are processed instantly.</p>
          <div className="mt-4 flex justify-between">
            <Button variant="secondary" onClick={reset}>Cancel</Button>
            <Button disabled={!Number(internal.amount)} onClick={() => setInternalDone(true)}>Continue</Button>
          </div>
          {internalDone && (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Internal transfer completed instantly. Your account balances have been updated.
            </p>
          )}
        </Card>
      )}

      {mode === "external" && (
        <Card title="Transfer to another bank">
          <Stepper steps={["Details", "Confirm", "Verify", "Result"]} current={step} />

          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="From account">
                <select className={inputCls} value={form.from} onChange={set("from")}>
                  {ACCOUNTS.filter((a) => a.available > 0).map((a) => <option key={a.id} value={a.id}>{a.name} — {fmt(a.available)}</option>)}
                </select>
              </Field>
              <Field label="Recipient name">
                <input className={inputCls} value={form.recipient} onChange={set("recipient")} placeholder="Full legal name" />
              </Field>
              <Field label="Recipient bank name">
                <input className={inputCls} value={form.bank} onChange={set("bank")} placeholder="e.g. First National Bank" />
              </Field>
              <Field label="Account number" hint="6–17 digits">
                <input className={inputCls} inputMode="numeric" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value.replace(/\D/g, "") })} placeholder="000123456789" />
              </Field>
              <Field label="Routing number" hint="9-digit ABA number">
                <input className={inputCls} inputMode="numeric" maxLength={9} value={form.routing} onChange={(e) => setForm({ ...form, routing: e.target.value.replace(/\D/g, "") })} placeholder="021000021" />
              </Field>
              <Field label="Amount (USD)">
                <input className={inputCls} type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Transfer description">
                  <input className={inputCls} value={form.description} onChange={set("description")} placeholder="What is this transfer for?" />
                </Field>
              </div>
              <div className="flex justify-between md:col-span-2">
                <Button variant="secondary" onClick={reset}>Cancel</Button>
                <Button disabled={!valid} onClick={() => setStep(1)}>Review transfer</Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Confirm transfer details</h3>
              <dl className="rounded-lg border border-slate-200 p-4">
                <SummaryRow label="From" value={ACCOUNTS.find((a) => a.id === form.from)?.name} />
                <SummaryRow label="Recipient" value={form.recipient} />
                <SummaryRow label="Bank" value={form.bank} />
                <SummaryRow label="Account number" value={mask(form.account)} mono />
                <SummaryRow label="Routing number" value={form.routing} mono />
                <SummaryRow label="Amount" value={<span className="text-lg font-bold">{fmt(Number(form.amount))}</span>} />
                <SummaryRow label="Description" value={form.description || "—"} />
                <SummaryRow label="Delivery" value="1–3 business days (ACH)" />
                <SummaryRow label="Fee" value="$0.00" />
              </dl>
              <p className="mt-3 text-xs text-slate-400">By continuing you'll be asked to verify with a one-time passcode.</p>
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>Edit</Button>
                <Button onClick={() => setStep(2)}>Confirm & verify</Button>
              </div>
            </div>
          )}

          {step === 2 && <OtpStep onBack={() => setStep(1)} onVerified={submitExternal} />}

          {step === 3 && (
            <LockedResult
              title="Transfer Locked"
              message={`External transfers are unavailable while a ${HOLD.name} is active on this account. Outbound transfers to other institutions are suspended for the duration of your deployment.`}
              details={
                <dl className="text-sm">
                  <SummaryRow label="Recipient" value={form.recipient} />
                  <SummaryRow label="Amount" value={fmt(Number(form.amount))} />
                  <SummaryRow label="Hold reference" value={HOLD.reference} mono />
                  <SummaryRow label="Reason" value={HOLD.name} />
                  <SummaryRow label="Status" value={<span className="font-bold text-red-700">LOCKED / FAILED</span>} />
                </dl>
              }
              onDone={reset}
            />
          )}
        </Card>
      )}

      <Card title="Transfer History">
        <TxTable rows={transfers} showAccount={false} />
      </Card>
    </div>
  );
}
