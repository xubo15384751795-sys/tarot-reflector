/** 档案馆页面共享类型。 */

import type { ReactNode } from "react";

export interface ArchiveCardData {
  id: string;
  name_zh: string;
  name_en: string;
  arcana: string;
  image: string;
  suit?: string;
  number?: number | null;
  court_rank?: string | null;
  traditional: {
    upright: { keywords_zh: string[]; meaning_zh: string };
    reversed: { keywords_zh: string[]; meaning_zh: string };
  };
  domain_mapping?: Record<string, string>;
  symbolic_components?: {
    number_rule_zh?: string;
    combined_rule_zh?: string;
  };
}

export type ArchiveTabId = "major" | "wands" | "cups" | "swords" | "pentacles";

export interface ArchiveTabItem {
  id: ArchiveTabId;
  label: string;
  subtitle: string;
  count: number;
  icon?: ReactNode;
}
