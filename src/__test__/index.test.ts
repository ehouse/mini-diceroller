import { cmdEvaluate, exec } from "../evaluator";
import { parse } from "../parser";

describe("test single parser", () => {
  it("single number", () => {
    expect(parse("1")).toEqual({ n: 1, tag: "number" });
  });

  it("single die roll", () => {
    expect(parse("1d20")).toEqual({ n: 1, sides: 20, tag: "roll" });
  });

  it("multiple die roll", () => {
    expect(parse("2d20")).toEqual({ n: 2, sides: 20, tag: "roll" });
  });
});

describe("Test probability statistics", () => {
  it("Rolling 1d20", () => {
    const expression = exec("1d20");
    expect(expression.stats).toEqual({
      avg: 10.5,
      max: 20,
      min: 1,
    });
  });

  it("Rolling (10d20 + 10) * 2", () => {
    const expression = exec("(10d20 + 10) * 2");
    expect(expression.stats).toEqual({
      avg: 230,
      max: 420,
      min: 40,
    });
  });
});

describe("Test CMD", () => {
  it("evaluates complex athematic string", () => {
    expect(cmdEvaluate("(2 + 2) * 2")).toEqual(
      "2 + 2 * 2 > 8 {min: 8, max: 8, avg: 8 }"
    );
  });
});
