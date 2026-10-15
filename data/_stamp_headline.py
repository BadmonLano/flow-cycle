from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path

root = Path(r"C:\Users\delan\.openclaw\workspace\bots\flow_cycle_site\data")
now = datetime.now(ZoneInfo("America/New_York")).replace(microsecond=0)
written_at = now.isoformat()

headline = "10-Year Yield Fell 13 Basis Points to 5.06 Percent"
narrative = (
    "The 10-year Treasury yield fell 13 basis points to 5.06 percent from 5.19 percent. "
    "That yield is the price of long-term government borrowing, and the drop means buyers paid higher prices for the long bond, putting money into duration. "
    "The 2-year yield, the short-rate pipe, was 4.08 percent from 4.09 percent, and the gap between the two rates narrowed to 0.98 from 1.1."
)

old_headline = "Exchanges Took In $758 Million, Up From $223 Million"
old_narrative = (
    "Exchanges took in $758 million across assets in the latest day, 0.284 percent of custodied value, up from $223 million. "
    "The exchange pipe measures dollars held across all assets on trading venues, and an inflow means that value arrived where holders can sell. "
    "Binance accounted for $334 million of the flow, the largest single venue in the print."
)

card = {
    "headline": headline,
    "narrative": narrative,
    "written_at": written_at,
    "author": "jordan",
    "voice": "newsroom",
    "lead": "ten_year_yield_5.06_from_5.19",
}
import json
(root / "jordan_headline.json").write_text(json.dumps(card, indent=2) + "\n", encoding="utf-8")

for name, expect_h, expect_n in (
    ("brain_consensus.json", 3, 1),
    ("macro.json", 2, 1),
):
    path = root / name
    text = path.read_text(encoding="utf-8")
    h = text.count(old_headline)
    n = text.count(old_narrative)
    if h != expect_h or n != expect_n:
        raise SystemExit(f"{name}: headline {h} expected {expect_h}, narrative {n} expected {expect_n}")
    text = text.replace(old_headline, headline).replace(old_narrative, narrative)
    if name == "brain_consensus.json":
        old_block = (
            '"author": "jordan",\n'
            '    "brain": "jordan",\n'
            '    "jordan_written_at": "2026-10-15T08:23:39-04:00",'
        )
        new_block = (
            '"author": "jordan",\n'
            '    "brain": "jordan",\n'
            '    "voice": "newsroom",\n'
            f'    "jordan_written_at": "{written_at}",'
        )
        if text.count(old_block) != 1:
            raise SystemExit(f"timestamp block count {text.count(old_block)}")
        text = text.replace(old_block, new_block)
    path.write_text(text, encoding="utf-8")
    print(name, "ok")

print(written_at)
