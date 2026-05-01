import { Suggestion } from "../types";

interface Audit {
  title?: string;
  score?: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
  description?: string;
  details?: { overallSavingsMs?: number };
}

const suggestionMap: Record<string, string> = {
  "render-blocking-resources":
    "Remove scripts or styles that delay page display.",
  "unminified-javascript":
    "Minify JavaScript to reduce load size and parsing time.",
  "unused-css-rules": "Remove unused CSS to shrink page size.",
  "uses-webp-images": "Use modern image formats like WebP for faster loading.",
  "uses-optimized-images": "Compress images to improve load speed.",
  "uses-responsive-images":
    "Use images that adapt to screen sizes for better performance.",
  "efficient-animated-content": "Avoid large animated content like GIFs.",
  "legacy-javascript": "Update legacy JavaScript libraries to improve speed.",
  "total-blocking-time":
    "Reduce long-running JavaScript tasks to improve responsiveness.",
  "uses-long-cache-ttl": "Enable browser caching to speed up repeat visits.",
  "time-to-interactive":
    "Page takes a long time to become usable — reduce script execution.",
  "speed-index":
    "Speed Index measures how quickly content is visually displayed.",
  "first-contentful-paint":
    "Time taken for the first visible content — aim for < 2s.",
  "largest-contentful-paint":
    "Delay in rendering main content — optimize media and scripts.",
  "cumulative-layout-shift":
    "Elements move while loading — reserve space for them.",
  "uses-text-compression":
    "Compress text files like HTML, CSS, JS to improve load speed.",
  "modern-image-formats": "Use next-gen image formats like WebP or AVIF.",
  "offscreen-images":
    "Lazy-load images not immediately visible to reduce initial load.",
};

export const getUserFriendlySuggestions = (
  audits: Record<string, Audit>,
): Suggestion[] =>
  Object.entries(audits)
    .filter(
      ([, audit]) =>
        (audit?.scoreDisplayMode === "opportunity" ||
          audit?.scoreDisplayMode === "numeric") &&
        (audit?.displayValue || audit?.details?.overallSavingsMs),
    )
    .map(([key, audit]) => ({
      title: audit.title ?? key,
      score: audit.score ?? null,
      displayValue: audit.displayValue ?? null,
      description:
        suggestionMap[key] ?? audit.description ?? audit.title ?? key,
    }));
