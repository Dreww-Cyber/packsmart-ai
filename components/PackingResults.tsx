'use client';

import {
  ChevronDown,
  CircleCheck,
  FileText,
  Eraser,
  Mountain,
  Package,
  Plus,
  Printer,
  RotateCcw,
  Shirt,
  Sparkles,
  Droplets,
  Plug,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { TripSummary } from '@/components/TripSummary';
import type { PackingListResult } from '@/lib/types';
import { cn, computeProgress, formatDateTime } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, typeof Package> = {
  documents: FileText,
  clothing: Shirt,
  toiletries: Droplets,
  electronics: Plug,
  activity: Mountain,
  general: Package,
};

type PackingResultsProps = {
  result: PackingListResult;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
  onAddCustomItem: (categoryId: string, name: string) => void;
  onClearCompleted: () => void;
  onResetChecklist: () => void;
};

export function PackingResults({
  result,
  onToggleItem,
  onRemoveItem,
  onAddCustomItem,
  onClearCompleted,
  onResetChecklist,
}: PackingResultsProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(result.categories[0]?.id ?? '');
  const [addError, setAddError] = useState('');

  const progress = useMemo(() => computeProgress(result), [result]);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newItemName.trim();
    if (name.length < 2) {
      setAddError('Give the item a name of at least 2 characters.');
      return;
    }
    const categoryId = result.categories.some((category) => category.id === newItemCategory)
      ? newItemCategory
      : result.categories[0]?.id;
    if (!categoryId) return;

    onAddCustomItem(categoryId, name.slice(0, 160));
    setNewItemName('');
    setAddError('');
  }

  return (
    <section aria-labelledby="result-heading" className="space-y-6">
      {/* Overview */}
      <div className="ps-card overflow-hidden">
        <div className="border-b border-line bg-gradient-to-br from-brand-50 via-white to-plum-100/40 px-6 py-7 sm:px-8">
          <h2 id="result-heading" className="font-display text-2xl leading-tight text-ink sm:text-3xl">
            {result.title}
          </h2>
          <p className="mt-2.5 max-w-2xl text-[0.95rem] leading-relaxed text-muted">
            {result.summary}
          </p>
          <div className="mt-5">
            <TripSummary trip={result.tripData} />
          </div>
          <p className="print-hide mt-4 text-xs text-muted">
            Created {formatDateTime(result.generatedAt)}
          </p>
        </div>

        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium text-ink">
              {progress.packed} of {progress.total} packed
            </p>
            <p className="text-sm tabular-nums text-muted">{progress.percent}%</p>
          </div>
          <div
            className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-brand-100"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Packing progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-teal-500 to-plum-500 transition-[width] duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="print-hide mt-5 flex flex-wrap gap-2">
            <button type="button" className="ps-btn-secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print or save as PDF
            </button>
            <button
              type="button"
              className="ps-btn-ghost"
              onClick={onClearCompleted}
              disabled={progress.packed === 0}
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Clear packed items
            </button>
            <button
              type="button"
              className="ps-btn-ghost"
              onClick={onResetChecklist}
              disabled={progress.packed === 0}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Untick everything
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      {result.categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.icon] ?? Package;
        const isCollapsed = collapsed[category.id] ?? false;
        const packedHere = category.items.filter((item) => item.checked).length;
        const panelId = `panel-${category.id}`;

        return (
          <div key={category.id} className="ps-card print-block overflow-hidden">
            <h3>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((previous) => ({ ...previous, [category.id]: !isCollapsed }))
                }
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-brand-50/60 sm:px-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold text-ink">{category.name}</span>
                  <span className="block text-xs text-muted">
                    {packedHere} of {category.items.length} packed
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'print-hide h-4 w-4 shrink-0 text-muted transition-transform duration-200',
                    isCollapsed && '-rotate-90'
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div id={panelId} hidden={isCollapsed}>
              {category.items.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-muted sm:px-6">
                  Nothing left here. Add an item below if you removed something by mistake.
                </p>
              ) : (
                <ul className="divide-y divide-line/70 border-t border-line/70">
                  {category.items.map((item) => (
                    <li
                      key={item.id}
                      className="group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-canvas/70 sm:px-6"
                    >
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={item.checked}
                        onChange={() => onToggleItem(category.id, item.id)}
                        className="mt-1 h-4.5 w-4.5 shrink-0 rounded border-line text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor={item.id} className="flex-1 cursor-pointer">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'text-[0.95rem] leading-snug text-ink transition-colors',
                              item.checked && 'text-muted line-through decoration-muted/60'
                            )}
                          >
                            {item.name}
                          </span>
                          {item.quantity ? (
                            <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-600">
                              {item.quantity}
                            </span>
                          ) : null}
                          {item.custom ? (
                            <span className="rounded-md bg-plum-100 px-1.5 py-0.5 text-xs font-medium text-plum-600">
                              Added by you
                            </span>
                          ) : null}
                        </span>
                        {item.tip ? (
                          <span
                            className={cn(
                              'mt-1 block text-xs leading-relaxed text-muted',
                              item.checked && 'opacity-60'
                            )}
                          >
                            {item.tip}
                          </span>
                        ) : null}
                      </label>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(category.id, item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="print-hide rounded-lg p-1.5 text-muted/70 transition-colors hover:bg-danger-50 hover:text-danger-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}

      {/* Add custom item */}
      <form onSubmit={handleAdd} className="ps-card print-hide p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
          <Plus className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Add your own item
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
          <div>
            <label htmlFor="custom-item-name" className="sr-only">
              Item name
            </label>
            <input
              id="custom-item-name"
              type="text"
              maxLength={160}
              placeholder="Travel pillow"
              value={newItemName}
              onChange={(event) => {
                setNewItemName(event.target.value);
                if (addError) setAddError('');
              }}
              aria-invalid={Boolean(addError)}
              aria-describedby={addError ? 'custom-item-error' : undefined}
              className={cn('ps-field', addError && 'ps-field-invalid')}
            />
          </div>
          <div>
            <label htmlFor="custom-item-category" className="sr-only">
              Category
            </label>
            <select
              id="custom-item-category"
              className="ps-select"
              value={newItemCategory}
              onChange={(event) => setNewItemCategory(event.target.value)}
            >
              {result.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="ps-btn-secondary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>
        {addError ? (
          <p id="custom-item-error" className="mt-2 text-xs font-medium text-danger-600">
            {addError}
          </p>
        ) : null}
      </form>

      {/* Reminders */}
      {result.reminders.length > 0 ? (
        <div className="ps-card print-block border-brand-200/70 bg-brand-50/50 p-6 sm:p-7">
          <h3 className="flex items-center gap-2 font-display text-lg text-ink">
            <TriangleAlert className="h-4.5 w-4.5 text-brand-600" aria-hidden="true" />
            Final reminders
          </h3>
          <ul className="mt-4 space-y-2.5">
            {result.reminders.map((reminder) => (
              <li key={reminder} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** Small shared header used by the loading state in `app/page.tsx`. */
export function ResultsSkeleton() {
  return (
    <div className="ps-card p-8 text-center" role="status" aria-live="polite">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
        <Sparkles className="h-5 w-5 animate-pulse text-brand-600" aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-xl text-ink">Building your checklist</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Weighing your trip length, luggage limit, and laundry access against everything you said
        you&rsquo;ll be doing.
      </p>
      <div className="mx-auto mt-6 max-w-md space-y-2.5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="h-4 w-4 shrink-0 rounded border border-line bg-canvas" />
            <span
              className="h-3 animate-pulse rounded-full bg-brand-100"
              style={{ width: `${70 - row * 12}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
