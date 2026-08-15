import { describe, expect, it } from "vitest";
import type { GroupInput } from "../types";
import { randomizeDataset } from "./randomDataset";

const makeGroups = (count: number): GroupInput[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `g${index}`,
    name: `Group ${index + 1}`,
    share1: 1 / count,
    share2: 1 / count,
    ctr1: 0.02,
    ctr2: 0.02,
  }));

const seededRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

describe("random dataset", () => {
  for (const count of [3, 5, 10, 20, 50]) {
    it(`generates valid neighboring periods for ${count} groups`, () => {
      const source = makeGroups(count);
      const result = randomizeDataset(source, seededRandom(count));
      expect(result).toHaveLength(count);
      expect(result.map((group) => group.id)).toEqual(source.map((group) => group.id));
      expect(result.map((group) => group.name)).toEqual(source.map((group) => group.name));
      expect(result.reduce((sum, group) => sum + group.share1, 0)).toBeCloseTo(1, 12);
      expect(result.reduce((sum, group) => sum + group.share2, 0)).toBeCloseTo(1, 12);
      for (const group of result) {
        expect([group.share1, group.share2, group.ctr1, group.ctr2].every(Number.isFinite)).toBe(true);
        expect(Math.min(group.share1, group.share2, group.ctr1, group.ctr2)).toBeGreaterThan(0);
        expect(Math.abs(group.share2 - group.share1)).toBeLessThanOrEqual(0.160000000001);
        expect(group.ctr1).toBeGreaterThanOrEqual(0.005);
        expect(group.ctr1).toBeLessThanOrEqual(0.08);
        expect(Math.abs(group.ctr2 / group.ctr1 - 1)).toBeLessThanOrEqual(0.22);
      }
      const ctrChanges = result.map((group) => group.ctr2 - group.ctr1);
      expect(ctrChanges.some((change) => change > 0)).toBe(true);
      expect(ctrChanges.some((change) => change < 0)).toBe(true);
    });
  }

  it("mixes conservative, moderate and strong share redistribution", () => {
    const movedShares = Array.from({ length: 200 }, (_, seed) => {
      const result = randomizeDataset(makeGroups(5), seededRandom(seed + 100));
      return result.reduce(
        (moved, group) => moved + Math.max(0, group.share2 - group.share1),
        0,
      );
    });
    expect(movedShares.some((moved) => moved <= 0.06)).toBe(true);
    expect(movedShares.some((moved) => moved >= 0.1)).toBe(true);
  });
});
