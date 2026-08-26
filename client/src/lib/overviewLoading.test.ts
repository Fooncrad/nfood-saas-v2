import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Overview loading experience", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");

  it("uses reusable Skeleton components for summary metrics and panels", () => {
    expect(source).toContain("function OverviewMetricSkeleton");
    expect(source).toContain("function OverviewPanelSkeleton");
    expect(source).toContain("platformSummary.isLoading");
    expect(source).toContain("<OverviewMetricSkeleton");
    expect(source).toContain("<OverviewPanelSkeleton rows={3} />");
  });

  it("keeps local retry actions for failed Overview queries", () => {
    expect(source).toContain("platformSummary.refetch()");
    expect(source).toContain("remoteRestaurants.refetch()");
    expect(source).toContain("تعذر التحميل · إعادة المحاولة");
  });
});
