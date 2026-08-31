/**
 * vNext Response Stream 유틸.
 */

import type {
  ResponseStreamEvent,
} from "./responseStreamingTypes.js";

export function splitTextIntoStreamChunks(
  text: string,
  chunkSize: number = 12,
): string[] {
  const normalized = text.trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];

  for (let index = 0; index < normalized.length; index += chunkSize) {
    chunks.push(normalized.slice(index, index + chunkSize));
  }

  return chunks;
}

export function appendStreamDelta(
  previousText: string,
  delta: string,
): string {
  return previousText + delta;
}

export function isStreamingDeltaSafe(
  delta: string,
): boolean {
  if (!delta) {
    return true;
  }

  if (delta.includes("\u0000")) {
    return false;
  }

  return true;
}

export function parseSseDataLines(
  buffer: string,
): {
  events: ResponseStreamEvent[];
  remainder: string;
} {
  const events: ResponseStreamEvent[] = [];
  const lines = buffer.split("\n");
  const remainder = lines.pop() ?? "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed.startsWith("data:")) {
      continue;
    }

    const payload = trimmed.slice(5).trim();

    if (!payload || payload === "[DONE]") {
      continue;
    }

    events.push(JSON.parse(payload) as ResponseStreamEvent);
  }

  return {
    events,
    remainder,
  };
}

export async function consumeFetchResponseStream(
  response: Response,
  onEvent: (event: ResponseStreamEvent) => void,
): Promise<void> {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Response body is not readable.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const parsed = parseSseDataLines(buffer);
    buffer = parsed.remainder;

    for (const event of parsed.events) {
      onEvent(event);
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseDataLines(`${buffer}\n`);

    for (const event of parsed.events) {
      onEvent(event);
    }
  }
}

export function formatSseEvent(
  event: ResponseStreamEvent,
): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
