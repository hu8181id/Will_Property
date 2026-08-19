import { describe, expect, it } from "vitest";

const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

describe("Meta WhatsApp credentials", () => {
  it.skip("authenticates against the configured WhatsApp phone number", async () => {
    expect(phoneNumberId, "WHATSAPP_PHONE_NUMBER_ID is required").toBeTruthy();
    expect(accessToken, "WHATSAPP_ACCESS_TOKEN is required").toBeTruthy();

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(phoneNumberId!)}?fields=id,display_phone_number,verified_name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const body = (await response.json()) as Record<string, unknown>;
    expect(
      response.ok,
      `Meta credential validation failed (${response.status}): ${JSON.stringify(body)}`,
    ).toBe(true);
    expect(body.id).toBe(phoneNumberId);
  }, 20_000);
});
