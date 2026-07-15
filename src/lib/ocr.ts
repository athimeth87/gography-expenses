import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Receipt OCR via Claude Haiku 4.5 (vision + forced tool call for a stable shape).
// Isolated here so the model/provider can be swapped without touching callers.

export type MediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export type ReceiptFields = {
  amount: number | null;
  currency: string;
  date: string | null;
  store: string | null;
  confidence: { amount: number; date: number; store: number };
};

const MODEL = "claude-haiku-4-5";

const SYSTEM =
  "You read a single expense receipt from an image and extract structured fields. " +
  "Receipts are mostly English, sometimes Thai. Report only what is actually printed. " +
  "For the amount use the final TOTAL paid (after tax/service), digits only. " +
  "If a field is not clearly legible, return an empty string for it and a low confidence. " +
  "Confidence is a number from 0 (guess) to 1 (certain).";

const PROMPT =
  "Extract the total amount paid, the currency (ISO 4217 code — use THB if no currency symbol is shown), " +
  "the receipt date (format YYYY-MM-DD), and the store/merchant name. " +
  "Call the record_receipt tool with the result.";

const TOOL: Anthropic.Tool = {
  name: "record_receipt",
  description: "Record the fields extracted from the expense receipt.",
  input_schema: {
    type: "object",
    properties: {
      amount: {
        type: "string",
        description: "Final total paid, digits only e.g. 1250.00. Empty string if not legible.",
      },
      currency: {
        type: "string",
        description: "ISO 4217 code e.g. THB, USD, JPY. Use THB if none shown.",
      },
      date: {
        type: "string",
        description: "Receipt date as YYYY-MM-DD. Empty string if not legible.",
      },
      store: {
        type: "string",
        description: "Store or merchant name. Empty string if not legible.",
      },
      amount_confidence: { type: "number", description: "0 to 1" },
      date_confidence: { type: "number", description: "0 to 1" },
      store_confidence: { type: "number", description: "0 to 1" },
    },
    required: [
      "amount",
      "currency",
      "date",
      "store",
      "amount_confidence",
      "date_confidence",
      "store_confidence",
    ],
    additionalProperties: false,
  },
};

export async function extractReceipt(
  base64: string,
  mediaType: MediaType
): Promise<ReceiptFields> {
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: SYSTEM,
    tools: [TOOL],
    tool_choice: { type: "tool", name: "record_receipt" },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  const input = (block && "input" in block ? block.input : {}) as Record<string, unknown>;

  return {
    amount: toAmount(input.amount),
    currency: toCurrency(input.currency),
    date: toDate(input.date),
    store: toStore(input.store),
    confidence: {
      amount: clamp01(input.amount_confidence),
      date: clamp01(input.date_confidence),
      store: clamp01(input.store_confidence),
    },
  };
}

function toAmount(v: unknown): number | null {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function toCurrency(v: unknown): string {
  const s = String(v ?? "").trim().toUpperCase().slice(0, 3);
  return /^[A-Z]{3}$/.test(s) ? s : "THB";
}
function toDate(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
function toStore(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, 120) : null;
}
function clamp01(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
