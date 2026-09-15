'use client';

import { CircleAlert, Compass, RefreshCw, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PackingForm } from '@/components/PackingForm';
import { PackingResults, ResultsSkeleton } from '@/components/PackingResults';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast, type ToastMessage, type ToastTone } from '@/components/ui/Toast';
import { clearTrip, isStorageAvailable, loadTrip, saveTrip } from '@/lib/storage';
import type { ApiResponse, PackingListResult, TripData } from '@/lib/types';
import { createId } from '@/lib/utils';

type Status = 'idle' | 'loading' | 'error' | 'ready';

export default function HomePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<PackingListResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  const [lastTrip, setLastTrip] = useState<TripData | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((text: string, tone: ToastTone = 'info') => {
    setToast({ id: createId('toast'), tone, text });
  }, []);

  // localStorage is only ever touched after mount, so server and client render
  // the same markup and hydration stays clean.
  /* eslint-disable react-hooks/set-state-in-effect --
     Reading localStorage has to happen after mount so the server and the first
     client render produce identical markup. This runs once and is the documented
     way to hydrate from browser-only storage. */
  useEffect(() => {
    const saved = loadTrip();
    if (saved) {
      setResult(saved);
      setStatus('ready');
    }
    setRestored(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Persists the mutated list immediately, so ticks survive a refresh. */
  const persist = useCallback(
    (next: PackingListResult) => {
      setResult(next);
      const outcome = saveTrip(next);
      if (outcome === 'quota') {
        showToast('Your browser storage is full, so this change was not saved.', 'warning');
      } else if (outcome === 'error') {
        showToast('This change could not be saved to your browser.', 'warning');
      }
    },
    [showToast]
  );

  async function handleGenerate(trip: TripData) {
    setLastTrip(trip);
    setStatus('loading');
    setErrorMessage('');
    setFieldErrors(undefined);

    try {
      const response = await fetch('/api/generate-packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });

      let data: ApiResponse | null = null;
      try {
        data = (await response.json()) as ApiResponse;
      } catch {
        data = null;
      }

      if (!response.ok || !data || data.ok !== true) {
        const message =
          data && data.ok === false
            ? data.message
            : 'The server returned an unexpected response. Try again.';
        if (data && data.ok === false && data.fieldErrors) setFieldErrors(data.fieldErrors);
        setErrorMessage(message);
        setStatus('error');
        return;
      }

      // Only now do we overwrite whatever was previously saved.
      setResult(data.result);
      setStatus('ready');
      const outcome = saveTrip(data.result);
      if (outcome === 'unavailable') {
        showToast('Your list is ready, but this browser will not remember it.', 'warning');
      } else {
        showToast('Your packing list is ready.', 'success');
      }
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch {
      setErrorMessage(
        typeof navigator !== 'undefined' && navigator.onLine === false
          ? 'You appear to be offline. Reconnect and try again.'
          : 'The request could not reach the server. Check your connection and try again.'
      );
      setStatus('error');
    }
  }

  function handleToggleItem(categoryId: string, itemId: string) {
    if (!result) return;
    persist({
      ...result,
      categories: result.categories.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
      ),
    });
  }

  function handleRemoveItem(categoryId: string, itemId: string) {
    if (!result) return;
    persist({
      ...result,
      categories: result.categories.map((category) =>
        category.id !== categoryId
          ? category
          : { ...category, items: category.items.filter((item) => item.id !== itemId) }
      ),
    });
  }

  function handleAddCustomItem(categoryId: string, name: string) {
    if (!result) return;
    persist({
      ...result,
      categories: result.categories.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              items: [
                ...category.items,
                { id: createId('item'), name, checked: false, custom: true },
              ],
            }
      ),
    });
    showToast(`Added “${name}”.`, 'success');
  }

  function handleClearCompleted() {
    if (!result) return;
    persist({
      ...result,
      categories: result.categories.map((category) => ({
        ...category,
        items: category.items.filter((item) => !item.checked),
      })),
    });
    showToast('Packed items removed from the list.', 'info');
  }

  function handleResetChecklist() {
    if (!result) return;
    persist({
      ...result,
      categories: result.categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({ ...item, checked: false })),
      })),
    });
    showToast('Everything is unticked again.', 'info');
  }

  function handleNewTrip() {
    clearTrip();
    setResult(null);
    setStatus('idle');
    setErrorMessage('');
    setFieldErrors(undefined);
    setConfirmOpen(false);
    showToast('Saved trip cleared. Start a new one below.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const showForm = status !== 'ready';
  const isLoading = status === 'loading';

  return (
    <>
      <header className="print-hide border-b border-line/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lift"
              style={{ backgroundImage: 'linear-gradient(135deg,#1F6F8B,#6D5BB5)' }}
            >
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg leading-none text-ink">PackSmart AI</p>
              <p className="mt-1 text-xs text-muted">A smarter packing list for every journey.</p>
            </div>
          </div>

          {result ? (
            <button
              type="button"
              className="ps-btn-secondary"
              onClick={() => setConfirmOpen(true)}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New trip</span>
              <span className="sr-only sm:hidden">Start a new trip</span>
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        {showForm ? (
          <section className="print-hide mx-auto mb-10 max-w-2xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-[2.6rem]">
              Pack smarter for your next trip.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              Tell us where you&rsquo;re going and how you like to travel. You&rsquo;ll get an
              editable checklist, sorted by category, that you can tick off as you pack.
            </p>
          </section>
        ) : null}

        {showForm ? (
          <div className="print-hide mx-auto max-w-3xl">
            <PackingForm
              isLoading={isLoading}
              serverFieldErrors={fieldErrors}
              onSubmit={handleGenerate}
            />
          </div>
        ) : null}

        <div ref={resultsRef} className="mt-8">
          {status === 'loading' ? (
            <div className="print-hide mx-auto max-w-3xl">
              <ResultsSkeleton />
            </div>
          ) : null}

          {status === 'error' ? (
            <div
              role="alert"
              className="print-hide mx-auto max-w-3xl rounded-2xl border border-danger-200 bg-danger-50 p-6 shadow-card"
            >
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" aria-hidden="true" />
                <div className="flex-1">
                  <h2 className="font-display text-lg text-ink">That didn&rsquo;t work</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{errorMessage}</p>
                  {lastTrip ? (
                    <button
                      type="button"
                      className="ps-btn-secondary mt-4"
                      onClick={() => handleGenerate(lastTrip)}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Try again
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {status === 'ready' && result ? (
            <PackingResults
              result={result}
              onToggleItem={handleToggleItem}
              onRemoveItem={handleRemoveItem}
              onAddCustomItem={handleAddCustomItem}
              onClearCompleted={handleClearCompleted}
              onResetChecklist={handleResetChecklist}
            />
          ) : null}
        </div>

        {restored && status === 'idle' && !isStorageAvailable() ? (
          <p className="print-hide mx-auto mt-6 max-w-3xl text-center text-xs text-muted">
            Your browser is blocking local storage, so lists won&rsquo;t be remembered between
            visits. You can still print or save the list as a PDF.
          </p>
        ) : null}
      </main>

      <footer className="border-t border-line/70 bg-white/60 print:border-0 print:bg-transparent">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <p className="max-w-3xl text-xs leading-relaxed text-muted">
            AI suggestions are a planning aid. Verify travel documents, weather, airline baggage
            rules, entry requirements, and personal needs before departure.
          </p>
        </div>
      </footer>

      <ConfirmDialog
        open={confirmOpen}
        title="Start a new trip?"
        description="This deletes your saved checklist, including anything you ticked off or added yourself. It can't be undone."
        confirmLabel="Delete and start over"
        onConfirm={handleNewTrip}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
