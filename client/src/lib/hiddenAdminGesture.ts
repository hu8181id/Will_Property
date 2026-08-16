export const HIDDEN_ADMIN_TAP_COUNT = 3;
export const HIDDEN_ADMIN_TAP_WINDOW_MS = 900;

export interface HiddenAdminGestureState {
  taps: number;
  lastTapAt: number;
}

export const initialHiddenAdminGestureState: HiddenAdminGestureState = {
  taps: 0,
  lastTapAt: 0,
};

export function registerHiddenAdminTap(
  state: HiddenAdminGestureState,
  now: number,
): HiddenAdminGestureState {
  const taps = now - state.lastTapAt <= HIDDEN_ADMIN_TAP_WINDOW_MS ? state.taps + 1 : 1;
  return { taps, lastTapAt: now };
}

export function isHiddenAdminGestureComplete(state: HiddenAdminGestureState): boolean {
  return state.taps >= HIDDEN_ADMIN_TAP_COUNT;
}
