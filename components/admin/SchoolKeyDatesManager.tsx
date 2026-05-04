'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

type KeyDateRecord = {
  id: string;
  label: string;
  dateText: string;
  isActive: boolean;
  sortOrder: number;
};

type Draft = Omit<KeyDateRecord, 'id'>;

export default function SchoolKeyDatesManager({
  token,
  schoolKey,
}: {
  token: string;
  schoolKey: string;
}) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [keyDates, setKeyDates] = useState<KeyDateRecord[]>([]);
  const [draft, setDraft] = useState<Draft>({
    label: '',
    dateText: '',
    isActive: true,
    sortOrder: 0,
  });

  const baseUrl = useMemo(() => `/api/admin/schools/${encodeURIComponent(schoolKey)}/key-dates`, [schoolKey]);

  const refresh = async () => {
    setIsLoading(true);
    setStatus('');
    try {
      const response = await apiFetch(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setKeyDates([]);
        setStatus('Unable to load key dates.');
        return;
      }
      const data = await response.json().catch(() => ({}));
      setKeyDates(Array.isArray(data?.keyDates) ? data.keyDates : []);
    } catch {
      setKeyDates([]);
      setStatus('Unable to load key dates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, token]);

  const add = async () => {
    if (!draft.label.trim() || !draft.dateText.trim()) {
      setStatus('Please enter a label and date text.');
      return;
    }
    setStatus('');
    try {
      const response = await apiFetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });
      if (!response.ok) {
        setStatus('Unable to add key date.');
        return;
      }
      setDraft((prev) => ({ ...prev, label: '', dateText: '', sortOrder: prev.sortOrder + 1 }));
      await refresh();
      setStatus('Key date added.');
    } catch {
      setStatus('Unable to add key date.');
    }
  };

  const save = async (record: KeyDateRecord) => {
    setSavingId(record.id);
    setStatus('');
    try {
      const response = await apiFetch(`${baseUrl}/${encodeURIComponent(record.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(record),
      });
      if (!response.ok) {
        setStatus('Unable to save key date.');
        return;
      }
      await refresh();
      setStatus('Key date saved.');
    } catch {
      setStatus('Unable to save key date.');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this key date?')) return;
    setStatus('');
    try {
      const response = await apiFetch(`${baseUrl}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok && response.status !== 204) {
        setStatus('Unable to delete key date.');
        return;
      }
      await refresh();
      setStatus('Key date deleted.');
    } catch {
      setStatus('Unable to delete key date.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status && (
        <div
          className={`p-4 rounded-xl text-sm ${
            status.includes('Unable') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          }`}
        >
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Key Date
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-1 block">
                Label *
              </label>
              <input
                type="text"
                value={draft.label}
                onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Entrance Exams"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-1 block">
                Date Text *
              </label>
              <input
                type="text"
                value={draft.dateText}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateText: e.target.value }))}
                placeholder="e.g., April 12–13, 2025"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-1 block">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, sortOrder: Number.parseInt(e.target.value || '0', 10) || 0 }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground"
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  id="draft-active"
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="draft-active" className="text-sm text-foreground/70">
                  Active
                </label>
              </div>
            </div>

            <Button onClick={add} className="w-full md:w-auto">
              Add Key Date
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Key Dates</h2>
          {keyDates.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl border-border/60">
              <p className="text-sm text-foreground/60">No key dates added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keyDates.map((record) => (
                <div key={record.id} className="rounded-xl border border-border/60 bg-background p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={record.label}
                        onChange={(e) =>
                          setKeyDates((prev) =>
                            prev.map((d) => (d.id === record.id ? { ...d, label: e.target.value } : d)),
                          )
                        }
                        className="w-full font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition px-1 py-1"
                      />
                      <input
                        type="text"
                        value={record.dateText}
                        onChange={(e) =>
                          setKeyDates((prev) =>
                            prev.map((d) => (d.id === record.id ? { ...d, dateText: e.target.value } : d)),
                          )
                        }
                        className="w-full text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition px-1 py-1"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(record.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-foreground/40 block mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={record.sortOrder}
                        onChange={(e) =>
                          setKeyDates((prev) =>
                            prev.map((d) =>
                              d.id === record.id
                                ? { ...d, sortOrder: Number.parseInt(e.target.value || '0', 10) || 0 }
                                : d,
                            ),
                          )
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <input
                        id={`active-${record.id}`}
                        type="checkbox"
                        checked={record.isActive}
                        onChange={(e) =>
                          setKeyDates((prev) =>
                            prev.map((d) => (d.id === record.id ? { ...d, isActive: e.target.checked } : d)),
                          )
                        }
                        className="rounded border-border"
                      />
                      <label htmlFor={`active-${record.id}`} className="text-sm text-foreground/70">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => save(record)}
                      disabled={savingId === record.id}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {savingId === record.id ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

