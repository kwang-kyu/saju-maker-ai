/**
 * Lightweight vNext mode detection.
 *
 * Kept free of consulting/controller/gateway imports so entry can
 * resolve #v3?vnext=1 without pulling the heavy UI adapter graph.
 */

export function isVNextModeEnabled(
  location: Pick<Location, "hash" | "search"> = globalThis.location,
): boolean {
  const hashQuery = location.hash.includes("?")
    ? location.hash.split("?")[1]
    : "";

  const params = new URLSearchParams(
    hashQuery || location.search.replace(/^\?/, ""),
  );

  return params.get("vnext") === "1";
}
