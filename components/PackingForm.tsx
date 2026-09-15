'use client';

import { AlertCircle, Loader2, MapPin, Sparkles } from 'lucide-react';
import { useId, useState } from 'react';
import {
  ACTIVITIES,
  CLIMATES,
  LAUNDRY_OPTIONS,
  LUGGAGE_TYPES,
  PACKING_STYLES,
  TRIP_TYPES,
  type Activity,
  type TripData,
} from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_SPECIAL = 500;

type FormState = {
  destination: string;
  days: string;
  tripType: TripData['tripType'];
  climate: TripData['climate'];
  luggage: TripData['luggage'];
  laundry: TripData['laundry'];
  packingStyle: TripData['packingStyle'];
  activities: Activity[];
  specialRequirements: string;
};

const EMPTY_FORM: FormState = {
  destination: '',
  days: '5',
  tripType: 'Holiday',
  climate: 'Mixed or unknown',
  luggage: 'Carry-on only',
  laundry: 'No laundry access',
  packingStyle: 'Balanced',
  activities: [],
  specialRequirements: '',
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  const destination = form.destination.trim();
  if (destination.length < 2) {
    errors.destination = 'Enter a destination with at least 2 characters.';
  } else if (destination.length > 120) {
    errors.destination = 'Use 120 characters or fewer.';
  }

  const days = Number(form.days);
  if (!form.days.trim() || Number.isNaN(days)) {
    errors.days = 'Enter how many days you will be away.';
  } else if (!Number.isInteger(days)) {
    errors.days = 'Use whole days.';
  } else if (days < 1 || days > 60) {
    errors.days = 'Choose between 1 and 60 days.';
  }

  if (form.specialRequirements.length > MAX_SPECIAL) {
    errors.specialRequirements = `Use ${MAX_SPECIAL} characters or fewer.`;
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function PackingForm({
  isLoading,
  serverFieldErrors,
  onSubmit,
}: {
  isLoading: boolean;
  serverFieldErrors?: Record<string, string[]>;
  onSubmit: (trip: TripData) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const uid = useId();

  const field = (name: string) => `${uid}-${name}`;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function toggleActivity(activity: Activity) {
    setForm((previous) => ({
      ...previous,
      activities: previous.activities.includes(activity)
        ? previous.activities.filter((entry) => entry !== activity)
        : [...previous.activities, activity],
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      document.getElementById(field(firstError))?.focus();
      return;
    }

    const trip: TripData = {
      destination: form.destination.trim(),
      days: Number(form.days),
      tripType: form.tripType,
      climate: form.climate,
      luggage: form.luggage,
      laundry: form.laundry,
      packingStyle: form.packingStyle,
      activities: form.activities,
      ...(form.specialRequirements.trim()
        ? { specialRequirements: form.specialRequirements.trim() }
        : {}),
    };
    onSubmit(trip);
  }

  const serverError = (key: string) => serverFieldErrors?.[key]?.[0];
  const errorFor = (key: keyof FormState) => errors[key] ?? serverError(key);

  const remaining = MAX_SPECIAL - form.specialRequirements.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="ps-card p-6 sm:p-8">
      <fieldset disabled={isLoading} className="space-y-7">
        <legend className="sr-only">Trip details</legend>

        {/* Destination + duration */}
        <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
          <div>
            <label htmlFor={field('destination')} className="ps-label">
              Where are you going?
            </label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id={field('destination')}
                name="destination"
                type="text"
                autoComplete="off"
                placeholder="Lagos, Nigeria"
                maxLength={120}
                required
                value={form.destination}
                onChange={(event) => update('destination', event.target.value)}
                aria-invalid={Boolean(errorFor('destination'))}
                aria-describedby={
                  errorFor('destination') ? field('destination-error') : undefined
                }
                className={cn('ps-field pl-10', errorFor('destination') && 'ps-field-invalid')}
              />
            </div>
            <FieldError id={field('destination-error')} message={errorFor('destination')} />
          </div>

          <div>
            <label htmlFor={field('days')} className="ps-label">
              How many days is your trip?
            </label>
            <input
              id={field('days')}
              name="days"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              step={1}
              required
              value={form.days}
              onChange={(event) => update('days', event.target.value)}
              aria-invalid={Boolean(errorFor('days'))}
              aria-describedby={errorFor('days') ? field('days-error') : undefined}
              className={cn('ps-field', errorFor('days') && 'ps-field-invalid')}
            />
            <FieldError id={field('days-error')} message={errorFor('days')} />
          </div>
        </div>

        {/* Selects */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={field('tripType')} className="ps-label">
              Trip type
            </label>
            <select
              id={field('tripType')}
              name="tripType"
              className="ps-select"
              value={form.tripType}
              onChange={(event) => update('tripType', event.target.value as TripData['tripType'])}
            >
              {TRIP_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={field('climate')} className="ps-label">
              Climate or expected weather
            </label>
            <select
              id={field('climate')}
              name="climate"
              className="ps-select"
              value={form.climate}
              onChange={(event) => update('climate', event.target.value as TripData['climate'])}
            >
              {CLIMATES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="ps-hint">Pick what you expect — check a forecast closer to departure.</p>
          </div>

          <div>
            <label htmlFor={field('luggage')} className="ps-label">
              Luggage
            </label>
            <select
              id={field('luggage')}
              name="luggage"
              className="ps-select"
              value={form.luggage}
              onChange={(event) => update('luggage', event.target.value as TripData['luggage'])}
            >
              {LUGGAGE_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={field('laundry')} className="ps-label">
              Laundry access
            </label>
            <select
              id={field('laundry')}
              name="laundry"
              className="ps-select"
              value={form.laundry}
              onChange={(event) => update('laundry', event.target.value as TripData['laundry'])}
            >
              {LAUNDRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={field('packingStyle')} className="ps-label">
              Packing style
            </label>
            <select
              id={field('packingStyle')}
              name="packingStyle"
              className="ps-select"
              value={form.packingStyle}
              onChange={(event) =>
                update('packingStyle', event.target.value as TripData['packingStyle'])
              }
            >
              {PACKING_STYLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities */}
        <div>
          <fieldset>
            <legend className="ps-label">What will you be doing?</legend>
            <p className="ps-hint mb-3 mt-0">Optional. Choose any that apply.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIVITIES.map((activity) => {
                const checked = form.activities.includes(activity);
                return (
                  <label
                    key={activity}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-150',
                      checked
                        ? 'border-brand-400 bg-brand-50 text-brand-800'
                        : 'border-line bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/50'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                      checked={checked}
                      onChange={() => toggleActivity(activity)}
                    />
                    <span>{activity}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Special requirements */}
        <div>
          <label htmlFor={field('specialRequirements')} className="ps-label">
            Anything else we should know?
          </label>
          <textarea
            id={field('specialRequirements')}
            name="specialRequirements"
            rows={4}
            maxLength={MAX_SPECIAL}
            placeholder="Example: I need prescription medication, one formal dinner outfit, I am travelling with a baby, I wear glasses, or I need to work from my laptop."
            value={form.specialRequirements}
            onChange={(event) => update('specialRequirements', event.target.value)}
            aria-invalid={Boolean(errorFor('specialRequirements'))}
            aria-describedby={field('special-count')}
            className={cn(
              'ps-field resize-y',
              errorFor('specialRequirements') && 'ps-field-invalid'
            )}
          />
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <p id={field('special-count')} className="text-xs text-muted">
              Optional. Please leave out passport numbers, card details, and medical records.
            </p>
            <span className="shrink-0 text-xs tabular-nums text-muted">{remaining} left</span>
          </div>
          <FieldError id={field('special-error')} message={errorFor('specialRequirements')} />
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Takes about 10 seconds.</p>
        <button type="submit" className="ps-btn-primary w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating your list…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate my smart packing list
            </>
          )}
        </button>
      </div>
    </form>
  );
}
