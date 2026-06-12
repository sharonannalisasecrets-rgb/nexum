import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy') {
  try { return format(parseISO(dateStr), fmt); }
  catch { return dateStr; }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export function formatElapsed(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function roleName(role: string) {
  const map: Record<string, string> = {
    worshipper: 'Worshipper',
    medical_officer: 'Medical Officer',
    security_officer: 'Security Officer',
    driver: 'Driver',
    admin: 'Admin',
  };
  return map[role] ?? role;
}
