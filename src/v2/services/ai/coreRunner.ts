export type CoreRunResult = {
    coreName: string;
    status: "ready" | "skipped";
    summary: string;
  };
  
  export type CoreRunnerInput = {
    requiredCores: string[];
  };
  
  export type CoreRunnerResult = {
    executedCores: CoreRunResult[];
  };
  
  export function runRequiredCores(input: CoreRunnerInput): CoreRunnerResult {
    const executedCores: CoreRunResult[] = input.requiredCores.map((coreName) => {
      return {
        coreName,
        status: "ready",
        summary: `${coreName} Core 판단을 상담 답변에 사용할 준비가 되었습니다.`,
      };
    });
  
    return {
      executedCores,
    };
  }