import { describe, expect, it } from "vitest";
import { courses, getCourseById } from "./courses";

describe("QuizVault learning catalogue quality", () => {
  it("provides lessons for every path and accurately reports available question banks", () => {
    expect(courses.length).toBeGreaterThan(0);
    for (const course of courses) {
      expect(course.lessons.length, course.title).toBeGreaterThan(0);
      expect(course.questionsCount, course.title).toBe(course.questions.length);
      if (["Python Programming", "Web Development 101", "Algebra Basics", "Network Security"].includes(course.title)) {
        expect(course.questions.length, course.title).toBe(10);
      }
    }
  });

  it("keeps every question structurally valid", () => {
    for (const course of courses) {
      for (const question of course.questions) {
        expect(question.question.trim()).not.toBe("");
        expect(question.explanation.trim()).not.toBe("");
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options.map(option => option.trim().toLowerCase())).size).toBe(4);
        expect(Number.isInteger(question.correctIndex)).toBe(true);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.options.length);
      }
    }
  });

  it("uses a real, sequenced Python introduction rather than generic lesson filler", () => {
    const course = getCourseById("python-programming");
    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(5);
    expect(course!.lessons[0].content).toContain("print(f");
    expect(course!.lessons[1].content).toContain("ValueError");
    expect(course!.lessons[2].content).toContain("elif");
    expect(course!.lessons[3].content).toContain("for price in prices");
    expect(course!.lessons[4].content).toContain("assert");
    expect(course!.questions).toHaveLength(10);
    expect(course!.questions.every(question => question.difficulty)).toBe(true);
  });

  it("provides practical web-development lessons and a leveled question bank", () => {
    const course = getCourseById("web-development-101");
    expect(course).toBeDefined();
    expect(course!.lessons).toHaveLength(5);
    expect(course!.lessons[1].content).toContain("label for");
    expect(course!.lessons[2].content).toContain("grid-template-columns");
    expect(course!.lessons[3].content).toContain("textContent");
    expect(course!.lessons[4].content).toContain("response.ok");
    expect(course!.questions).toHaveLength(10);
    expect(course!.questions.some(question => question.difficulty === "Advanced")).toBe(true);
  });

  it("provides worked algebra examples and a leveled network-security path", () => {
    const algebra = getCourseById("algebra-basics");
    const network = getCourseById("network-security");
    expect(algebra).toBeDefined();
    expect(network).toBeDefined();
    expect(algebra!.lessons).toHaveLength(5);
    expect(algebra!.lessons[1].content).toContain("4x = 24");
    expect(algebra!.lessons[2].content).toContain("reverse the inequality sign");
    expect(algebra!.questions).toHaveLength(10);
    expect(network!.lessons).toHaveLength(5);
    expect(network!.lessons[0].content).toContain("confidentiality");
    expect(network!.lessons[3].content).toContain("Preserve relevant logs");
    expect(network!.questions).toHaveLength(10);
    expect(network!.questions.every(question => question.difficulty)).toBe(true);
  });

  it("does not pad course quizzes with generic study-advice questions", () => {
    for (const course of courses) {
      expect(course.questions.some(question => /primary goal of mastering|what is the best method to retain knowledge/i.test(question.question))).toBe(false);
    }
  });
});
