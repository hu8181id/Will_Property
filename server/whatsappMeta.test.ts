import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { sendWhatsAppAgentNotification } from "./whatsappMeta";

describe("Meta WhatsApp Cloud API Notification", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("skips notification when credentials are missing", async () => {
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_ACCESS_TOKEN;

    const result = await sendWhatsAppAgentNotification({
      propertyId: 1,
      propertyTitle: "Rumah Mewah",
    });

    expect(result.deliveryStatus).toBe("skipped");
    expect(result.deliveryError).toBeDefined();
  });

  it("successfully sends WhatsApp notification when credentials are valid", async () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_ACCESS_TOKEN = "mock_token";
    process.env.AGENT_WHATSAPP_PHONE = "08123456789";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [{ id: "wamid.HBgL12345" }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendWhatsAppAgentNotification({
      propertyId: 450001,
      propertyTitle: "Rumah Pondok Indah",
      visitorId: "visitor_abc",
      path: "/property/1",
    });

    expect(result.deliveryStatus).toBe("sent");
    expect(result.whatsappMessageId).toBe("wamid.HBgL12345");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("123456789/messages");

    const options = fetchMock.mock.calls[0][1];
    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.to).toBe("628123456789");
    expect(parsedBody.template.name).toBe("hello_world");
  });

  it("handles Meta API error response gracefully", async () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_ACCESS_TOKEN = "mock_token";
    process.env.AGENT_WHATSAPP_PHONE = "628123456789";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: "Invalid access token" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendWhatsAppAgentNotification({
      propertyId: 450001,
      propertyTitle: "Rumah Pondok Indah",
    });

    expect(result.deliveryStatus).toBe("failed");
    expect(result.deliveryError).toContain("Invalid access token");
  });
});
