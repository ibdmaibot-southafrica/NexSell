import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: n >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatTrustScore(score: number): string {
  return (score * 100).toFixed(0);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NXS-${year}-${random}`;
}

export function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function displayToCents(display: number): number {
  return Math.round(display * 100);
}

export function getTrustLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    unverified: "Unverified",
    email_verified: "Email Verified",
    business_verified: "Business Verified",
    kyc_verified: "KYC Verified",
    soc2_verified: "SOC 2 Verified",
    enterprise_verified: "Enterprise Verified",
  };
  return labels[level] ?? level;
}

export function getTrustLevelColor(level: string): string {
  const colors: Record<string, string> = {
    unverified: "text-neutral-500",
    email_verified: "text-warning-600",
    business_verified: "text-brand-600",
    kyc_verified: "text-brand-700",
    soc2_verified: "text-success-600",
    enterprise_verified: "text-success-700",
  };
  return colors[level] ?? "text-neutral-500";
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
