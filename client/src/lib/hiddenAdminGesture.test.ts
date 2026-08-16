import { describe, expect, it } from "vitest";
import {
  HIDDEN_ADMIN_TAP_COUNT,
  HIDDEN_ADMIN_TAP_WINDOW_MS,
  HIDDEN_ADMIN_ARM_WINDOW_MS,
  canStartHiddenAdminHold,
  initialHiddenAdminGestureState,
  registerHiddenAdminTap,
} from "./hiddenAdminGesture";

describe("hidden admin gesture", () => {
  it("arms after three taps inside the tap window", () => {
    let state = initialHiddenAdminGestureState;
    state = registerHiddenAdminTap(state, 1_000);
    state = registerHiddenAdminTap(state, 1_000 + HIDDEN_ADMIN_TAP_WINDOW_MS - 1);
    state = registerHiddenAdminTap(state, 1_000 + (HIDDEN_ADMIN_TAP_WINDOW_MS - 1) * 2);

    expect(state.taps).toBe(HIDDEN_ADMIN_TAP_COUNT);
    expect(canStartHiddenAdminHold(state, state.armedAt + 100)).toBe(true);
  });

  it("resets the sequence when taps are too far apart", () => {
    let state = registerHiddenAdminTap(initialHiddenAdminGestureState, 1_000);
    state = registerHiddenAdminTap(state, 1_000 + HIDDEN_ADMIN_TAP_WINDOW_MS + 1);

    expect(state.taps).toBe(1);
    expect(canStartHiddenAdminHold(state, state.lastTapAt)).toBe(false);
  });

  it("expires an armed hold after the arm window", () => {
    let state = initialHiddenAdminGestureState;
    state = registerHiddenAdminTap(state, 1_000);
    state = registerHiddenAdminTap(state, 1_100);
    state = registerHiddenAdminTap(state, 1_200);

    expect(canStartHiddenAdminHold(state, state.armedAt + HIDDEN_ADMIN_ARM_WINDOW_MS + 1)).toBe(false);
  });
});
