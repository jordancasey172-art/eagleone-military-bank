import { useState } from "react";
import { ACCOUNTS, HOLD, fmt, mask, today, uid, type AchRecipient, type Transaction } from "../data";
import { Button, Card, Field, LockedResult, OtpStep, Stepper, SummaryRow, inputCls } from "./ui";
import { TxTable } from "./Dashboard";

interface Props {
  ach: Transaction[];
  recipients: AchRecipient[];
  onAddRecipient: (r: AchRecipient) => void;
  onLocked: (tx: Transaction) => void;
}

const EMPTY_R = { name: "", bank: "", account: "", routing: "" };

export default function AchFlow({ ach, recipients, onAddRecipient, onLocked }: Props) {
  const [step, setStep] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newR, setNewR] = useState(EMPTY_R);
  const [form, setForm] = useState({ from: "chk", recipient: recipients[0]?.id ?? "", amount: "", date: today(), memo: "", type: "credit" });

  const rec = recipients.find((r) => r.id === form.recipient);
  const valid = rec && Number(form.amount) > 0 && form.date;
  const validR = newR.name.trim() && newR.bank.trim() && /^\d{6,17}$/.test(newR.account) && /^\d{9}$/.test(newR.routing);

  const addRecipient = () => {
    const r: AchRecipient = { id: "r" + uid(), name: newR.name, bank: newR.bank, last4: newR.account.slice(-4), routing: newR.routing };
    onAddRecipient(r);
    setForm((f) => ({ ...f, recipient: r.id }));
    setNewR(EMPTY_R);
    setShowAdd(false);
  };

  const submit = () => {
    onLocked({
      id: "ACH-" + uid(),
      date: form.date,
      description: `ACH ${form.type === "credit" ? "Credit" : "Debit"} – ${rec!.name}`,
      category: "ACH Transfer",
      amount: form.type === "credit" ? -Number(form.amount) : Number(form.amount),
      status: "LOCKED",
      kind: "ach",
      account: form.from,
      note: `${HOLD.name} · ${form.memo || "No memo"}`,
    });
    setStep(3);
  };

  const reset = () => { setStep(0); setForm({ ...form, amount: "", memo: "" }); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">ACH Transfers</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="ACH Recipients" className="lg:col-span-1" action={<Button variant="ghost" onClick={() => setShowAdd((s) => !s)}>{showAdd ? "Close" : "+ Add"}</Button>}>
          {showAdd && (
            <div className="mb-4 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-900">Add ACH recipient</p>
              <input className={inputCls} placeholder="Recipient name" value={newR.name} onChange={(e) => setNewR({ ...newR, name: e.target.value })} />
              <input className={inputCls} placeholder="Bank name" value={newR.bank} onChange={(e) => setNewR({ ...newR, bank: e.target.value })} />
              <input className={inputCls} placeholder="Account number" inputMode="numeric" value={newR.account} onChange={(e) => setNewR({ ...newR, account: e.target.value.replace(/\D/g, "") })} />
              <input className={inputCls} placeholder="Routing number (9 digits)" inputMode="numeric" maxLength={9} value={newR.routing} onChange={(e) => setNewR({ ...newR, routing: e.target.value.replace(/\D/g, "") })} />
              <Button className="w-full" disabled={!validR} onClick={addRecipient}>Save recipient</Button>
            </div>
          )}
          <ul className="space-y-2">
            {recipients.map((r) => (
              <li key={r.id} className={`rounded-lg border p-3 ${form.recipient === r.id ? "border-blue-800 bg-blue-50" : "border-slate-200"}`}>
                <button className="w-full text-left" onClick={() => setForm({ ...form, recipient: r.id })}>
                  <p className="text-sm font-medium text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.bank} · {mask(r.last4)} · RTN {r.routing}</p>
                </button>
              </li>
            ))}
            {!recipients.length && <p className="text-sm text-slate-400">No recipients yet.</p>}
          </ul>
        </Card>

        <Card title="New ACH Transfer" className="lg:col-span-2">
          <Stepper steps={["Details", "Confirm", "Verify", "Result"]} current={step} />

          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="From account">
                <select className={inputCls} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                  {ACCOUNTS.filter((a) => a.available > 0).map((a) => <option key={a.id} value={a.id}>{a.name} — {fmt(a.available)}</option>)}
                </select>
              </Field>
              <Field label="Recipient">
                <select className={inputCls} value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })}>
                  <option value="">Select recipient…</option>
                  {recipients.map((r) => <option key={r.id} value={r.id}>{r.name} ({mask(r.last4)})</option>)}
                </select>
              </Field>
              <Field label="Direction">
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="credit">Send (ACH Credit)</option>
                  <option value="debit">Pull (ACH Debit)</option>
                </select>
              </Field>
              <Field label="Amount (USD)">
                <input className={inputCls} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </Field>
              <Field label="Transfer date">
                <input className={inputCls} type="date" min={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="Memo" hint="Appears on recipient's statement (max 80 chars)">
                <input className={inputCls} maxLength={80} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="Optional memo" />
              </Field>
              <div className="flex justify-end md:col-span-2">
                <Button disabled={!valid} onClick={() => setStep(1)}>Review ACH transfer</Button>
              </div>
            </div>
          )}

          {step === 1 && rec && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Confirm ACH transfer</h3>
              <dl className="rounded-lg border border-slate-200 p-4">
                <SummaryRow label="From" value={ACCOUNTS.find((a) => a.id === form.from)?.name} />
                <SummaryRow label="Recipient" value={rec.name} />
                <SummaryRow label="Bank" value={rec.bank} />
                <SummaryRow label="Account" value={mask(rec.last4)} mono />
                <SummaryRow label="Routing" value={rec.routing} mono />
                <SummaryRow label="Type" value={form.type === "credit" ? "ACH Credit (send)" : "ACH Debit (pull)"} />
                <SummaryRow label="Amount" value={<span className="text-lg font-bold">{fmt(Number(form.amount))}</span>} />
                <SummaryRow label="Transfer date" value={form.date} />
                <SummaryRow label="Memo" value={form.memo || "—"} />
                <SummaryRow label="SEC code" value="PPD" mono />
              </dl>
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>Edit</Button>
                <Button onClick={() => setStep(2)}>Confirm & verify</Button>
              </div>
            </div>
          )}

          {step === 2 && <OtpStep onBack={() => setStep(1)} onVerified={submit} />}

          {step === 3 && (
            <LockedResult
              title="ACH Transfer Locked"
              message={`ACH origination is suspended under the active ${HOLD.name} while you are deployed. Existing recurring bill payments are not affected.`}
              details={
                <dl className="text-sm">
                  <SummaryRow label="Recipient" value={rec?.name} />
                  <SummaryRow label="Amount" value={fmt(Number(form.amount))} />
                  <SummaryRow label="Hold reference" value={HOLD.reference} mono />
                  <SummaryRow label="Reason" value={HOLD.name} />
                  <SummaryRow label="Status" value={<span className="font-bold text-red-700">LOCKED</span>} />
                </dl>
              }
              onDone={reset}
            />
          )}
        </Card>
      </div>

      <Card title="ACH Activity Log">
        <TxTable rows={ach} />
      </Card>
    </div>
  );
}
