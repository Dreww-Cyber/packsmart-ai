/**
 * Shared types + option constants for PackSmart AI.
 *
 * This file is imported by BOTH client components and server code, so it must
 * never import anything server-only (no `@anthropic-ai/sdk`, no `node:` builtins).
 */

export const TRIP_TYPES = [
  'Holiday',
  'Business',
  'Family visit',
  'Backpacking',
  'Adventure',
  'Other',
] as const;

export const CLIMATES = [
  'Hot and sunny',
  'Hot and humid',
  'Cold',
  'Rainy',
  'Mixed or unknown',
] as const;

export const LUGGAGE_TYPES = [
  'Personal item only',
  'Carry-on only',
  'Checked luggage',
  'Multiple bags',
] as const;

export const LAUNDRY_OPTIONS = [
  'No laundry access',
  'Laundry available once',
  'Laundry available regularly',
] as const;

export const PACKING_STYLES = ['Light packer', 'Balanced', 'Prefer extra options'] as const;

export const ACTIVITIES = [
  'Swimming',
  'Beach time',
  'Hiking',
  'Gym',
  'Formal event',
  'Nightlife',
  'Remote work',
  'Sightseeing',
  'Camping',
  'Photography',
] as const;

/** Canonical category names. The server normalises Claude's output onto these. */
export const CATEGORY_NAMES = [
  'Documents & essentials',
  'Clothing',
  'Toiletries',
  'Electronics',
  'Activity & destination items',
] as const;

export type TripType = (typeof TRIP_TYPES)[number];
export type Climate = (typeof CLIMATES)[number];
export type LuggageType = (typeof LUGGAGE_TYPES)[number];
export type LaundryAccess = (typeof LAUNDRY_OPTIONS)[number];
export type PackingStyle = (typeof PACKING_STYLES)[number];
export type Activity = (typeof ACTIVITIES)[number];
export type CategoryName = (typeof CATEGORY_NAMES)[number];

export type TripData = {
  destination: string;
  days: number;
  tripType: TripType;
  climate: Climate;
  luggage: LuggageType;
  laundry: LaundryAccess;
  packingStyle: PackingStyle;
  activities: Activity[];
  specialRequirements?: string;
};

export type PackingItem = {
  id: string;
  name: string;
  quantity?: string;
  tip?: string;
  checked: boolean;
  custom?: boolean;
};

export type PackingCategory = {
  id: string;
  name: string;
  /** Icon key resolved to a Lucide component on the client. Set by the server. */
  icon: string;
  items: PackingItem[];
};

export type PackingListResult = {
  title: string;
  summary: string;
  categories: PackingCategory[];
  reminders: string[];
  tripData: TripData;
  generatedAt: string;
};

/** Shape persisted in localStorage under `packsmart_ai_current_trip`. */
export type StoredTrip = {
  version: 1;
  result: PackingListResult;
};

export type ApiSuccess = { ok: true; result: PackingListResult };

export type ApiErrorCode =
  | 'invalid_request'
  | 'invalid_json'
  | 'missing_api_key'
  | 'rate_limited'
  | 'payload_too_large'
  | 'model_error'
  | 'invalid_model_output'
  | 'server_error';

export type ApiError = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  /** Present only for validation failures, to help the form show field errors. */
  fieldErrors?: Record<string, string[]>;
};

export type ApiResponse = ApiSuccess | ApiError;
