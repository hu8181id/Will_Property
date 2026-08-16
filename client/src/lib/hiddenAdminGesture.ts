export const HIDDEN_ADMIN_TAP_COUNT = 3;
export const HIDDEN_ADMIN_TAP_WINDOW_MS = 900;
export const HIDDEN_ADMIN_ARM_WINDOW_MS = 2500;
export const HIDDEN_ADMIN_HOLD_MS = 850;

export interface HiddenAdminGestureState {
  taps: number;
  lastTapAt: number;
  armedAt: number;
}

export const initialHiddenAdminGestureState: HiddenAdminGestureState = {
  taps: 0,
  lastTapAt: 0,
  armedAt: 0,
};

export function registerHiddenAdminTap(
  state: HiddenAdminGestureState,
  now: number,
): HiddenAdminGestureState {
  const taps = now - state.lastTapAt <= HIDDEN_ADMIN_TAP_WINDOW_MS ? state.taps + 1 : 1;
  return {
    taps,
    lastTapAt: now,
    armedAt: taps >= HIDDEN_ADMIN_TAP_COUNT ? now : 0,
  };
}

export function canStartHiddenAdminHold(
  state: HiddenAdminGestureState,
  now: number,
): boolean {
  return (
    state.taps >= HIDDEN_ADMIN_TAP_COUNT &&
    state.armedAt > 0 &&
    now - state.armedAt <= HIDDEN_ADMIN_ARM_WINDOW_MS
  );
}
