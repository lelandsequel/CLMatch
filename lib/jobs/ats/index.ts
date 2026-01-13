import type { ParsedJob, AtsType } from "../types";
import { parseGreenhouse } from "./greenhouse";
import { parseLever } from "./lever";
import { parseAshby } from "./ashby";
import { parseWorkday } from "./workday";

export function parseAtsHtml(atsType: AtsType, html: string, sourceUrl: string): ParsedJob[] {
  switch (atsType) {
    case "greenhouse":
      return parseGreenhouse(html, sourceUrl);
    case "lever":
      return parseLever(html, sourceUrl);
    case "ashby":
      return parseAshby(html, sourceUrl);
    case "workday":
      return parseWorkday(html, sourceUrl);
    default:
      return [];
  }
}
