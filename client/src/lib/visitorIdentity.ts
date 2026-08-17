const DEVICE_ID_STORAGE_KEY = "primedeal_device_id";
const DEVICE_ID_PATTERN = /^[a-f0-9-]{36}$/i;

export function getOrCreateVisitorDeviceId(): string | undefined {
  if (typeof window === "undefined" || !window.localStorage) return undefined;

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing && DEVICE_ID_PATTERN.test(existing)) return existing;

    const deviceId = window.crypto?.randomUUID?.();
    if (!deviceId || !DEVICE_ID_PATTERN.test(deviceId)) return undefined;

    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    return deviceId;
  } catch {
    return undefined;
  }
}
