export type TxStatus = "POSTED" | "PENDING" | "LOCKED" | "FAILED";
export type TxKind = "debit" | "credit" | "transfer" | "ach" | "wire";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number; // negative = money out
  status: TxStatus;
  kind: TxKind;
  account: string;
  note?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  number: string;
  routing: string;
  balance: number;
  available: number;
  apy?: string;
  color: string;
}

export interface LinkedAccount {
  id: string;
  bank: string;
  type: string;
  last4: string;
  routing: string;
  status: "VERIFIED" | "PENDING" | "LOCKED";
  added: string;
}

export interface AchRecipient {
  id: string;
  name: string;
  bank: string;
  last4: string;
  routing: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  level: "info" | "warning" | "critical";
  read: boolean;
}

export const BANK_NAME = "EagleOne Military Bank";

export const CREDENTIALS = {
  userId: "margaret_jeff",
  password: "Maaggi129%%",
};

export const EMAIL = "margaretjeffry58@gmail.com";

export const CUSTOMER = {
  name: "Margaret Jeffry",
  rank: "Staff Sergeant (E-5)",
  branch: "U.S. Air Force",
  afsc: "Security Forces · AFSC 3P0X1",
  memberSince: "2009",
  memberId: "EOM-4471-9028",
  email: EMAIL,
  lastLogin: "Today, 08:14 AM EST",
  lastLoginLocation: "Deployed Location (Secure VPN)",
  deploymentStatus: "Deployed – Overseas Contingency Operation",
  deploymentStart: "2026-09-01",
  deploymentReturn: "2027-02-28",
};

export const HOLD = {
  name: "Deployment Security Hold",
  reason:
    "Outbound external transfers, ACH origination, wires and external account linking are suspended while the account holder is on active overseas deployment. The hold is lifted automatically on verified return from deployment or by in-person verification at any base branch.",
  since: "2026-09-01",
  reference: "DSH-2026-0901-7731",
};

export const LOCK_MESSAGES = {
  transfer: `Transfer Locked — External transfers are unavailable while a ${HOLD.name} is active on this account.`,
  ach: `ACH Transfer Locked — ACH origination is suspended under the active ${HOLD.name}.`,
  link: `Account Linking Locked — External bank connections are disabled during deployment.`,
};

export const OTP_CODES = ["528297", "962692", "206258", "528826"];

export const ROUTING_NUMBER = "256074974";

export const ACCOUNTS: Account[] = [
  {
    id: "chk",
    name: "Active Duty Checking",
    type: "Checking",
    number: "7203915846",
    routing: ROUTING_NUMBER,
    balance: 486_213.44,
    available: 484_713.44,
    apy: "0.45%",
    color: "from-sky-800 to-blue-950",
  },
  {
    id: "sav",
    name: "Airman Savings",
    type: "Savings",
    number: "7203915903",
    routing: ROUTING_NUMBER,
    balance: 612_890.17,
    available: 612_890.17,
    apy: "4.10%",
    color: "from-slate-700 to-slate-900",
  },
  {
    id: "mm",
    name: "Premier Money Market",
    type: "Money Market",
    number: "7203916117",
    routing: ROUTING_NUMBER,
    balance: 1_148_502.63,
    available: 1_148_502.63,
    apy: "4.65%",
    color: "from-amber-700 to-yellow-900",
  },
  {
    id: "cd",
    name: "Deployment Certificate (36-mo)",
    type: "Certificate of Deposit",
    number: "7203916240",
    routing: ROUTING_NUMBER,
    balance: 150_000.0,
    available: 0,
    apy: "5.05%",
    color: "from-emerald-800 to-emerald-950",
  },
];

// Mostly incoming; outgoing limited to recurring bills.
export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2026-09-15", description: "DFAS – Military Pay (Mid-month)", category: "Income", amount: 9_412.36, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t2", date: "2026-09-15", description: "DFAS – Hostile Fire / Imminent Danger Pay", category: "Income", amount: 225.0, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t3", date: "2026-09-14", description: "DFAS – Family Separation Allowance", category: "Income", amount: 250.0, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t4", date: "2026-09-13", description: "Money Market Interest Credit", category: "Interest", amount: 4_386.02, status: "POSTED", kind: "credit", account: "mm" },
  { id: "t5", date: "2026-09-12", description: "USAA Auto Insurance – Autopay", category: "Bills · Insurance", amount: -168.5, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t6", date: "2026-09-11", description: "Wire In – Jeffry Family Trust Distribution", category: "Deposit", amount: 85_000.0, status: "POSTED", kind: "wire", account: "mm" },
  { id: "t7", date: "2026-09-10", description: "Dominion Energy – Autopay", category: "Bills · Utilities", amount: -241.19, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t8", date: "2026-09-09", description: "Rental Income – 1420 Harbor View Dr", category: "Income", amount: 3_150.0, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t9", date: "2026-09-08", description: "TSP Distribution", category: "Income", amount: 6_250.0, status: "POSTED", kind: "ach", account: "sav" },
  { id: "t10", date: "2026-09-07", description: "Verizon Wireless – Autopay", category: "Bills · Phone", amount: -112.4, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t11", date: "2026-09-06", description: "Cox Communications – Autopay", category: "Bills · Internet", amount: -89.99, status: "PENDING", kind: "ach", account: "chk" },
  { id: "t12", date: "2026-09-05", description: "Savings Interest Credit", category: "Interest", amount: 2_091.73, status: "POSTED", kind: "credit", account: "sav" },
  { id: "t13", date: "2026-09-03", description: "Wire In – Property Sale Escrow", category: "Deposit", amount: 425_000.0, status: "POSTED", kind: "wire", account: "mm" },
  { id: "t14", date: "2026-09-01", description: "DFAS – Military Pay (End of month)", category: "Income", amount: 9_412.36, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t15", date: "2026-09-01", description: "Veterans United Mortgage – Autopay", category: "Bills · Housing", amount: -2_418.6, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t16", date: "2026-08-28", description: "Dividend – Vanguard Brokerage", category: "Investment Income", amount: 12_740.55, status: "POSTED", kind: "ach", account: "mm" },
  { id: "t17", date: "2026-08-26", description: "Virginia Natural Gas – Autopay", category: "Bills · Utilities", amount: -74.3, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t18", date: "2026-08-20", description: "Mobile Check Deposit – Tax Refund", category: "Deposit", amount: 4_812.0, status: "POSTED", kind: "credit", account: "chk" },
  { id: "t19", date: "2026-08-15", description: "DFAS – Military Pay (Mid-month)", category: "Income", amount: 9_412.36, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t20", date: "2026-08-15", description: "DFAS – Hardship Duty Pay", category: "Income", amount: 150.0, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t21", date: "2026-08-10", description: "Dominion Energy – Autopay", category: "Bills · Utilities", amount: -256.02, status: "POSTED", kind: "ach", account: "chk" },
  { id: "t22", date: "2026-08-09", description: "Rental Income – 1420 Harbor View Dr", category: "Income", amount: 3_150.0, status: "POSTED", kind: "ach", account: "chk" },
];

export const INITIAL_TRANSFERS: Transaction[] = [
  { id: "x1", date: "2026-08-27", description: "Money Market → Checking", category: "Internal", amount: 12_000, status: "POSTED", kind: "transfer", account: "chk" },
  { id: "x2", date: "2026-08-14", description: "Checking → Premier Money Market", category: "Internal", amount: -50_000, status: "POSTED", kind: "transfer", account: "chk" },
  { id: "x3", date: "2026-07-30", description: "Scheduled: Checking → Airman Savings", category: "Recurring", amount: -5_000, status: "POSTED", kind: "transfer", account: "chk" },
  { id: "x4", date: "2026-07-15", description: "Checking → Airman Savings", category: "Internal", amount: -5_000, status: "POSTED", kind: "transfer", account: "chk" },
];

export const INITIAL_ACH: Transaction[] = [
  { id: "a1", date: "2026-09-15", description: "DFAS – Military Pay", category: "ACH Credit", amount: 9_412.36, status: "POSTED", kind: "ach", account: "chk" },
  { id: "a2", date: "2026-09-12", description: "USAA Auto Insurance – Autopay", category: "ACH Debit · Bill", amount: -168.5, status: "POSTED", kind: "ach", account: "chk" },
  { id: "a3", date: "2026-09-10", description: "Dominion Energy – Autopay", category: "ACH Debit · Bill", amount: -241.19, status: "POSTED", kind: "ach", account: "chk" },
  { id: "a4", date: "2026-09-09", description: "Rental Income – Harbor View", category: "ACH Credit", amount: 3_150, status: "POSTED", kind: "ach", account: "chk" },
  { id: "a5", date: "2026-09-08", description: "TSP Distribution", category: "ACH Credit", amount: 6_250, status: "POSTED", kind: "ach", account: "sav" },
  { id: "a6", date: "2026-09-01", description: "Veterans United Mortgage – Autopay", category: "ACH Debit · Bill", amount: -2_418.6, status: "POSTED", kind: "ach", account: "chk" },
];

export const INITIAL_LINKED: LinkedAccount[] = [
  { id: "l1", bank: `${BANK_NAME} Internal – Savings`, type: "Savings", last4: "5903", routing: ROUTING_NUMBER, status: "VERIFIED", added: "2019-06-12" },
];

export const INITIAL_RECIPIENTS: AchRecipient[] = [
  { id: "r1", bank: "Dominion Energy", name: "Dominion Energy Billing", last4: "2210", routing: "051000017" },
  { id: "r2", bank: "Veterans United", name: "Veterans United Home Loans", last4: "8834", routing: "081000032" },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "New sign-in detected", body: "Successful sign-in from Chrome on Windows · Deployed location (Secure VPN).", time: "Today, 08:14 AM", level: "info", read: false },
  { id: "n2", title: "Deployment Security Hold active", body: `Ref ${HOLD.reference}: outbound external transfers are suspended for the duration of your deployment. Recurring bill payments continue normally.`, time: "Sep 1, 06:00 AM", level: "warning", read: false },
  { id: "n3", title: "Large deposit posted", body: "A wire of $425,000.00 posted to Premier Money Market.", time: "Sep 3, 10:22 AM", level: "info", read: true },
  { id: "n4", title: "Password changed", body: "Your online banking password was updated successfully.", time: "Aug 12, 04:41 PM", level: "info", read: true },
];

export const BANKS = [
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "USAA",
  "PNC Bank",
  "Capital One",
  "TD Bank",
  "Truist",
  "U.S. Bank",
  "Other (enter manually)",
];

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export const mask = (num: string) => "•••• " + num.slice(-4);

export const today = () => new Date().toISOString().slice(0, 10);

export const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
