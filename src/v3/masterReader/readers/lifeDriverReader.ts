import type {
    DriverConfidence,
    DriverEvidence,
    LifeDriverJudgement,
    LifeDriverResult,
  } from "../types/lifeDriver";
  import type {
    LifeDriverEvidenceSource,
    LifeDriverReaderInput,
  } from "../types/lifeDriverInput";
  import {
    scoreLifeDrivers,
    type LifeDriverScore,
  } from "./lifeDriverScorer";
  import {
    selectLifeDrivers,
    type LifeDriverSelectionStatus,
  } from "./lifeDriverSelector";
  
  function mapEvidenceSource(
    source: LifeDriverEvidenceSource,
  ): DriverEvidence["source"] {
    switch (source) {
      case "monthCommand":
        return "monthCommand";
  
      case "dayMasterStrength":
        return "strength";
  
      case "structure":
        return "structure";
  
      case "tenGodStrength":
        return "tenGod";
  
      case "fiveElementFlow":
        return "fiveElementFlow";
  
      case "rooting":
        return "rooting";
  
      case "usefulGod":
        return "usefulGod";
  
      case "interaction":
        return "interaction";
    }
  }
  
  function getConfidence(
    status: LifeDriverSelectionStatus,
    score: LifeDriverScore,
  ): DriverConfidence {
    const independentSources = new Set(
      score.matches.map(
        (match) => match.meaning.source,
      ),
    ).size;
  
    if (
      status === "clear" &&
      independentSources >= 3 &&
      score.score >= 8
    ) {
      return "high";
    }
  
    if (
      independentSources >= 2 &&
      score.score >= 4
    ) {
      return "medium";
    }
  
    return "low";
  }

  function selectStrongestInterpretation(
    score: LifeDriverScore,
  ) {
    const interpretedMatches =
      score.matches
        .filter(
          (match) =>
            match.rule.interpretation !==
            undefined,
        )
        .sort(
          (a, b) =>
            b.rule.weight -
            a.rule.weight,
        );
  
    return (
      interpretedMatches[0]?.rule
        .interpretation ?? null
    );
  }
  
  function buildJudgement(
    score: LifeDriverScore,
    status: LifeDriverSelectionStatus,
  ): LifeDriverJudgement {
    const evidence: DriverEvidence[] =
      score.matches.map((match) => ({
        source: mapEvidenceSource(
          match.meaning.source,
        ),
        description: match.rule.reason,
        weight: match.rule.weight,
      }));
  
      return {
        driver: score.driver,
        interpretation:
  selectStrongestInterpretation(
    score,
  ),
        evidence,
        counterEvidence: [],
        confidence: getConfidence(
          status,
          score,
        ),
        exceptionConditions: [],
      };
  }
  
  export function readLifeDriver(
    input: LifeDriverReaderInput,
  ): LifeDriverResult | null {
    const scores = scoreLifeDrivers(
      input.meanings,
    );
  
    const selection =
      selectLifeDrivers(scores);
  
    if (!selection.primary) {
      return null;
    }
  
    return {
      primary: buildJudgement(
        selection.primary,
        selection.status,
      ),
  
      secondary: selection.secondary
        ? buildJudgement(
            selection.secondary,
            selection.status,
          )
        : null,
  
      suppressed: [],
      conflicting: [],
    };
  }