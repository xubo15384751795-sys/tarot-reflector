"""Download the 22 Rider-Waite-Smith Major Arcana from Wikimedia Commons.

Source pattern:
    https://commons.wikimedia.org/wiki/Special:FilePath/<Filename>
    → 302-redirects to the canonical upload.wikimedia.org URL.

License:
    Pamela Colman Smith died 1951; the deck was published 1909. The card art
    is {{PD-old-100}} worldwide and {{PD-US-expired}} in the United States.
    Wikimedia Commons hosts the scans under those tags.

Failures are written to missing_images_report.md and the script exits
non-zero so the caller can see something is wrong.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
TARGET_DIR = ROOT / "public" / "cards" / "major"
MANIFEST = TARGET_DIR / "download_manifest.json"
MISSING_REPORT = ROOT / "missing_images_report.md"

LICENSE_NOTE = (
    "Public domain (PD-old-100 worldwide; PD-US-expired in the United "
    "States). Original artwork by Pamela Colman Smith, published 1909 "
    "by Rider & Co., London. Smith died 1951. Scan hosted on "
    "Wikimedia Commons."
)

USER_AGENT = (
    "tarot-reflector/0.1 (https://github.com/local; "
    "contact: project maintainer) curl-via-script"
)


@dataclass
class CardSpec:
    card_id: str                # matches src/data/tarot_cards.json id
    number: int                 # major arcana number 0..21
    commons_filename: str       # File name on Commons (without "File:" prefix)
    out_filename: str           # local filename under public/cards/major/


# The 22 Major Arcana with the canonical Wikimedia Commons file names.
# Names verified against https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck
CARDS: List[CardSpec] = [
    CardSpec("the_fool",            0,  "RWS_Tarot_00_Fool.jpg",              "00_the_fool.jpg"),
    CardSpec("the_magician",        1,  "RWS_Tarot_01_Magician.jpg",          "01_the_magician.jpg"),
    CardSpec("the_high_priestess",  2,  "RWS_Tarot_02_High_Priestess.jpg",    "02_the_high_priestess.jpg"),
    CardSpec("the_empress",         3,  "RWS_Tarot_03_Empress.jpg",           "03_the_empress.jpg"),
    CardSpec("the_emperor",         4,  "RWS_Tarot_04_Emperor.jpg",           "04_the_emperor.jpg"),
    CardSpec("the_hierophant",      5,  "RWS_Tarot_05_Hierophant.jpg",        "05_the_hierophant.jpg"),
    CardSpec("the_lovers",          6,  "RWS_Tarot_06_Lovers.jpg",            "06_the_lovers.jpg"),
    CardSpec("the_chariot",         7,  "RWS_Tarot_07_Chariot.jpg",           "07_the_chariot.jpg"),
    CardSpec("strength",            8,  "RWS_Tarot_08_Strength.jpg",          "08_strength.jpg"),
    CardSpec("the_hermit",          9,  "RWS_Tarot_09_Hermit.jpg",            "09_the_hermit.jpg"),
    CardSpec("wheel_of_fortune",    10, "RWS_Tarot_10_Wheel_of_Fortune.jpg",  "10_wheel_of_fortune.jpg"),
    CardSpec("justice",             11, "RWS_Tarot_11_Justice.jpg",           "11_justice.jpg"),
    CardSpec("the_hanged_man",      12, "RWS_Tarot_12_Hanged_Man.jpg",        "12_the_hanged_man.jpg"),
    CardSpec("death",               13, "RWS_Tarot_13_Death.jpg",             "13_death.jpg"),
    CardSpec("temperance",          14, "RWS_Tarot_14_Temperance.jpg",        "14_temperance.jpg"),
    CardSpec("the_devil",           15, "RWS_Tarot_15_Devil.jpg",             "15_the_devil.jpg"),
    CardSpec("the_tower",           16, "RWS_Tarot_16_Tower.jpg",             "16_the_tower.jpg"),
    CardSpec("the_star",            17, "RWS_Tarot_17_Star.jpg",              "17_the_star.jpg"),
    CardSpec("the_moon",            18, "RWS_Tarot_18_Moon.jpg",              "18_the_moon.jpg"),
    CardSpec("the_sun",             19, "RWS_Tarot_19_Sun.jpg",               "19_the_sun.jpg"),
    CardSpec("judgement",           20, "RWS_Tarot_20_Judgement.jpg",         "20_judgement.jpg"),
    CardSpec("the_world",           21, "RWS_Tarot_21_World.jpg",             "21_the_world.jpg"),
]

# Shared RWS card back (1909 Roses & Lilies design) for shuffle / flip animations.
# Verified on Commons category Rider-Waite tarot deck (Roses & Lilies).
CARD_BACK = CardSpec(
    "card_back",
    -1,
    "Waite–Smith Tarot Roses and Lilies cropped.jpg",
    "back.jpg",
)


def commons_url_filename(commons_filename: str) -> str:
    return quote(commons_filename.replace(" ", "_"))


def filepath_url(commons_filename: str) -> str:
    # Special:FilePath redirects to the canonical upload.wikimedia.org URL.
    # We let curl follow the redirect with -L.
    return (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        f"{commons_url_filename(commons_filename)}"
    )


def commons_page_url(commons_filename: str) -> str:
    return (
        "https://commons.wikimedia.org/wiki/File:"
        f"{commons_url_filename(commons_filename)}"
    )


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def download_card(spec: CardSpec) -> dict:
    """Returns a manifest entry. Raises RuntimeError on failure."""
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    out_path = TARGET_DIR / spec.out_filename
    page_url = commons_page_url(spec.commons_filename)
    fetch_url = filepath_url(spec.commons_filename)

    # curl -L follows redirects; -f fails on HTTP errors; -A sets UA;
    # --max-time bounds the request.
    proc = subprocess.run(
        [
            "curl", "-fLs",
            "-A", USER_AGENT,
            "--max-time", "60",
            "-o", str(out_path),
            "-w", "%{http_code} %{url_effective}\n",
            fetch_url,
        ],
        capture_output=True,
        text=True,
    )

    if proc.returncode != 0:
        # Clean up partial file
        if out_path.exists():
            out_path.unlink()
        raise RuntimeError(
            f"curl failed (exit {proc.returncode}): {proc.stderr.strip()}"
        )

    parts = proc.stdout.strip().split(" ", 1)
    http_code = parts[0] if parts else "?"
    effective_url = parts[1] if len(parts) > 1 else fetch_url

    size = out_path.stat().st_size
    if size < 5000:
        # Sanity: real tarot scans are well over 5KB.
        out_path.unlink(missing_ok=True)
        raise RuntimeError(f"downloaded file suspiciously small ({size} bytes)")

    return {
        "card_id": spec.card_id,
        "number": spec.number,
        "commons_filename": spec.commons_filename,
        "local_path": str(out_path.relative_to(ROOT)),
        "source_url": page_url,
        "direct_url": effective_url,
        "http_code": http_code,
        "downloaded_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "license_note": LICENSE_NOTE,
        "size_bytes": size,
        "sha256": sha256_of(out_path),
    }


def write_missing_report(failures: list[tuple[CardSpec, str]]) -> None:
    if not failures:
        if MISSING_REPORT.exists():
            MISSING_REPORT.unlink()
        return
    lines = [
        "# Missing Tarot Card Images",
        "",
        "These assets could not be retrieved from Wikimedia Commons and are NOT",
        "wired into the frontend. Resolve before shipping.",
        "",
        "| # | Card ID | Commons file | Reason |",
        "|---|---------|-------------|--------|",
    ]
    for spec, reason in failures:
        number_label = "back" if spec.card_id == "card_back" else f"{spec.number:02d}"
        lines.append(
            f"| {number_label} | `{spec.card_id}` | "
            f"[{spec.commons_filename}]({commons_page_url(spec.commons_filename)}) | "
            f"{reason} |"
        )
    MISSING_REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def process_spec(spec: CardSpec, entries: list[dict], failures: list[tuple[CardSpec, str]]) -> None:
    out_path = TARGET_DIR / spec.out_filename
    if out_path.exists() and out_path.stat().st_size > 5000:
        try:
            entries.append({
                "card_id": spec.card_id,
                "number": spec.number,
                "commons_filename": spec.commons_filename,
                "local_path": str(out_path.relative_to(ROOT)),
                "source_url": commons_page_url(spec.commons_filename),
                "direct_url": filepath_url(spec.commons_filename),
                "http_code": "cached",
                "downloaded_at": datetime.fromtimestamp(
                    out_path.stat().st_mtime, tz=timezone.utc
                ).isoformat(timespec="seconds"),
                "license_note": LICENSE_NOTE,
                "size_bytes": out_path.stat().st_size,
                "sha256": sha256_of(out_path),
            })
            print(f"  cached  {spec.out_filename}")
            return
        except Exception as e:
            print(f"  recheck {spec.out_filename}: {e}", file=sys.stderr)

    print(f"  fetch   {spec.commons_filename} → {spec.out_filename}")
    try:
        entry = download_card(spec)
        entries.append(entry)
        time.sleep(0.6)
    except Exception as exc:
        failures.append((spec, str(exc)))
        print(f"    FAIL: {exc}", file=sys.stderr)


def main() -> int:
    entries: list[dict] = []
    back_entry: dict | None = None
    failures: list[tuple[CardSpec, str]] = []

    for spec in CARDS:
        process_spec(spec, entries, failures)

    back_entries: list[dict] = []
    process_spec(CARD_BACK, back_entries, failures)
    if back_entries:
        back_entry = back_entries[0]

    manifest = {
        "cards": entries,
        "license_note": LICENSE_NOTE,
    }
    if back_entry:
        manifest["card_back"] = back_entry

    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_missing_report(failures)

    print()
    print(f"Downloaded/cached: {len(entries)} / {len(CARDS)} major")
    print(f"Card back:           {'ok' if back_entry else 'missing'}")
    if failures:
        print(f"Failed:            {len(failures)}  → see {MISSING_REPORT.name}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
