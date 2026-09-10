import { formatTaka } from "./formatters";

export interface WhatsAppMessageParams {
  customerName: string;
  phone?: string;
  currentDue: number;
  businessName: string;
}

export function formatWhatsAppUrl(params: WhatsAppMessageParams): { url: string; hasPhone: boolean; messageText: string } {
  const { customerName, phone, currentDue, businessName } = params;

  // Clean phone number: remove non-digits
  let cleanPhone = (phone || "").replace(/[^0-9]/g, "");

  // If phone begins with 01 (standard Bangladesh 11-digit mobile), prepend 88
  if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
    cleanPhone = `88${cleanPhone}`;
  }

  const dueFormatted = formatTaka(currentDue);

  const messageText = `আসসালামু আলাইকুম ${customerName} ভাই,
${businessName} থেকে জানানো যাচ্ছে যে, আপনার পূর্বের চালানের বর্তমান বকেয়া বাকি রয়েছে ${dueFormatted}।
সুবিধাজনক সময়ে বকেয়া টাকা পরিশোধ করার বিনীত অনুরোধ জানাচ্ছি।
ধন্যবাদ।`;

  const encodedText = encodeURIComponent(messageText);

  if (cleanPhone) {
    return {
      url: `https://wa.me/${cleanPhone}?text=${encodedText}`,
      hasPhone: true,
      messageText,
    };
  }

  return {
    url: `https://wa.me/?text=${encodedText}`,
    hasPhone: false,
    messageText,
  };
}

/**
 * Sends a WhatsApp reminder to a customer with outstanding balance using window.open
 */
export function sendWhatsAppDueReminder(params: WhatsAppMessageParams): boolean {
  const { url } = formatWhatsAppUrl(params);
  window.open(url, "_blank");
  return true;
}
