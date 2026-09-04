import { ACCOUNTS, CUSTOMER, HOLD, fmt, mask, type LinkedAccount, type Notification, type Transaction } from "../data";
import { Card, StatusBadge, Button, LockIcon } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  transactions: Transaction[];
  transfers: Transaction[];
  ach: Transaction[];
  linked: LinkedAccount[];
  notifications: Notification[];
  go: (tab: string) => void;
}

export function TxTable({ rows, showAccount = true, empty = "No activity yet." }: { rows: Transaction[]; showAccount?: boolean; empty?: string }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-slate-400">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="pb-2 font-semibold">Date</th>
            <th className="pb-2 font-semibold">Description</th>
            {showAccount && <th className="pb-2 font-semibold">Account</th>}
            <th className="pb-2 font-semibold">Status</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((t) => {
            const locked = t.status === "LOCKED" || t.status === "FAILED";
            return (
              <tr key={t.id} className={cn(locked && "bg-red-50/40")}>
                <td className="whitespace-nowrap py-2.5 pr-3 text-slate-500">{t.date}</td>
                <td className="py-2.5 pr-3">
                  <div className="font-medium text-slate-800">{t.description}</div>
                  <div className="text-xs text-slate-400">{t.category}{t.note ? ` · ${t.note}` : ""}</div>
                </td>
                {showAccount && (
                  <td className="whitespace-nowrap py-2.5 pr-3 text-slate-500">
                    {ACCOUNTS.find((a) => a.id === t.account)?.type ?? t.account}
                  </td>
                )}
                <td className="py-2.5 pr-3"><StatusBadge status={t.status} /></td>
                <td className={cn("whitespace-nowrap py-2.5 text-right font-mono font-semibold", locked ? "text-slate-400 line-through" : t.amount > 0 ? "text-emerald-700" : "text-slate-900")}>
                  {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ transactions, transfers, ach, linked, notifications, go }: Props) {
  const total = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const available = ACCOUNTS.reduce((s, a) => s + a.available, 0);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Welcome back,</p>
          <h1 className="text-2xl font-bold text-slate-900">{CUSTOMER.name}</h1>
          <p className="text-xs text-slate-400">{CUSTOMER.rank} · {CUSTOMER.branch} · {CUSTOMER.afsc} · Member since {CUSTOMER.memberSince}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => go("transfer")}>Transfer</Button>
          <Button variant="secondary" onClick={() => go("ach")}>ACH</Button>
          <Button variant="secondary" onClick={() => go("linked")}>Link Account</Button>
        </div>
      </div>

      {/* Deployment hold notice */}
      <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800">
          <LockIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">{HOLD.name} active · Ref {HOLD.reference}</p>
          <p className="text-xs text-amber-800">
            {CUSTOMER.deploymentStatus} since {HOLD.since}. Expected return {CUSTOMER.deploymentReturn}. Outbound external transfers, ACH origination, wires and new external links are suspended; deposits and recurring bill payments continue normally.
          </p>
        </div>
        <Button variant="secondary" onClick={() => go("security")}>Hold details</Button>
      </div>

      {/* Balance hero */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 p-6 text-white shadow-lg md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Total Available Balance</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-tight">{fmt(available)}</p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <div><span className="text-blue-300">Total balance</span> <span className="ml-2 font-mono font-semibold">{fmt(total)}</span></div>
            <div><span className="text-blue-300">Accounts</span> <span className="ml-2 font-semibold">{ACCOUNTS.length}</span></div>
            <div><span className="text-blue-300">Pending</span> <span className="ml-2 font-mono font-semibold">{fmt(transactions.filter((t) => t.status === "PENDING").reduce((s, t) => s + t.amount, 0))}</span></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACCOUNTS.map((a) => (
              <button key={a.id} onClick={() => go("accounts")} className="rounded-lg bg-white/10 p-3 text-left backdrop-blur transition hover:bg-white/20">
                <p className="truncate text-[11px] text-blue-200">{a.type}</p>
                <p className="font-mono text-sm font-semibold">{fmt(a.balance)}</p>
                <p className="text-[10px] text-blue-300">{mask(a.number)}</p>
              </button>
            ))}
          </div>
        </div>

        <Card title="Security & Activity" action={unread > 0 && <span className="rounded-full bg-red-600 px-2 text-[11px] font-bold text-white">{unread} new</span>}>
          <ul className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="flex gap-3">
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.level === "critical" ? "bg-red-500" : n.level === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                <div className="min-w-0">
                  <p className={cn("truncate text-sm", !n.read ? "font-semibold text-slate-900" : "text-slate-700")}>{n.title}</p>
                  <p className="text-xs text-slate-400">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="mt-3 w-full" onClick={() => go("security")}>View all alerts</Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Recent Transactions" className="lg:col-span-2" action={<Button variant="ghost" onClick={() => go("accounts")}>See all</Button>}>
          <TxTable rows={transactions.slice(0, 8)} />
        </Card>

        <div className="space-y-6">
          <Card title="Account Details">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Account holder</dt><dd className="font-medium">{CUSTOMER.name}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Member ID</dt><dd className="font-mono">{CUSTOMER.memberId}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Duty status</dt><dd className="text-right text-xs font-medium text-amber-700">Deployed</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Primary checking</dt><dd className="font-mono">{ACCOUNTS[0].number}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Routing (ABA)</dt><dd className="font-mono">{ACCOUNTS[0].routing}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Last sign-in</dt><dd className="text-right text-xs">{CUSTOMER.lastLogin}<br /><span className="text-slate-400">{CUSTOMER.lastLoginLocation}</span></dd></div>
            </dl>
            <p className="mt-3 rounded bg-slate-50 p-2 text-[11px] text-slate-400">Use your routing and account numbers to set up direct deposit, ACH payments, and bill pay.</p>
          </Card>

          <Card title="Linked Accounts" action={<Button variant="ghost" onClick={() => go("linked")}>Manage</Button>}>
            <ul className="space-y-2">
              {linked.map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{l.bank}</p>
                    <p className="text-xs text-slate-400">{l.type} {mask(l.last4)}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Transfer History" action={<Button variant="ghost" onClick={() => go("transfer")}>New transfer</Button>}>
          <TxTable rows={transfers.slice(0, 5)} showAccount={false} />
        </Card>
        <Card title="ACH Activity" action={<Button variant="ghost" onClick={() => go("ach")}>New ACH</Button>}>
          <TxTable rows={ach.slice(0, 5)} showAccount={false} />
        </Card>
      </div>
    </div>
  );
}
