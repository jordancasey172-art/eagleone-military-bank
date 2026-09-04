import { useState } from "react";
import {
  BANK_NAME,
  CUSTOMER,
  LOCK_MESSAGES,
  INITIAL_ACH,
  INITIAL_LINKED,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECIPIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
  fmt,
  type AchRecipient,
  type LinkedAccount,
  type Notification,
  type Transaction,
} from "./data";
import Dashboard from "./components/Dashboard";
import Accounts from "./components/Accounts";
import TransferFlow from "./components/TransferFlow";
import AchFlow from "./components/AchFlow";
import LinkAccount from "./components/LinkAccount";
import Security from "./components/Security";
import Login from "./components/Login";
import { Toast } from "./components/ui";
import { cn } from "./utils/cn";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "accounts", label: "Accounts", icon: "▤" },
  { id: "transfer", label: "Transfers", icon: "⇄" },
  { id: "ach", label: "ACH", icon: "⇉" },
  { id: "linked", label: "Linked Accounts", icon: "⛓" },
  { id: "security", label: "Security & Alerts", icon: "⚿" },
];

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [transfers, setTransfers] = useState<Transaction[]>(INITIAL_TRANSFERS);
  const [ach, setAch] = useState<Transaction[]>(INITIAL_ACH);
  const [linked, setLinked] = useState<LinkedAccount[]>(INITIAL_LINKED);
  const [recipients, setRecipients] = useState<AchRecipient[]>(INITIAL_RECIPIENTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (title: string, body: string) =>
    setNotifications((n) => [
      { id: "n" + Date.now(), title, body, time: "Just now", level: "critical", read: false },
      ...n,
    ]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 5000);
  };

  const handleTransferLocked = (tx: Transaction) => {
    setTransactions((t) => [tx, ...t]);
    setTransfers((t) => [tx, ...t]);
    notify("External transfer blocked – Deployment Security Hold", `Attempted ${fmt(Math.abs(tx.amount))} transfer was locked under the active deployment hold. No funds moved.`);
    showToast(LOCK_MESSAGES.transfer);
  };

  const handleAchLocked = (tx: Transaction) => {
    setTransactions((t) => [tx, ...t]);
    setAch((t) => [tx, ...t]);
    notify("ACH transfer blocked – Deployment Security Hold", `Attempted ${fmt(Math.abs(tx.amount))} ACH transfer was locked under the active deployment hold. No funds moved.`);
    showToast(LOCK_MESSAGES.ach);
  };

  const handleLinkLocked = (l: LinkedAccount) => {
    setLinked((x) => [...x, l]);
    notify("External account linking blocked – Deployment Security Hold", `Link request for ${l.bank} ${l.type} ••••${l.last4} was locked under the active deployment hold.`);
    showToast(LOCK_MESSAGES.link);
  };

  const go = (t: string) => {
    setTab(t);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const unread = notifications.filter((n) => !n.read).length;

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="border-b border-blue-950 bg-gradient-to-r from-sky-900 to-blue-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="rounded p-1 hover:bg-white/10 lg:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">☰</button>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 font-black text-blue-950">✈</div>
            <div>
              <p className="text-base font-bold leading-tight tracking-wide">{BANK_NAME.toUpperCase()}</p>
              <p className="text-[10px] uppercase tracking-widest text-sky-300">Military Banking · Aim High. Bank Secure.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => go("security")} className="relative rounded p-1.5 hover:bg-white/10" aria-label="Alerts">
              🔔
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">{unread}</span>}
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{CUSTOMER.name}</p>
              <p className="text-[11px] text-blue-300">Last login: {CUSTOMER.lastLogin}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-800 text-sm font-bold">MJ</div>
            <button onClick={() => { setAuthed(false); setTab("dashboard"); }} className="hidden rounded border border-sky-700 px-3 py-1 text-xs font-semibold hover:bg-blue-900 sm:block">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className={cn("w-56 shrink-0 lg:block", menuOpen ? "block" : "hidden")}>
          <nav className="sticky top-16 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                  tab === n.id ? "bg-blue-950 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span className="w-5 text-center">{n.icon}</span>
                {n.label}
                {n.id === "security" && unread > 0 && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>}
              </button>
            ))}
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
              <p className="font-semibold text-slate-700">Member Support</p>
              <p>1-800-555-0142</p>
              <p>24/7 worldwide, incl. APO/FPO</p>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {tab === "dashboard" && (
            <Dashboard transactions={transactions} transfers={transfers} ach={ach} linked={linked} notifications={notifications} go={go} />
          )}
          {tab === "accounts" && <Accounts transactions={transactions} />}
          {tab === "transfer" && <TransferFlow transfers={transfers} onLocked={handleTransferLocked} />}
          {tab === "ach" && (
            <AchFlow ach={ach} recipients={recipients} onAddRecipient={(r) => setRecipients((x) => [...x, r])} onLocked={handleAchLocked} />
          )}
          {tab === "linked" && <LinkAccount linked={linked} onLocked={handleLinkLocked} />}
          {tab === "security" && (
            <Security notifications={notifications} onMarkRead={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))} />
          )}
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 {BANK_NAME} · Secure Online Banking · Equal Housing Lender</p>
        <p className="mt-1">Member Support 1-800-555-0142 · Available 24/7 worldwide, including deployed locations.</p>
      </footer>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
