import { z } from 'zod';
import {
  ACTIVITIES,
  CLIMATES,
  LAUNDRY_OPTIONS,
  LUGGAGE_TYPES,
  PACKING_STYLES,
  TRIP_TYPES,
} from './types';

/** Collapse whitespace and strip control characters from free-text input. */
const cleanText = (value: string) =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const CleanString = (max: number) =>
  z
    .string()
    .max(max * 2, `Must be ${max} characters or fewer.`)
    .transform(cleanText);

/**
 * Strict schema for the trip details submitted by the browser.
 * Every field is length-limited to reduce prompt-injection surface area.
 */
export const TripDataSchema = z.object({
  destination: CleanString(120).pipe(
    z
      .string()
      .min(2, 'Enter at least 2 characters.')
      .max(120, 'Use 120 characters or fewer.')
  ),
  days: z
    .number({ invalid_type_error: 'Enter the number of days.' })
    .int('Use whole days.')
    .min(1, 'Trips must be at least 1 day.')
    .max(60, 'Use 60 days or fewer.'),
  tripType: z.enum(TRIP_TYPES),
  climate: z.enum(CLIMATES),
  luggage: z.enum(LUGGAGE_TYPES),
  laundry: z.enum(LAUNDRY_OPTIONS),
  packingStyle: z.enum(PACKING_STYLES),
  activities: z.array(z.enum(ACTIVITIES)).max(10, 'Choose up to 10 activities.').default([]),
  specialRequirements: CleanString(500)
    .pipe(z.string().max(500, 'Use 500 characters or fewer.'))
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type TripDataInput = z.infer<typeof TripDataSchema>;

/* ------------------------------------------------------------------ */
/* Claude raw response validation                                      */
/* ------------------------------------------------------------------ */

const ModelItemSchema = z.object({
  name: CleanString(160).pipe(z.string().min(1).max(160)),
  quantity: CleanString(40).pipe(z.string().max(40)).optional(),
  tip: CleanString(240).pipe(z.string().max(240)).optional(),
});

const ModelCategorySchema = z.object({
  name: CleanString(80).pipe(z.string().min(1).max(80)),
  items: z.array(ModelItemSchema).max(30).default([]),
});

/**
 * Claude is asked for exactly this shape: no ids, no `checked`, no icons.
 * Those fields are added by the server after validation.
 */
export const ModelPackingListSchema = z.object({
  title: CleanString(160).pipe(z.string().min(1).max(160)),
  summary: CleanString(600).pipe(z.string().min(1).max(600)),
  categories: z.array(ModelCategorySchema).min(1).max(12),
  reminders: z.array(CleanString(240).pipe(z.string().min(1).max(240))).max(10).default([]),
});

export type ModelPackingList = z.infer<typeof ModelPackingListSchema>;

/* ------------------------------------------------------------------ */
/* Final client-facing response validation                             */
/* ------------------------------------------------------------------ */

export const PackingItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(160),
  quantity: z.string().max(40).optional(),
  tip: z.string().max(240).optional(),
  checked: z.boolean(),
  custom: z.boolean().optional(),
});

export const PackingCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  icon: z.string().min(1).max(40),
  items: z.array(PackingItemSchema).max(30),
});

export const PackingListResultSchema = z.object({
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(600),
  categories: z.array(PackingCategorySchema).min(1).max(12),
  reminders: z.array(z.string().min(1).max(240)).max(10),
  tripData: TripDataSchema,
  generatedAt: z.string().min(1),
});
