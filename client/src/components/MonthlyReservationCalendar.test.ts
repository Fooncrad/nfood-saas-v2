import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("monthly reservation calendar date system", () => {
  it("pins every supported locale to the Gregorian calendar", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/MonthlyReservationCalendar.tsx"), "utf8");
    expect(source).toContain("ar-SA-u-ca-gregory-nu-latn");
    expect(source).toContain("en-US-u-ca-gregory-nu-latn");
    expect(source).toContain("fr-FR-u-ca-gregory-nu-latn");
    expect(source).toContain("ur-PK-u-ca-gregory-nu-latn");
  });
});
