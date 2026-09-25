/**
 * STEP 21-19 — Report / Consulting product surface endpoint separation.
 *
 * Report: auth only (no subscription entitlement)
 * Consulting: auth + assertVNextConsultingEntitled (unchanged)
 * answerMode is Prompt metadata only — never used for server entitlement.
 */

import {
  readFileSync,
} from "node:fs";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  handleVNextConsultingGenerateRequest,
} from "../../../../api/v3/vnext/consulting-generate.js";
import {
  handleVNextConsultingStreamRequest,
} from "../../../../api/v3/vnext/consulting-stream.js";
import {
  handleVNextReportGenerateRequest,
} from "../../../../api/v3/vnext/report-generate.js";
import {
  handleVNextReportStreamRequest,
} from "../../../../api/v3/vnext/report-stream.js";
import {
  verifyAssertVNextConsultingEntitled,
} from "../gpt/assertVNextConsultingEntitledVerification.js";
import {
  createRemoteResponseGateway,
  VNEXT_CONSULTING_GENERATE_ENDPOINT,
  VNEXT_CONSULTING_STREAM_ENDPOINT,
  VNEXT_REPORT_GENERATE_ENDPOINT,
  VNEXT_REPORT_STREAM_ENDPOINT,
} from "../ui/vNextRemoteResponseGateway.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";

export type VNextStep21_19ProductSurfaceCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type VNextStep21_19ProductSurfaceVerificationResult = {
  passed: boolean;
  cases: VNextStep21_19ProductSurfaceCase[];
};

function readSource(
  relativePath: string,
): string {
  const here = dirname(fileURLToPath(import.meta.url));

  return readFileSync(
    resolve(here, relativePath),
    "utf8",
  );
}

function buildPrompt(
  answerMode: "report" | "question",
): ResponsePrompt {
  return {
    systemInstruction: "Engine judges, GPT explains.",
    userPrompt: "전체 사주 리포트를 작성해 주세요.",
    metadata: {
      answerMode,
      scenario: "generalFlow",
      budget: "standard",
      selectedBlockIds: ["overview"],
      estimatedSize: 2000,
      conversationStyle: answerMode === "report"
        ? "analyticalReport"
        : "consulting",
    },
  };
}

type MockResponseCapture = {
  statusCode: number | null;
  jsonBody: unknown;
  headers: Record<string, string>;
  ended: boolean;
};

function createMockVercelResponse(): {
  response: VercelResponse;
  capture: MockResponseCapture;
} {
  const capture: MockResponseCapture = {
    statusCode: null,
    jsonBody: null,
    headers: {},
    ended: false,
  };

  const response = {
    setHeader(
      name: string,
      value: string,
    ) {
      capture.headers[name] = value;
      return response;
    },
    status(
      code: number,
    ) {
      capture.statusCode = code;
      return response;
    },
    json(
      body: unknown,
    ) {
      capture.jsonBody = body;
      return response;
    },
    write() {
      return true;
    },
    end() {
      capture.ended = true;
      return response;
    },
  } as unknown as VercelResponse;

  return {
    response,
    capture,
  };
}

function createMockVercelRequest(
  overrides: {
    method?: string;
    authorization?: string;
    body?: unknown;
  } = {},
): VercelRequest {
  return {
    method: overrides.method ?? "POST",
    headers: {
      authorization: overrides.authorization,
    },
    body: overrides.body,
  } as unknown as VercelRequest;
}

async function runCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }> | {
    passed: boolean;
    details: string[];
  },
): Promise<VNextStep21_19ProductSurfaceCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
  };
}

export async function verifyVNextStep21_19ReportConsultingProductSurface():
  Promise<VNextStep21_19ProductSurfaceVerificationResult>
{
  const reportGenerateSource = readSource(
    "../../../../api/v3/vnext/report-generate.ts",
  );
  const reportStreamSource = readSource(
    "../../../../api/v3/vnext/report-stream.ts",
  );
  const consultingGenerateSource = readSource(
    "../../../../api/v3/vnext/consulting-generate.ts",
  );
  const consultingStreamSource = readSource(
    "../../../../api/v3/vnext/consulting-stream.ts",
  );
  const reportAdapterSource = readSource(
    "../report/vNextReportUIAdapter.ts",
  );
  const consultingAdapterSource = readSource(
    "../ui/vNextConsultingUIAdapter.ts",
  );
  const reportControllerSource = readSource(
    "../report/vNextReportController.ts",
  );

  const entitlementRegression =
    await verifyAssertVNextConsultingEntitled();

  const cases: VNextStep21_19ProductSurfaceCase[] = [
    await runCase("report-generate-unauthenticated-401", async () => {
      const {
        response,
        capture,
      } = createMockVercelResponse();

      await handleVNextReportGenerateRequest(
        createMockVercelRequest({
          body: {
            prompt: buildPrompt("report"),
          },
        }),
        response,
      );

      return {
        passed: capture.statusCode === 401
          && (capture.jsonBody as { error?: string } | null)?.error
            === "authenticationRequired",
        details: [
          `status=${capture.statusCode}`,
          `body=${JSON.stringify(capture.jsonBody)}`,
        ],
      };
    }),

    await runCase("report-stream-unauthenticated-401", async () => {
      const {
        response,
        capture,
      } = createMockVercelResponse();

      await handleVNextReportStreamRequest(
        createMockVercelRequest({
          body: {
            prompt: buildPrompt("report"),
          },
        }),
        response,
      );

      return {
        passed: capture.statusCode === 401
          && (capture.jsonBody as { error?: string } | null)?.error
            === "authenticationRequired",
        details: [
          `status=${capture.statusCode}`,
          `body=${JSON.stringify(capture.jsonBody)}`,
        ],
      };
    }),

    await runCase("consulting-generate-unauthenticated-401", async () => {
      const {
        response,
        capture,
      } = createMockVercelResponse();

      await handleVNextConsultingGenerateRequest(
        createMockVercelRequest({
          body: {
            prompt: buildPrompt("question"),
          },
        }),
        response,
      );

      return {
        passed: capture.statusCode === 401
          && (capture.jsonBody as { error?: string } | null)?.error
            === "authenticationRequired",
        details: [
          `status=${capture.statusCode}`,
          `body=${JSON.stringify(capture.jsonBody)}`,
        ],
      };
    }),

    await runCase("consulting-stream-unauthenticated-401", async () => {
      const {
        response,
        capture,
      } = createMockVercelResponse();

      await handleVNextConsultingStreamRequest(
        createMockVercelRequest({
          body: {
            prompt: buildPrompt("question"),
          },
        }),
        response,
      );

      return {
        passed: capture.statusCode === 401
          && (capture.jsonBody as { error?: string } | null)?.error
            === "authenticationRequired",
        details: [
          `status=${capture.statusCode}`,
          `body=${JSON.stringify(capture.jsonBody)}`,
        ],
      };
    }),

    await runCase("report-endpoints-auth-only-no-entitlement", () => {
      const generateHasAuth = reportGenerateSource.includes(
        "assertVNextConsultingAuthenticated(",
      );
      const streamHasAuth = reportStreamSource.includes(
        "assertVNextConsultingAuthenticated(",
      );
      const generateHasEntitlement = reportGenerateSource.includes(
        "assertVNextConsultingEntitled(",
      );
      const streamHasEntitlement = reportStreamSource.includes(
        "assertVNextConsultingEntitled(",
      );
      const generateImportsEntitlement =
        /from\s+["'][^"']*assertVNextConsultingEntitled/.test(
          reportGenerateSource,
        );
      const streamImportsEntitlement =
        /from\s+["'][^"']*assertVNextConsultingEntitled/.test(
          reportStreamSource,
        );

      return {
        passed: generateHasAuth
          && streamHasAuth
          && !generateHasEntitlement
          && !streamHasEntitlement
          && !generateImportsEntitlement
          && !streamImportsEntitlement,
        details: [
          `generateAuth=${generateHasAuth}`,
          `streamAuth=${streamHasAuth}`,
          `generateEntitlement=${generateHasEntitlement}`,
          `streamEntitlement=${streamHasEntitlement}`,
          `generateImport=${generateImportsEntitlement}`,
          `streamImport=${streamImportsEntitlement}`,
        ],
      };
    }),

    await runCase("report-authenticated-reaches-gateway-without-entitlement", () => {
      const authIndex = reportGenerateSource.indexOf(
        "assertVNextConsultingAuthenticated(",
      );
      const gatewayIndex = reportGenerateSource.indexOf(
        "gateway.generate(",
      );
      const streamAuthIndex = reportStreamSource.indexOf(
        "assertVNextConsultingAuthenticated(",
      );
      const streamGatewayIndex = reportStreamSource.indexOf(
        "gateway.generateStream(",
      );

      return {
        passed: authIndex >= 0
          && gatewayIndex > authIndex
          && streamAuthIndex >= 0
          && streamGatewayIndex > streamAuthIndex
          && !reportGenerateSource.includes(
            "assertVNextConsultingEntitled(",
          )
          && !reportStreamSource.includes(
            "assertVNextConsultingEntitled(",
          ),
        details: [
          `generateAuth→gateway=${authIndex}->${gatewayIndex}`,
          `streamAuth→gateway=${streamAuthIndex}->${streamGatewayIndex}`,
        ],
      };
    }),

    await runCase("consulting-endpoints-keep-entitlement-after-auth", () => {
      const generateAuth = consultingGenerateSource.indexOf(
        "assertVNextConsultingAuthenticated(",
      );
      const generateEntitlement = consultingGenerateSource.indexOf(
        "assertVNextConsultingEntitled(",
      );
      const streamAuth = consultingStreamSource.indexOf(
        "assertVNextConsultingAuthenticated(",
      );
      const streamEntitlement = consultingStreamSource.indexOf(
        "assertVNextConsultingEntitled(",
      );

      return {
        passed: generateAuth >= 0
          && generateEntitlement > generateAuth
          && streamAuth >= 0
          && streamEntitlement > streamAuth
          && !consultingGenerateSource.includes(
            "evaluateFreeUsage",
          )
          && !consultingStreamSource.includes(
            "evaluateFreeUsage",
          ),
        details: [
          `generateAuth→entitlement=${generateAuth}->${generateEntitlement}`,
          `streamAuth→entitlement=${streamAuth}->${streamEntitlement}`,
        ],
      };
    }),

    await runCase("consulting-entitlement-helper-regression", () => {
      return {
        passed: entitlementRegression.passed
          && entitlementRegression.checks.rowMissingDenied403 === true
          && entitlementRegression.checks.unauthorizedStill401 === true,
        details: [
          `entitlementPassed=${entitlementRegression.passed}`,
          `rowMissing=${entitlementRegression.checks.rowMissingDenied403}`,
          `unauth=${entitlementRegression.checks.unauthorizedStill401}`,
        ],
      };
    }),

    await runCase("gateway-report-uses-report-endpoints", async () => {
      const calls: string[] = [];
      const gateway = createRemoteResponseGateway({
        endpoint: VNEXT_REPORT_GENERATE_ENDPOINT,
        streamEndpoint: VNEXT_REPORT_STREAM_ENDPOINT,
        fetchImpl: async (input) => {
          calls.push(String(input));

          return new Response(
            JSON.stringify({
              text: "report remote",
              status: "success",
              latencyMs: 1,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        },
      });

      await gateway.generate(buildPrompt("report"));

      return {
        passed: VNEXT_REPORT_GENERATE_ENDPOINT
            === "/api/v3/vnext/report-generate"
          && VNEXT_REPORT_STREAM_ENDPOINT
            === "/api/v3/vnext/report-stream"
          && calls.length === 1
          && calls[0] === VNEXT_REPORT_GENERATE_ENDPOINT,
        details: [
          `generateConst=${VNEXT_REPORT_GENERATE_ENDPOINT}`,
          `streamConst=${VNEXT_REPORT_STREAM_ENDPOINT}`,
          `called=${calls[0] ?? "none"}`,
        ],
      };
    }),

    await runCase("gateway-consulting-default-unchanged", async () => {
      const calls: string[] = [];
      const gateway = createRemoteResponseGateway({
        fetchImpl: async (input) => {
          calls.push(String(input));

          return new Response(
            JSON.stringify({
              text: "consulting remote",
              status: "success",
              latencyMs: 1,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        },
      });

      await gateway.generate(buildPrompt("question"));

      return {
        passed: VNEXT_CONSULTING_GENERATE_ENDPOINT
            === "/api/v3/vnext/consulting-generate"
          && VNEXT_CONSULTING_STREAM_ENDPOINT
            === "/api/v3/vnext/consulting-stream"
          && calls.length === 1
          && calls[0] === VNEXT_CONSULTING_GENERATE_ENDPOINT,
        details: [
          `generateConst=${VNEXT_CONSULTING_GENERATE_ENDPOINT}`,
          `streamConst=${VNEXT_CONSULTING_STREAM_ENDPOINT}`,
          `called=${calls[0] ?? "none"}`,
        ],
      };
    }),

    await runCase("adapter-wiring-product-boundary", () => {
      const reportUsesReportGenerate = reportAdapterSource.includes(
        "VNEXT_REPORT_GENERATE_ENDPOINT",
      );
      const reportUsesReportStream = reportAdapterSource.includes(
        "VNEXT_REPORT_STREAM_ENDPOINT",
      );
      const reportDoesNotUseConsulting =
        !reportAdapterSource.includes(
          "VNEXT_CONSULTING_GENERATE_ENDPOINT",
        )
        && !reportAdapterSource.includes(
          "consulting-generate",
        );
      const consultingUsesDefaults =
        consultingAdapterSource.includes(
          "createRemoteResponseGateway",
        )
        && !consultingAdapterSource.includes(
          "VNEXT_REPORT_",
        )
        && !consultingAdapterSource.includes(
          "report-generate",
        )
        && !consultingAdapterSource.includes(
          "endpoint:",
        );

      return {
        passed: reportUsesReportGenerate
          && reportUsesReportStream
          && reportDoesNotUseConsulting
          && consultingUsesDefaults,
        details: [
          `reportGenerate=${reportUsesReportGenerate}`,
          `reportStream=${reportUsesReportStream}`,
          `reportNoConsulting=${reportDoesNotUseConsulting}`,
          `consultingDefaults=${consultingUsesDefaults}`,
        ],
      };
    }),

    await runCase("report-ux-answerMode-and-pipeline-unchanged", () => {
      const keepsAnswerModeReport =
        reportControllerSource.includes(
          'answerMode: "report"',
        );
      const keepsStartReport =
        reportControllerSource.includes(
          "async startReport",
        );
      const noDocxInReportEndpoints =
        !reportGenerateSource.toLowerCase().includes("docx")
        && !reportStreamSource.toLowerCase().includes("docx");
      const noAnswerModeEntitlementInConsulting =
        !/answerMode[\s\S]{0,80}(subscription|entitled|entitlement)/i
          .test(consultingGenerateSource)
        && !/answerMode[\s\S]{0,80}(subscription|entitled|entitlement)/i
          .test(consultingStreamSource);

      return {
        passed: keepsAnswerModeReport
          && keepsStartReport
          && noDocxInReportEndpoints
          && noAnswerModeEntitlementInConsulting,
        details: [
          `answerModeReport=${keepsAnswerModeReport}`,
          `startReport=${keepsStartReport}`,
          `noDocx=${noDocxInReportEndpoints}`,
          `consultingNoAnswerModeGate=${noAnswerModeEntitlementInConsulting}`,
        ],
      };
    }),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep21_19ProductSurfaceResult(
  result: VNextStep21_19ProductSurfaceVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
