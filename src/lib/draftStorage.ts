const DRAFT_STORAGE_PREFIX = 'safespace.draft.';

function getDraftStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readDraft<T>(key: string): T | null {
  const storage = getDraftStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`${DRAFT_STORAGE_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, value: unknown) {
  const storage = getDraftStorage();
  if (!storage) return;

  try {
    storage.setItem(`${DRAFT_STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota and private mode failures.
  }
}

export function clearDraft(key: string) {
  const storage = getDraftStorage();
  if (!storage) return;

  try {
    storage.removeItem(`${DRAFT_STORAGE_PREFIX}${key}`);
  } catch {
    // Ignore storage access failures.
  }
}
