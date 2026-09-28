/**
 * STEP 42 — Entry OAuth draft persistence smoke (sessionStorage).
 * Production contracts are not modified by this probe.
 */
import { readFileSync } from "node:fs";

type Store = Map<string, string>;

function installSessionStorageMock(): {
  store: Store;
  localStore: Store;
} {
  const store: Store = new Map();
  const localStore: Store = new Map();

  const sessionStorage = {
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
  };

  const localStorage = {
    getItem(key: string): string | null {
      return localStore.has(key) ? localStore.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      localStore.set(key, String(value));
    },
    removeItem(key: string): void {
      localStore.delete(key);
    },
    clear(): void {
      localStore.clear();
    },
  };

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    writable: true,
    value: sessionStorage,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: localStorage,
  });

  return { store, localStore };
}

const { store, localStore } = installSessionStorageMock();

const modulePath =
  "./src/v3/vnext/entry/vNextEntryPersistence.ts";

const {
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  clearVNextEntryDraft,
  fromVNextEntryDraft,
  isConsistentVNextEntryDraft,
  loadVNextEntryDraft,
  saveVNextEntryDraft,
  toVNextEntryDraft,
} = await import(modulePath);

const validBirth = {
  gender: "female" as const,
  year: 1990,
  month: 5,
  day: 15,
  birthTimeBranch: "o" as const,
  calendarType: "solar" as const,
  displayName: "테스트",
};

type Check = { id: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function assert(
  id: string,
  ok: boolean,
  detail?: string,
): void {
  checks.push({ id, ok, detail });
}

function rawGet(): string | null {
  return store.has(VNEXT_ENTRY_DRAFT_STORAGE_KEY)
    ? store.get(VNEXT_ENTRY_DRAFT_STORAGE_KEY)!
    : null;
}

// 1. save
store.clear();
localStore.clear();
saveVNextEntryDraft({
  phase: "consulting",
  selectedMode: "question",
  birthProfile: validBirth,
});
assert("1-save", rawGet() !== null, rawGet()?.slice(0, 40));

// 2. load
const loaded = loadVNextEntryDraft();
assert(
  "2-load",
  loaded !== null
    && loaded.phase === "consulting"
    && loaded.selectedMode === "question"
    && loaded.birthProfile?.year === 1990
    && loaded.birthProfile?.displayName === "테스트",
);

// 3. malformed JSON
store.set(VNEXT_ENTRY_DRAFT_STORAGE_KEY, "{not-json");
assert("3-malformed-json", loadVNextEntryDraft() === null);
assert(
  "3-malformed-cleared",
  rawGet() === null,
);

// 4. schemaVersion mismatch
store.set(
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  JSON.stringify({
    schemaVersion: 999,
    phase: "consulting",
    selectedMode: "question",
    birthProfile: validBirth,
  }),
);
assert("4-schema-mismatch", loadVNextEntryDraft() === null);
assert("4-schema-cleared", rawGet() === null);

// 5. valid birthProfile restore
saveVNextEntryDraft({
  phase: "birthInput",
  selectedMode: "question",
  birthProfile: validBirth,
});
const restoredBirth = fromVNextEntryDraft(loadVNextEntryDraft());
assert(
  "5-valid-birth-restore",
  restoredBirth !== null
    && restoredBirth.phase === "birthInput"
    && restoredBirth.birthProfile?.gender === "female"
    && restoredBirth.birthProfile?.birthTimeBranch === "o",
);

// 6. consulting consistency
assert(
  "6-consulting-ok",
  isConsistentVNextEntryDraft({
    phase: "consulting",
    selectedMode: "question",
    birthProfile: validBirth,
  }),
);
assert(
  "6-consulting-reject-mode",
  !isConsistentVNextEntryDraft({
    phase: "consulting",
    selectedMode: "report",
    birthProfile: validBirth,
  }),
);
saveVNextEntryDraft({
  phase: "consulting",
  selectedMode: "question",
  birthProfile: validBirth,
});
const consultingLoaded = loadVNextEntryDraft();
assert(
  "6-consulting-load",
  consultingLoaded?.phase === "consulting"
    && consultingLoaded.selectedMode === "question"
    && consultingLoaded.birthProfile !== null,
);

// 7. report consistency
assert(
  "7-report-ok",
  isConsistentVNextEntryDraft({
    phase: "report",
    selectedMode: "report",
    birthProfile: validBirth,
  }),
);
assert(
  "7-report-reject-mode",
  !isConsistentVNextEntryDraft({
    phase: "report",
    selectedMode: "question",
    birthProfile: validBirth,
  }),
);
saveVNextEntryDraft({
  phase: "report",
  selectedMode: "report",
  birthProfile: validBirth,
});
const reportLoaded = loadVNextEntryDraft();
assert(
  "7-report-load",
  reportLoaded?.phase === "report"
    && reportLoaded.selectedMode === "report"
    && reportLoaded.birthProfile !== null,
);

// 8. inconsistent phase/mode/birthProfile rejection
store.set(
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  JSON.stringify({
    schemaVersion: 1,
    phase: "consulting",
    selectedMode: "report",
    birthProfile: validBirth,
  }),
);
assert(
  "8-inconsistent-consulting-mode",
  loadVNextEntryDraft() === null,
);

store.set(
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  JSON.stringify({
    schemaVersion: 1,
    phase: "report",
    selectedMode: "question",
    birthProfile: validBirth,
  }),
);
assert(
  "8-inconsistent-report-mode",
  loadVNextEntryDraft() === null,
);

store.set(
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  JSON.stringify({
    schemaVersion: 1,
    phase: "consulting",
    selectedMode: "question",
    birthProfile: null,
  }),
);
assert(
  "8-inconsistent-consulting-null-birth",
  loadVNextEntryDraft() === null,
);

store.set(
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  JSON.stringify({
    schemaVersion: 1,
    phase: "landing",
    selectedMode: "question",
    birthProfile: null,
  }),
);
assert(
  "8-inconsistent-landing-mode",
  loadVNextEntryDraft() === null,
);

store.set(
  VNEXT_ENTRY_DRAFT_STORAGE_KEY,
  JSON.stringify({
    schemaVersion: 1,
    phase: "birthInput",
    selectedMode: null,
    birthProfile: null,
  }),
);
assert(
  "8-inconsistent-birthInput-null-mode",
  loadVNextEntryDraft() === null,
);

assert(
  "8-from-null",
  fromVNextEntryDraft(null) === null,
);

// 9. clear
saveVNextEntryDraft({
  phase: "modeSelection",
  selectedMode: "question",
  birthProfile: null,
});
assert("9-pre-clear", rawGet() !== null);
clearVNextEntryDraft();
assert("9-clear", rawGet() === null);
assert("9-load-after-clear", loadVNextEntryDraft() === null);

// 10. sessionStorage only (runtime + source)
saveVNextEntryDraft({
  phase: "modeSelection",
  selectedMode: null,
  birthProfile: null,
});
assert(
  "10-session-used",
  store.has(VNEXT_ENTRY_DRAFT_STORAGE_KEY),
);
assert(
  "10-local-empty",
  localStore.size === 0,
);

const persistenceSrc = readFileSync(
  "src/v3/vnext/entry/vNextEntryPersistence.ts",
  "utf8",
);
const adapterSrc = readFileSync(
  "src/v3/vnext/entry/vNextEntryUIAdapter.ts",
  "utf8",
);
assert(
  "10-src-sessionStorage",
  /sessionStorage\.(getItem|setItem|removeItem)/.test(persistenceSrc),
);
assert(
  "10-src-no-localStorage-api",
  !/localStorage\.(getItem|setItem|removeItem)/.test(persistenceSrc)
    && !/localStorage\.(getItem|setItem|removeItem)/.test(adapterSrc),
);

// 11. auth secret not stored
const savedRaw = rawGet() ?? "";
const secretPatterns = [
  /access_token/i,
  /refresh_token/i,
  /password/i,
  /Authorization/i,
  /bearer\s+/i,
  /supabase/i,
  /secret/i,
];
assert(
  "11-no-auth-secret-in-draft",
  secretPatterns.every((re) => !re.test(savedRaw)),
);
assert(
  "11-draft-shape",
  (() => {
    const draft = toVNextEntryDraft({
      phase: "consulting",
      selectedMode: "question",
      birthProfile: validBirth,
    });
    const keys = Object.keys(draft).sort().join(",");
    return keys === "birthProfile,phase,schemaVersion,selectedMode";
  })(),
);

const failed = checks.filter((c) => !c.ok);
const pass = failed.length === 0;

console.log(JSON.stringify({
  step: 42,
  pass,
  total: checks.length,
  failed: failed.map((c) => c.id),
  checks,
}, null, 2));

if (!pass) {
  process.exitCode = 1;
}
