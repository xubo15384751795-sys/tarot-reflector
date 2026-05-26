"""Inject `image` and `image_meta` fields into tarot_cards.json from the
download_manifest.json produced by download_major_arcana.py.

The frontend reads `image` directly (a path under /public). The full
provenance — source URL, license, sha256, download timestamp — lives in
`image_meta` for auditability.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CARDS_PATH = ROOT / "src" / "data" / "tarot_cards.json"
MANIFEST_PATH = ROOT / "public" / "cards" / "major" / "download_manifest.json"


def main() -> int:
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    by_id = {entry["card_id"]: entry for entry in manifest["cards"]}

    missing = []
    for card in cards:
        cid = card["id"]
        entry = by_id.get(cid)
        if not entry:
            missing.append(cid)
            continue
        # /public/cards/major/<file> served at /cards/major/<file>
        local = entry["local_path"]  # eg "public/cards/major/16_the_tower.jpg"
        assert local.startswith("public/"), local
        card["image"] = "/" + local[len("public/"):]
        card["image_meta"] = {
            "source_url": entry["source_url"],
            "direct_url": entry["direct_url"],
            "downloaded_at": entry["downloaded_at"],
            "license_note": entry["license_note"],
            "sha256": entry["sha256"],
            "size_bytes": entry["size_bytes"],
        }

    CARDS_PATH.write_text(
        json.dumps(cards, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wired {len(cards) - len(missing)} / {len(cards)} cards.")
    if missing:
        print(f"Missing image entries for: {missing}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
