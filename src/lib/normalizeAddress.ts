/**
 * Normalizes a property address to a canonical form for consistent hashing.
 * Two differently-typed addresses for the same property should produce
 * the same normalized string (and thus the same on-chain hash).
 */
export function normalizeAddress(address: string): string {
  return (
    address
      .toLowerCase()
      // Expand common abbreviations to canonical forms
      .replace(/\bstreet\b/g, 'st')
      .replace(/\bstr\b/g, 'st')
      .replace(/\broad\b/g, 'rd')
      .replace(/\bavenue\b/g, 'ave')
      .replace(/\bboulevard\b/g, 'blvd')
      .replace(/\bdrive\b/g, 'dr')
      .replace(/\blane\b/g, 'ln')
      .replace(/\bcourt\b/g, 'ct')
      .replace(/\bcircle\b/g, 'cir')
      .replace(/\bplace\b/g, 'pl')
      .replace(/\bway\b/g, 'wy')
      .replace(/\bterrace\b/g, 'ter')
      // Normalize directionals
      .replace(/\bnorth\b/g, 'n')
      .replace(/\bsouth\b/g, 's')
      .replace(/\beast\b/g, 'e')
      .replace(/\bwest\b/g, 'w')
      // Normalize state
      .replace(/\bcolorado\b/g, 'co')
      // Remove unit/apt/suite suffixes (normalize to base address)
      .replace(/\b(apt|apartment|unit|suite|ste|#)\s*\S*/g, '')
      // Remove punctuation
      .replace(/[,.\-#]/g, '')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}
