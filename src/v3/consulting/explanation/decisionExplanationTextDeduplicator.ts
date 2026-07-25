function normalizeExplanationText(
    value: string,
): string {
    return value
        .trim()
        .replace(/\s+/g, " ");
}

/**
 * Explanation에 들어갈 문장을 입력 순서대로 보존하면서
 * 빈 문장과 공백 차이만 있는 동일 문장을 제거한다.
 *
 * 의미가 비슷하다는 이유로 문장을 제거하지 않으며,
 * Builder가 확정한 문장의 역할과 내용을 변경하지 않는다.
 */
export function deduplicateExplanationLines(
    lines: readonly string[],
    excludedLines: readonly string[] = [],
): string[] {
    const usedTexts =
        new Set(
            excludedLines
                .map(normalizeExplanationText)
                .filter(Boolean),
        );

    const uniqueLines: string[] = [];

    for (const line of lines) {
        const normalized =
            normalizeExplanationText(
                line,
            );

        if (
            normalized.length === 0
            || usedTexts.has(normalized)
        ) {
            continue;
        }

        usedTexts.add(normalized);
        uniqueLines.push(line.trim());
    }

    return uniqueLines;
}