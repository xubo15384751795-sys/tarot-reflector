/**
 * Karpathy-style reference fixtures — static JSON only, no API / Dexie.
 */
import archiveReference from "../../fixtures/archive_reference.json";
import readingReferenceDaily from "../../fixtures/reading_reference_daily.json";
import motifReferenceMagician from "../../fixtures/motif_reference_magician.json";
import type { ArchiveCardData } from "@/components/archive/types";

export type ArchiveReferenceFixture = {
  caption: string;
  activeTab: string;
  tabs: Array<{
    id: string;
    label: string;
    count: number;
    theme?: string;
    desc?: string;
    element?: string;
  }>;
  cards: ArchiveCardData[];
};

export type ReadingReferenceFixture = typeof readingReferenceDaily;

export type MotifReferenceFixture = typeof motifReferenceMagician;

export function getArchiveReference(): ArchiveReferenceFixture {
  return archiveReference as ArchiveReferenceFixture;
}

export function getReadingReferenceDaily(): ReadingReferenceFixture {
  return readingReferenceDaily;
}

export function getMotifReferenceMagician(): MotifReferenceFixture {
  return motifReferenceMagician;
}
