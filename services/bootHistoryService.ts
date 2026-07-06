// StormRaven Boot History Service — AsyncStorage persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOT_HISTORY_KEY = 'stormraven_boot_history';
const LOCKDOWN_KEY = 'stormraven_lockdown_active';
const BOOT_OPTIONS_KEY = 'stormraven_boot_options';
const MAX_HISTORY = 20;

export interface BootModuleResult {
  label: string;
  loaded: boolean;
  durationMs: number;
}

export interface BootSession {
  id: string;
  timestamp: string;
  isoDate: string;
  durationMs: number;
  kernelVersion: string;
  mode: 'normal' | 'lockdown' | 'recovery';
  modulesLoaded: number;
  totalModules: number;
  moduleResults: BootModuleResult[];
  bootOptions: BootOptions;
  status: 'success' | 'emergency' | 'aborted';
}

export interface BootOptions {
  kaslr: boolean;
  ptrace_scope: number;
  modules_disabled: boolean;
  tcp_syncookies: boolean;
  dmesg_restrict: boolean;
}

export const DEFAULT_BOOT_OPTIONS: BootOptions = {
  kaslr: true,
  ptrace_scope: 3,
  modules_disabled: false,
  tcp_syncookies: true,
  dmesg_restrict: true,
};

// ─── Lockdown Persistence ─────────────────────────────────────────────────────

export async function persistLockdown(active: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCKDOWN_KEY, JSON.stringify(active));
  } catch {}
}

export async function readLockdownState(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(LOCKDOWN_KEY);
    return val ? JSON.parse(val) : false;
  } catch {
    return false;
  }
}

// ─── Boot Options Persistence ─────────────────────────────────────────────────

export async function saveBootOptions(opts: BootOptions): Promise<void> {
  try {
    await AsyncStorage.setItem(BOOT_OPTIONS_KEY, JSON.stringify(opts));
  } catch {}
}

export async function loadBootOptions(): Promise<BootOptions> {
  try {
    const val = await AsyncStorage.getItem(BOOT_OPTIONS_KEY);
    return val ? { ...DEFAULT_BOOT_OPTIONS, ...JSON.parse(val) } : DEFAULT_BOOT_OPTIONS;
  } catch {
    return DEFAULT_BOOT_OPTIONS;
  }
}

// ─── Boot History ─────────────────────────────────────────────────────────────

export async function saveBootSession(session: BootSession): Promise<void> {
  try {
    const existing = await loadBootHistory();
    const updated = [session, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(BOOT_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function loadBootHistory(): Promise<BootSession[]> {
  try {
    const val = await AsyncStorage.getItem(BOOT_HISTORY_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function clearBootHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BOOT_HISTORY_KEY);
  } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}

export function buildBootSession(
  startTime: number,
  mode: BootSession['mode'],
  moduleResults: BootModuleResult[],
  bootOptions: BootOptions,
): BootSession {
  const now = Date.now();
  const durationMs = now - startTime;
  const loaded = moduleResults.filter(m => m.loaded).length;
  return {
    id: `boot-${now}`,
    timestamp: new Date(now).toLocaleString('en-US', {
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }),
    isoDate: new Date(now).toISOString(),
    durationMs,
    kernelVersion: '6.6.21-ymir-hardened',
    mode,
    modulesLoaded: loaded,
    totalModules: moduleResults.length,
    moduleResults,
    bootOptions,
    status: mode === 'lockdown' ? 'emergency' : 'success',
  };
}
