/**
 * Multi-turn Live Answer Semantic Gate — 수동 실행 entry.
 *
 * 기본 회귀·build에서 실행하지 않는다.
 * 4 probes를 순차 실행하며 retry/parallel 없다.
 *
 * OPENAI_API_KEY가 없으면 실행하지 않고 명확한 오류를 출력한다.
 * `.env.local` 값은 키 자체를 출력하지 않고 process.env에만 주입한다.
 *
 * 실행 예:
 *   npx.cmd tsx src/v3/vnext/verification/vNextLiveMultiTurnAnswerSemanticGateVerificationExecution.ts
 */

import fs from "node:fs";
import path from "node:path";

import {
  serializeVNextLiveMultiTurnAnswerSemanticGateResult,
  verifyVNextLiveMultiTurnAnswerSemanticGate,
} from "./vNextLiveMultiTurnAnswerSemanticGateVerification.js";

/**
 * `.env.local` 의 `KEY="value"` / `KEY='value'` 형태에서
 * 감싸는 따옴표만 제거한다. 키 내용은 출력하지 않는다.
 */
function unquoteEnvValue(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function injectOpenAiKeyFromEnvLocal(): void {
  const existing = process.env.OPENAI_API_KEY?.trim();

  if (existing) {
    process.env.OPENAI_API_KEY = unquoteEnvValue(existing);
    return;
  }

  const envPaths = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".vercel", ".env.development.local"),
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const envText = fs.readFileSync(envPath, "utf-8");
    const line = envText
      .split("\n")
      .find((item) => item.trimStart().startsWith("OPENAI_API_KEY="));

    if (!line) {
      continue;
    }

    const value = unquoteEnvValue(
      line.replace(/^\s*OPENAI_API_KEY=/, ""),
    );

    if (value.length > 0) {
      process.env.OPENAI_API_KEY = value;
      return;
    }
  }
}

async function executeVerification(): Promise<void> {
  try {
    injectOpenAiKeyFromEnvLocal();

    const result = await verifyVNextLiveMultiTurnAnswerSemanticGate();

    console.log(
      serializeVNextLiveMultiTurnAnswerSemanticGateResult(result),
    );

    if (!result.passed) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : String(error);

    console.error(message);
    process.exitCode = 1;
  }
}

void executeVerification();
