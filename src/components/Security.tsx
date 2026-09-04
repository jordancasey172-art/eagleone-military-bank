import { CUSTOMER, HOLD, type Notification } from "../data";
import { Button, Card, LockIcon, SummaryRow } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  notifications: Notification[];
  onMarkRead: () => void;
}

export default function Security({ notifications, onMarkRead }: Props) {
  const sessions = [
    { device: "Chrome on Windows 11", location: "Deployed Location (Secure VPN)", time: "Active now", current: true },
    { device: "EagleOne Mobile (iOS)", location: "Deployed Location (Secure VPN)", time: "Yesterday, 9:02 PM", current: false },
    { device: "Safari on macOS", location: "Hampton, VA", time: "Sep 10, 6:45 AM", current: false },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Security & Alerts</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Activity Notifications" className="lg:col-span-2" action={<Button variant="ghost" onClick={onMarkRead}>Mark all read</Button>}>
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li key={n.id} className="flex gap-3 py-3">
                <span className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", n.level === "critical" ? "bg-red-100 text-red-600" : n.level === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-700")}>
                  {n.level === "info" ? "i" : <LockIcon className="h-4 w-4" />}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm", !n.read ? "font-semibold text-slate-900" : "text-slate-700")}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </div>
                  <p className="text-sm text-slate-500">{n.body}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card title="Profile">
            <dl>
              <SummaryRow label="Name" value={CUSTOMER.name} />
              <SummaryRow label="Rank" value={CUSTOMER.rank} />
              <SummaryRow label="Branch" value={CUSTOMER.branch} />
              <SummaryRow label="Career field" value={CUSTOMER.afsc} />
              <SummaryRow label="Duty status" value={<span className="text-amber-700">{CUSTOMER.deploymentStatus}</span>} />
              <SummaryRow label="Member ID" value={CUSTOMER.memberId} mono />
              <SummaryRow label="Email" value={CUSTOMER.email} />
              <SummaryRow label="2-step verification" value={<span className="text-emerald-700">On (OTP)</span>} />
            </dl>
          </Card>
          <Card title="Transfer Controls">
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-900">{HOLD.name}</p>
              <p className="mt-1 text-xs text-amber-800">{HOLD.reason}</p>
              <p className="mt-2 text-[11px] text-amber-700">Ref {HOLD.reference} · Active since {HOLD.since} · Expected lift {CUSTOMER.deploymentReturn}</p>
            </div>
            <ul className="space-y-2 text-sm">
              {["External transfers", "ACH origination", "Wire transfers", "External account linking"].map((c) => (
                <li key={c} className="flex items-center justify-between">
                  <span className="text-slate-600">{c}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200"><LockIcon className="h-3 w-3" />LOCKED</span>
                </li>
              ))}
              <li className="flex items-center justify-between">
                <span className="text-slate-600">Internal transfers</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">ENABLED</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Recent Sessions">
        <ul className="divide-y divide-slate-100">
          {sessions.map((s) => (
            <li key={s.device} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{s.device} {s.current && <span className="ml-2 rounded bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700">THIS DEVICE</span>}</p>
                <p className="text-xs text-slate-400">{s.location}</p>
              </div>
              <span className="text-xs text-slate-500">{s.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
