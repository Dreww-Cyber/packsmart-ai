import type { PackingListResult } from './types';

/** Tiny class-name joiner (keeps the dependency list small). */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/**
 * Cryptographically-random id. `crypto.randomUUID` exists in modern browsers and
 * in Node 19+; the fallback keeps older runtimes and non-secure contexts working.
 */
export function createId(prefix = 'i'): string {
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto?.randomUUID) return `${prefix}_${g.crypto.randomUUID()}`;
  if (g.crypto?.getRandomValues) {
    const bytes = g.crypto.getRandomValues(new Uint8Array(12));
    return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/** Normalised key used for de-duplicating item names. */
export function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(a|an|the|your|some)\b/g, ' ')
    .replace(/s\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const ICON_RULES: Array<[RegExp, string]> = [
  [/document|essential|paper|travel doc/i, 'documents'],
  [/cloth|wear|outfit|apparel/i, 'clothing'],
  [/toiletr|hygiene|bath|grooming|health/i, 'toiletries'],
  [/electronic|tech|device|gadget/i, 'electronics'],
  [/activity|destination|gear|outdoor|sport/i, 'activity'],
];

/**
 * Category icons are decided in application code, never taken from model output.
 * Returns a stable key that the client maps to a Lucide component.
 */
export function iconForCategory(categoryName: string): string {
  for (const [pattern, key] of ICON_RULES) {
    if (pattern.test(categoryName)) return key;
  }
  return 'general';
}

/** Strips ```json fences or stray prose around a JSON object. */
export function extractJson(raw: string): string {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) text = fence[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }
  return text.trim();
}

export type Progress = { total: number; packed: number; percent: number };

export function computeProgress(result: PackingListResult): Progress {
  let total = 0;
  let packed = 0;
  for (const category of result.categories) {
    for (const item of category.items) {
      total += 1;
      if (item.checked) packed += 1;
    }
  }
  return { total, packed, percent: total === 0 ? 0 : Math.round((packed / total) * 100) };
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
