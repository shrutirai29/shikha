/**
 * Escapes characters with special meaning in regular expressions
 * to prevent ReDoS (Regular Expression Denial of Service)
 * and regex syntax injection in MongoDB queries.
 */
export const escapeRegex = (value: string): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
