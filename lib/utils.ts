import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeString(str: string): string {
  // Only strip actual HTML injection characters (<, >) — preserve apostrophes,
  // hyphens, ampersands etc. which are valid in names and contact info
  return str.replace(/[<>]/g, "").trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

export function weeksBetween(dateA: Date, dateB: Date): number {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor((dateB.getTime() - dateA.getTime()) / msPerWeek);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
