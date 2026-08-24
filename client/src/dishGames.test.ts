import { describe, expect, it } from "vitest";
import { DISH_GAMES, dishTone, rankDishScores } from "@/lib/dishGames";

describe("dish waiting games", () => {
  it("provides dish-inspired games including espresso", () => {
    expect(DISH_GAMES.map((game) => game.id)).toEqual(["espresso", "dessert", "juice"]);
    expect(DISH_GAMES[0].prompt).toContain("إسبريسو");
  });

  it("keeps the highest three valid scores", () => {
    expect(rankDishScores([2, 9, -1, 5, Number.NaN, 7])).toEqual([9, 7, 5]);
  });

  it("uses a distinct tone range for each dish game", () => {
    expect(new Set(DISH_GAMES.map((game) => dishTone(game.id))).size).toBe(3);
  });
});
