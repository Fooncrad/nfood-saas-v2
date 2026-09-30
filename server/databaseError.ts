type DatabaseErrorLike = {
  code?: unknown;
  errno?: unknown;
  cause?: unknown;
};

export function isMissingDatabaseTableError(error: unknown) {
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current && typeof current === "object"; depth += 1) {
    const candidate = current as DatabaseErrorLike;
    if (candidate.code === "ER_NO_SUCH_TABLE" || candidate.errno === 1146) return true;
    current = candidate.cause;
  }
  return false;
}
