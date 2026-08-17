export type SendWhatsAppNotificationParams = {
  propertyTitle: string;
  propertyId: number;
  visitorId?: string | null;
  path?: string | null;
};

export type SendWhatsAppNotificationResult = {
  deliveryStatus: "sent" | "failed" | "skipped";
  whatsappMessageId?: string;
  deliveryError?: string;
};

export async function sendWhatsAppAgentNotification(
  params: SendWhatsAppNotificationParams,
): Promise<SendWhatsAppNotificationResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const agentPhone = process.env.AGENT_WHATSAPP_PHONE;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "hello_world";

  if (!phoneNumberId || !accessToken || !agentPhone) {
    return {
      deliveryStatus: "skipped",
      deliveryError: "Meta WhatsApp credentials not fully configured",
    };
  }

  let cleanPhone = agentPhone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }

  const url = `https://graph.facebook.com/v23.0/${encodeURIComponent(phoneNumberId)}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "id",
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as any;

    if (!response.ok) {
      const errorMsg = body?.error?.message || JSON.stringify(body);
      console.warn("[Meta WhatsApp API] Gagal mengirim pesan:", errorMsg);
      return {
        deliveryStatus: "failed",
        deliveryError: errorMsg,
      };
    }

    const messageId = body?.messages?.[0]?.id;
    return {
      deliveryStatus: "sent",
      whatsappMessageId: messageId || undefined,
    };
  } catch (error: any) {
    console.error("[Meta WhatsApp API] Exception saat mengirim notifikasi:", error);
    return {
      deliveryStatus: "failed",
      deliveryError: error?.message || String(error),
    };
  }
}
