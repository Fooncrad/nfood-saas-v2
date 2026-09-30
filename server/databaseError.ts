type DatabaseErrorLike = {
  code?: unknown;
  errno?: unknown;
  cause?: unknown;
};

function databaseErrorChain(error: unknown) {
  const chain: DatabaseErrorLike[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current && typeof current === "object"; depth += 1) {
    const candidate = current as DatabaseErrorLike;
    chain.push(candidate);
    current = candidate.cause;
  }
  return chain;
}

export function databaseErrorCode(error: unknown) {
  for (const candidate of databaseErrorChain(error)) {
    if (typeof candidate.code === "string" && candidate.code) return candidate.code;
    if (typeof candidate.errno === "number") return String(candidate.errno);
  }
  return "UNKNOWN";
}

export function isMissingDatabaseTableError(error: unknown) {
  return databaseErrorChain(error).some((candidate) => candidate.code === "ER_NO_SUCH_TABLE" || candidate.errno === 1146);
}
