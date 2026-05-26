"""Inject motifs[] into tarot_cards.json.

Each card's `visual_motifs` strings become a Motif with id/label/meaning/bbox.
The Tower gets the hand-tuned layout from the product spec.
All other cards use a 5-slot blueprint layout (top → bottom).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "tarot_cards.json"

# Default 5-slot vertical layout. Each slot is (x, y, w, h) in 0..1.
LAYOUT_5 = [
    (0.30, 0.04, 0.40, 0.18),   # top
    (0.18, 0.22, 0.64, 0.18),   # upper-mid
    (0.12, 0.40, 0.76, 0.22),   # mid
    (0.18, 0.62, 0.64, 0.20),   # lower-mid
    (0.28, 0.82, 0.44, 0.14),   # bottom
]

# Hand-tuned per the spec — canonical motifs, do not derive from source labels.
TOWER_OVERRIDE = [
    {
        "id": "lightning",
        "label": "雷电",
        "bbox": {"x": 0.40, "y": 0.03, "w": 0.20, "h": 0.16},
        "meaning": "外部冲击、突然揭露、现实击穿旧结构。",
    },
    {
        "id": "crown",
        "label": "皇冠",
        "bbox": {"x": 0.40, "y": 0.17, "w": 0.20, "h": 0.10},
        "meaning": "权威、控制幻觉、旧中心的失效。",
    },
    {
        "id": "tower_body",
        "label": "塔身",
        "bbox": {"x": 0.30, "y": 0.27, "w": 0.40, "h": 0.42},
        "meaning": "旧秩序、封闭结构、看似稳固却脆弱的系统。",
    },
    {
        "id": "falling_figures",
        "label": "坠落人物",
        "bbox": {"x": 0.08, "y": 0.55, "w": 0.84, "h": 0.28},
        "meaning": "失控、位置丧失、旧身份被迫脱离。",
    },
    {
        "id": "fire",
        "label": "火焰",
        "bbox": {"x": 0.20, "y": 0.78, "w": 0.60, "h": 0.18},
        "meaning": "破坏、净化、无法继续隐藏的压力。",
    },
]


def slug_from_label(label: str, idx: int) -> str:
    # Strip punctuation, replace whitespace with underscore, transliterate via romanization map for CN.
    base = re.sub(r"[^一-鿿0-9A-Za-z]+", "_", label).strip("_").lower()
    return base if base else f"motif_{idx}"


def romanize_id(label: str, idx: int) -> str:
    """Best-effort ASCII id derived from label. Falls back to motif_{idx}."""
    # Take only ASCII chars from label, if any.
    ascii_only = re.sub(r"[^A-Za-z0-9]+", "_", label).strip("_").lower()
    if ascii_only:
        return ascii_only
    return f"motif_{idx + 1}"


def synth_meaning(label: str, core_symbols, idx: int) -> str:
    """Produce a 12–30 char Chinese meaning grounded in the card's core symbols."""
    if not core_symbols:
        return f"承载着这张牌的核心象征。"
    # Pair each motif with one core_symbol (cycling). Keep it short and grounded.
    sym = core_symbols[idx % len(core_symbols)]
    return f"承载着「{sym}」这一层象征。"


def build_motifs_for_card(card: dict) -> list:
    if card["id"] == "the_tower":
        return build_tower_motifs(card)

    vms = card.get("visual_motifs", [])[:5]
    motifs = []
    for i, label in enumerate(vms):
        x, y, w, h = LAYOUT_5[i]
        motifs.append({
            "id": romanize_id(label, i),
            "label": label,
            "meaning": synth_meaning(label, card.get("core_symbols", []), i),
            "bbox": {"x": x, "y": y, "w": w, "h": h},
        })
    # Ensure unique ids within a card.
    seen = {}
    for m in motifs:
        base = m["id"]
        if base in seen:
            seen[base] += 1
            m["id"] = f"{base}_{seen[base]}"
        else:
            seen[base] = 1
    return motifs


def build_tower_motifs(card: dict) -> list:
    return [
        {
            "id": spec["id"],
            "label": spec["label"],
            "meaning": spec["meaning"],
            "bbox": spec["bbox"],
        }
        for spec in TOWER_OVERRIDE
    ]


def main():
    cards = json.loads(DATA.read_text(encoding="utf-8"))
    for card in cards:
        card["motifs"] = build_motifs_for_card(card)
    DATA.write_text(
        json.dumps(cards, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Augmented {len(cards)} cards with motifs.")


if __name__ == "__main__":
    main()
