#!/usr/bin/env python3
"""
Download 56 minor arcana RWS tarot card images from Wikimedia Commons.

The Rider-Waite-Smith deck (1909) is public domain in the US and UK.
We use specific Commons file pages to ensure proper attribution.

Usage: python3 scripts/download_minor_arcana.py
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timezone

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_CARDS = PROJECT_ROOT / "public" / "cards"
ASSETS_DIR = PROJECT_ROOT / "data" / "assets"
REPORTS_DIR = PROJECT_ROOT / "reports"

# Wikimedia Commons filenames for RWS minor arcana
# These are the standard RWS scans hosted on Commons
COMMONS_BASE = "https://upload.wikimedia.org/wikipedia/commons"

# Map: card_id -> (commons_filename, commons_page_title)
# The RWS deck on Commons uses specific naming conventions
MINOR_ARCANA_MAP = {
    # Wands
    "wands_ace": ("Wands01.jpg", "File:Wands01.jpg"),
    "wands_02": ("Wands02.jpg", "File:Wands02.jpg"),
    "wands_03": ("Wands03.jpg", "File:Wands03.jpg"),
    "wands_04": ("Wands04.jpg", "File:Wands04.jpg"),
    "wands_05": ("Wands05.jpg", "File:Wands05.jpg"),
    "wands_06": ("Wands06.jpg", "File:Wands06.jpg"),
    "wands_07": ("Wands07.jpg", "File:Wands07.jpg"),
    "wands_08": ("Wands08.jpg", "File:Wands08.jpg"),
    "wands_09": ("Wands09.jpg", "File:Wands09.jpg"),
    "wands_10": ("Wands10.jpg", "File:Wands10.jpg"),
    "wands_page": ("Wands11.jpg", "File:Wands11.jpg"),
    "wands_knight": ("Wands12.jpg", "File:Wands12.jpg"),
    "wands_queen": ("Wands13.jpg", "File:Wands13.jpg"),
    "wands_king": ("Wands14.jpg", "File:Wands14.jpg"),
    # Cups
    "cups_ace": ("Cups01.jpg", "File:Cups01.jpg"),
    "cups_02": ("Cups02.jpg", "File:Cups02.jpg"),
    "cups_03": ("Cups03.jpg", "File:Cups03.jpg"),
    "cups_04": ("Cups04.jpg", "File:Cups04.jpg"),
    "cups_05": ("Cups05.jpg", "File:Cups05.jpg"),
    "cups_06": ("Cups06.jpg", "File:Cups06.jpg"),
    "cups_07": ("Cups07.jpg", "File:Cups07.jpg"),
    "cups_08": ("Cups08.jpg", "File:Cups08.jpg"),
    "cups_09": ("Cups09.jpg", "File:Cups09.jpg"),
    "cups_10": ("Cups10.jpg", "File:Cups10.jpg"),
    "cups_page": ("Cups11.jpg", "File:Cups11.jpg"),
    "cups_knight": ("Cups12.jpg", "File:Cups12.jpg"),
    "cups_queen": ("Cups13.jpg", "File:Cups13.jpg"),
    "cups_king": ("Cups14.jpg", "File:Cups14.jpg"),
    # Swords
    "swords_ace": ("Swords01.jpg", "File:Swords01.jpg"),
    "swords_02": ("Swords02.jpg", "File:Swords02.jpg"),
    "swords_03": ("Swords03.jpg", "File:Swords03.jpg"),
    "swords_04": ("Swords04.jpg", "File:Swords04.jpg"),
    "swords_05": ("Swords05.jpg", "File:Swords05.jpg"),
    "swords_06": ("Swords06.jpg", "File:Swords06.jpg"),
    "swords_07": ("Swords07.jpg", "File:Swords07.jpg"),
    "swords_08": ("Swords08.jpg", "File:Swords08.jpg"),
    "swords_09": ("Swords09.jpg", "File:Swords09.jpg"),
    "swords_10": ("Swords10.jpg", "File:Swords10.jpg"),
    "swords_page": ("Swords11.jpg", "File:Swords11.jpg"),
    "swords_knight": ("Swords12.jpg", "File:Swords12.jpg"),
    "swords_queen": ("Swords13.jpg", "File:Swords13.jpg"),
    "swords_king": ("Swords14.jpg", "File:Swords14.jpg"),
    # Pentacles
    # Pentacles - Commons uses "Pents" prefix, not "Pentacles"
    "pentacles_ace": ("Pents01.jpg", "File:Pents01.jpg"),
    "pentacles_02": ("Pents02.jpg", "File:Pents02.jpg"),
    "pentacles_03": ("Pents03.jpg", "File:Pents03.jpg"),
    "pentacles_04": ("Pents04.jpg", "File:Pents04.jpg"),
    "pentacles_05": ("Pents05.jpg", "File:Pents05.jpg"),
    "pentacles_06": ("Pents06.jpg", "File:Pents06.jpg"),
    "pentacles_07": ("Pents07.jpg", "File:Pents07.jpg"),
    "pentacles_08": ("Pents08.jpg", "File:Pents08.jpg"),
    "pentacles_09": ("Pents09.jpg", "File:Pents09.jpg"),
    "pentacles_10": ("Pents10.jpg", "File:Pents10.jpg"),
    "pentacles_page": ("Pents11.jpg", "File:Pents11.jpg"),
    "pentacles_knight": ("Pents12.jpg", "File:Pents12.jpg"),
    "pentacles_queen": ("Pents13.jpg", "File:Pents13.jpg"),
    "pentacles_king": ("Pents14.jpg", "File:Pents14.jpg"),
}

# Card name mappings for display
CARD_NAMES = {
    "wands_ace": ("权杖一", "Ace of Wands"),
    "wands_02": ("权杖二", "Two of Wands"),
    "wands_03": ("权杖三", "Three of Wands"),
    "wands_04": ("权杖四", "Four of Wands"),
    "wands_05": ("权杖五", "Five of Wands"),
    "wands_06": ("权杖六", "Six of Wands"),
    "wands_07": ("权杖七", "Seven of Wands"),
    "wands_08": ("权杖八", "Eight of Wands"),
    "wands_09": ("权杖九", "Nine of Wands"),
    "wands_10": ("权杖十", "Ten of Wands"),
    "wands_page": ("权杖侍从", "Page of Wands"),
    "wands_knight": ("权杖骑士", "Knight of Wands"),
    "wands_queen": ("权杖王后", "Queen of Wands"),
    "wands_king": ("权杖国王", "King of Wands"),
    "cups_ace": ("圣杯一", "Ace of Cups"),
    "cups_02": ("圣杯二", "Two of Cups"),
    "cups_03": ("圣杯三", "Three of Cups"),
    "cups_04": ("圣杯四", "Four of Cups"),
    "cups_05": ("圣杯五", "Five of Cups"),
    "cups_06": ("圣杯六", "Six of Cups"),
    "cups_07": ("圣杯七", "Seven of Cups"),
    "cups_08": ("圣杯八", "Eight of Cups"),
    "cups_09": ("圣杯九", "Nine of Cups"),
    "cups_10": ("圣杯十", "Ten of Cups"),
    "cups_page": ("圣杯侍从", "Page of Cups"),
    "cups_knight": ("圣杯骑士", "Knight of Cups"),
    "cups_queen": ("圣杯王后", "Queen of Cups"),
    "cups_king": ("圣杯国王", "King of Cups"),
    "swords_ace": ("宝剑一", "Ace of Swords"),
    "swords_02": ("宝剑二", "Two of Swords"),
    "swords_03": ("宝剑三", "Three of Swords"),
    "swords_04": ("宝剑四", "Four of Swords"),
    "swords_05": ("宝剑五", "Five of Swords"),
    "swords_06": ("宝剑六", "Six of Swords"),
    "swords_07": ("宝剑七", "Seven of Swords"),
    "swords_08": ("宝剑八", "Eight of Swords"),
    "swords_09": ("宝剑九", "Nine of Swords"),
    "swords_10": ("宝剑十", "Ten of Swords"),
    "swords_page": ("宝剑侍从", "Page of Swords"),
    "swords_knight": ("宝剑骑士", "Knight of Swords"),
    "swords_queen": ("宝剑王后", "Queen of Swords"),
    "swords_king": ("宝剑国王", "King of Swords"),
    "pentacles_ace": ("星币一", "Ace of Pentacles"),
    "pentacles_02": ("星币二", "Two of Pentacles"),
    "pentacles_03": ("星币三", "Three of Pentacles"),
    "pentacles_04": ("星币四", "Four of Pentacles"),
    "pentacles_05": ("星币五", "Five of Pentacles"),
    "pentacles_06": ("星币六", "Six of Pentacles"),
    "pentacles_07": ("星币七", "Seven of Pentacles"),
    "pentacles_08": ("星币八", "Eight of Pentacles"),
    "pentacles_09": ("星币九", "Nine of Pentacles"),
    "pentacles_10": ("星币十", "Ten of Pentacles"),
    "pentacles_page": ("星币侍从", "Page of Pentacles"),
    "pentacles_knight": ("星币骑士", "Knight of Pentacles"),
    "pentacles_queen": ("星币王后", "Queen of Pentacles"),
    "pentacles_king": ("星币国王", "King of Pentacles"),
}

SUIT_DIRS = {
    "wands": "wands",
    "cups": "cups",
    "swords": "swords",
    "pentacles": "pentacles",
}


def get_download_url(commons_filename):
    """Build a direct download URL for a Commons file."""
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{commons_filename}?width=600"


def download_image(card_id, commons_filename, target_dir):
    """Download a single card image."""
    url = get_download_url(commons_filename)
    suit = card_id.split("_")[0]
    local_path = target_dir / f"{card_id}.jpg"
    
    if local_path.exists() and local_path.stat().st_size > 10000:
        print(f"  [SKIP] {card_id} already exists ({local_path.stat().st_size} bytes)")
        return True, str(local_path), url
    
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "TarotReflector/1.0 (Educational project; downloading public domain RWS images)"
        })
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            local_path.write_bytes(data)
            print(f"  [OK] {card_id} -> {len(data)} bytes")
            return True, str(local_path), url
    except Exception as e:
        print(f"  [FAIL] {card_id}: {e}")
        return False, None, url


def main():
    print("=== RWS Minor Arcana Image Downloader ===")
    print(f"Target: {len(MINOR_ARCANA_MAP)} cards")
    print()
    
    image_sources = []
    missing = []
    success_count = 0
    
    for card_id, (commons_filename, commons_page) in MINOR_ARCANA_MAP.items():
        suit = card_id.split("_")[0]
        target_dir = PUBLIC_CARDS / SUIT_DIRS[suit]
        target_dir.mkdir(parents=True, exist_ok=True)
        
        name_zh, name_en = CARD_NAMES.get(card_id, (card_id, card_id))
        
        print(f"[{card_id}] {name_zh} ({name_en})")
        ok, local_path, source_url = download_image(card_id, commons_filename, target_dir)
        
        record = {
            "card_id": card_id,
            "name_zh": name_zh,
            "name_en": name_en,
            "local_path": f"/cards/{SUIT_DIRS[suit]}/{card_id}.jpg",
            "source_url": source_url,
            "commons_file_title": commons_page,
            "license_note": "Public domain - Rider-Waite-Smith deck (1909), US & UK",
            "downloaded_at": datetime.now(timezone.utc).isoformat(),
            "status": "ok" if ok else "failed"
        }
        image_sources.append(record)
        
        if ok:
            success_count += 1
        else:
            missing.append(record)
        
        time.sleep(3.0)  # Respect Wikimedia rate limits
    
    # Save image_sources.json
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    sources_path = ASSETS_DIR / "image_sources.json"
    with open(sources_path, "w", encoding="utf-8") as f:
        json.dump(image_sources, f, ensure_ascii=False, indent=2)
    print(f"\n[INFO] Saved image_sources.json to {sources_path}")
    
    # Save missing report
    if missing:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_path = REPORTS_DIR / "missing_images_report.md"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# Missing Card Images Report\n\n")
            f.write(f"Generated: {datetime.now(timezone.utc).isoformat()}\n\n")
            f.write(f"Total: {len(MINOR_ARCANA_MAP)}, Success: {success_count}, Missing: {len(missing)}\n\n")
            f.write("## Missing Images\n\n")
            for m in missing:
                f.write(f"- **{m['card_id']}** ({m['name_zh']}): {m['source_url']}\n")
        print(f"[INFO] Missing report saved to {report_path}")
    
    print(f"\n=== Done: {success_count}/{len(MINOR_ARCANA_MAP)} cards downloaded ===")
    return 0 if not missing else 1


if __name__ == "__main__":
    sys.exit(main())
