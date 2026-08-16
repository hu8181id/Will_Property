import { describe, expect, it } from "vitest";
import {
  HIDDEN_ADMIN_TAP_COUNT,
  HIDDEN_ADMIN_TAP_WINDOW_MS,
  initialHiddenAdminGestureState,
  isHiddenAdminGestureComplete,
  registerHiddenAdminTap,
} from "./hiddenAdminGesture";

describe("hidden admin gesture", () => {
  it("completes after three taps inside the tap window", () => {
    let state = initialHiddenAdminGestureState;
    state = registerHiddenAdminTap(state, 1_000);
    state = registerHiddenAdminTap(state, 1_000 + HIDDEN_ADMIN_TAP_WINDOW_MS - 1);
    state = registerHiddenAdminTap(state, 1_000 + (HIDDEN_ADMIN_TAP_WINDOW_MS - 1) * 2);

    expect(state.taps).toBe(HIDDEN_ADMIN_TAP_COUNT);
    expect(isHiddenAdminGestureComplete(state)).toBe(true);
  });

  it("resets the sequence when taps are too far apart", () => {
    let state = registerHiddenAdminTap(initialHiddenAdminGestureState, 1_000);
    state = registerHiddenAdminTap(state, 1_000 + HIDDEN_ADMIN_TAP_WINDOW_MS + 1);

    expect(state.taps).toBe(1);
    expect(isHiddenAdminGestureComplete(state)).toBe(false);
  });

  it("does not complete after one or two taps", () => {
    let state = registerHiddenAdminTap(initialHiddenAdminGestureState, 1_000);
    expect(isHiddenAdminGestureComplete(state)).toBe(false);

    state = registerHiddenAdminTap(state, 1_100);
    expect(isHiddenAdminGestureComplete(state)).toBe(false);
  });
});
