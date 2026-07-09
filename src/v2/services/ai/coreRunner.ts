import type { BasicSajuResult } from "../../types/basic";
import type { IntentAnalysisResult } from "./intentAnalyzer";
import { analyzeBusiness } from "../judgement/businessJudgement";
import { analyzeMoney } from "../judgement/moneyJudgement";
import { analyzeLove } from "../judgement/loveJudgement";
import { analyzeMarriage } from "../judgement/marriageJudgement";
import { buildSajuProfile } from "../profile/sajuProfile";
import { buildLifeTimeline } from "../profile/lifeTimeline";

export type CoreRunStatus = "executed" | "skipped";

export type CoreRunResult = {
  coreName: string;
  status: CoreRunStatus;
  summary: string;
  result?: unknown;
};

export type CoreRunnerInput = {
  basic: BasicSajuResult;
  intentAnalysis: IntentAnalysisResult;
};

export type CoreRunnerResult = {
  executedCores: CoreRunResult[];
};

export function runRequiredCores(input: CoreRunnerInput): CoreRunnerResult {
  const { basic, intentAnalysis } = input;
  const { requiredCores } = intentAnalysis;

  const executedCores: CoreRunResult[] = requiredCores.map((coreName) => {
    switch (coreName) {
      case "business": {
        const result = analyzeBusiness(basic);

        return {
          coreName,
          status: "executed",
          summary: "사업 판단 Core 실행 완료",
          result,
        };
      }

      case "money": {
        const result = analyzeMoney(basic);

        return {
          coreName,
          status: "executed",
          summary: "재물 판단 Core 실행 완료",
          result,
        };
      }

      case "love": {
        const result = analyzeLove(basic);

        return {
          coreName,
          status: "executed",
          summary: "연애 판단 Core 실행 완료",
          result,
        };
      }

      case "marriage": {
        const result = analyzeMarriage(basic);

        return {
          coreName,
          status: "executed",
          summary: "결혼 판단 Core 실행 완료",
          result,
        };
      }

      case "lifeTimeline": {
        const profile = buildSajuProfile(basic);
        const result = buildLifeTimeline(profile);

        return {
          coreName,
          status: "executed",
          summary: "인생 흐름 Core 실행 완료",
          result,
        };
      }

      default:
        return {
          coreName,
          status: "skipped",
          summary: "아직 연결되지 않은 Core입니다.",
        };
    }
  });

  return {
    executedCores,
  };
}