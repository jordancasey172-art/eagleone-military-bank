import { useState } from "react";
import { ACCOUNTS, CUSTOMER, fmt, type Transaction } from "../data";
import { Card, SummaryRow } from "./ui";
import { TxTable } from "./Dashboard";
import { cn } from "../utils/cn";

export default function Accounts({ transactions }: { transactions: Transaction[] }) {
  const [sel, setSel] = useState(ACCOUNTS[0].id);
  const [reveal, setReveal] = useState(false);
  const acct = ACCOUNTS.find((a) => a.id === sel)!;
  const rows = transactions.filter((t) => t.account === sel);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ACCOUNTS.map((a) => (
          <button
            key={a.id}
            onClick={() => { setSel(a.id); setReveal(false); }}
            className={cn(
              "rounded-xl bg-gradient-to-br p-5 text-left text-white shadow transition",
              a.color,
              sel === a.id ? "ring-4 ring-blue-300 ring-offset-2" : "opacity-90 hover:opacity-100"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{a.type}</p>
            <p className="mt-1 truncate text-sm font-medium">{a.name}</p>
            <p className="mt-3 font-mono text-xl font-bold">{fmt(a.balance)}</p>
            <div className="mt-2 flex justify-between text-[11px] text-white/70">
              <span>•••• {a.number.slice(-4)}</span>
              {a.apy && <span>{a.apy} APY</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account Details">
          <dl>
            <SummaryRow label="Account name" value={acct.name} />
            <SummaryRow label="Account holder" value={CUSTOMER.name} />
            <SummaryRow label="Account type" value={acct.type} />
            <SummaryRow label="Account number" value={reveal ? acct.number : "•••••• " + acct.number.slice(-4)} mono />
            <SummaryRow label="Routing number (ABA)" value={acct.routing} mono />
            <SummaryRow label="Current balance" value={fmt(acct.balance)} mono />
            <SummaryRow label="Available balance" value={fmt(acct.available)} mono />
            {acct.apy && <SummaryRow label="Interest rate (APY)" value={acct.apy} />}
            <SummaryRow label="Status" value={<span className="text-emerald-700">Open · Good standing</span>} />
          </dl>
          <button onClick={() => setReveal((r) => !r)} className="mt-3 text-xs font-semibold text-blue-900 hover:underline">
            {reveal ? "Hide" : "Show"} full account number
          </button>
          {acct.id === "cd" && (
            <p className="mt-3 rounded bg-amber-50 p-2 text-xs text-amber-800">Certificate matures 2027-11-15. Early withdrawal penalties apply.</p>
          )}
          {acct.id === "mm" && (
            <p className="mt-3 rounded bg-slate-50 p-2 text-xs text-slate-500">Money market accounts allow up to 6 withdrawals per statement cycle. Check-writing enabled.</p>
          )}
        </Card>
        <Card title={`Transactions – ${acct.type}`} className="lg:col-span-2">
          <TxTable rows={rows} showAccount={false} empty="No transactions for this account in the current period." />
        </Card>
      </div>
    </div>
  );
}
