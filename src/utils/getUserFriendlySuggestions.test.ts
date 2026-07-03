import { getUserFriendlySuggestions } from "./getUserFriendlySuggestions";

describe("getUserFriendlySuggestions", () => {
  it("returns an empty array when given no audits", () => {
    const result = getUserFriendlySuggestions({});
    expect(result).toEqual([]);
  });

  it("filters out audits that are not opportunity or numeric", () => {
    const audits = {
      "some-informational-audit": {
        title: "Some Info",
        score: null,
        scoreDisplayMode: "informational",
        displayValue: "some value",
      },
    };
    const result = getUserFriendlySuggestions(audits);
    expect(result).toEqual([]);
  });

  it("includes audits with scoreDisplayMode of opportunity that have a displayValue", () => {
    const audits = {
      "render-blocking-resources": {
        title: "Eliminate render-blocking resources",
        score: 0.5,
        scoreDisplayMode: "opportunity",
        displayValue: "Potential savings of 300ms",
      },
    };
    const result = getUserFriendlySuggestions(audits);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Eliminate render-blocking resources");
    expect(result[0].description).toBe(
      "Remove scripts or styles that delay page display.",
    );
  });

  it("uses the audit title as description when key is not in suggestionMap", () => {
    const audits = {
      "unknown-audit-key": {
        title: "Some Unknown Audit",
        score: 0.3,
        scoreDisplayMode: "numeric",
        displayValue: "1.2s",
      },
    };
    const result = getUserFriendlySuggestions(audits);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Some Unknown Audit");
  });
});
