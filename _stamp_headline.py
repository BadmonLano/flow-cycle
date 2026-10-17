import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

root = Path(__file__).resolve().parent / "data"
written = datetime.now(ZoneInfo("America/New_York")).isoformat(timespec="seconds")
headline = "Bitstamp Shed 422.1 Million Dollars In 24 Hours"
narrative = (
    "Bitstamp clean assets fell 422.1 million dollars over 24 hours. "
    "The figure is the change in dollars held on the venue excluding the exchange's own token, "
    "so the drop means that money left Bitstamp. "
    "Bitfinex took in 160.5 million dollars over the same window."
)
old_h = "Fear And Greed Fell To 55 From 63"
old_n = (
    "The crypto fear and greed index fell to 55 from 63. "
    "The index is the sentiment pipe, a single reading of how fearful or greedy crypto traders are, "
    "and the new print is still tagged greed, the same tag as 63. "
    "A lower print means greed cooled, so the sentiment reading stepped back while remaining greed."
)

card = {
    "headline": headline,
    "narrative": narrative,
    "written_at": written,
    "author": "jordan",
    "voice": "newsroom",
    "lead": "bitstamp_422.1m_outflow_24h",
}
(root / "jordan_headline.json").write_text(json.dumps(card, indent=2) + "\n", encoding="utf-8")


def stamp(path: Path, also_time: bool) -> None:
    text = path.read_text(encoding="utf-8")
    hc = text.count(old_h)
    nc = text.count(old_n)
    if hc == 0 or nc == 0:
        raise SystemExit(f"missing old copy in {path.name}: headline={hc} narrative={nc}")
    text = text.replace(old_h, headline).replace(old_n, narrative)
    if also_time:
        old_ts = "2026-10-16T20:21:31-04:00"
        if text.count(old_ts) != 1:
            raise SystemExit(f"timestamp count {text.count(old_ts)} in {path.name}")
        text = text.replace(old_ts, written, 1)
        needle = (
            '"author": "jordan",\n'
            '    "brain": "jordan",\n'
            f'    "jordan_written_at": "{written}",\n'
            '    "confidence": 0.7'
        )
        repl = (
            '"author": "jordan",\n'
            '    "brain": "jordan",\n'
            f'    "jordan_written_at": "{written}",\n'
            '    "voice": "newsroom",\n'
            '    "confidence": 0.7'
        )
        if needle not in text:
            raise SystemExit("narrative author block not found after timestamp swap")
        text = text.replace(needle, repl, 1)
    path.write_text(text, encoding="utf-8")
    print(path.name, "headlines", hc, "narratives", nc)


stamp(root / "brain_consensus.json", also_time=True)
stamp(root / "macro.json", also_time=False)

bc = json.loads((root / "brain_consensus.json").read_text(encoding="utf-8"))
macro = json.loads((root / "macro.json").read_text(encoding="utf-8"))
jh = json.loads((root / "jordan_headline.json").read_text(encoding="utf-8"))
assert jh["headline"] == headline
assert jh["author"] == "jordan"
assert jh["voice"] == "newsroom"
assert bc["narrative"]["headline"] == headline
assert bc["narrative"]["narrative"] == narrative
assert bc["narrative"]["author"] == "jordan"
assert bc["narrative"]["voice"] == "newsroom"
assert bc["narrative"]["jordan_written_at"] == written
assert macro["brain_consensus"]["headline"] == headline
assert macro["brain_consensus"]["narrative"] == narrative
raw_bc = (root / "brain_consensus.json").read_text(encoding="utf-8")
raw_macro = (root / "macro.json").read_text(encoding="utf-8")
assert old_h not in raw_bc and old_h not in raw_macro
assert old_n not in raw_bc and old_n not in raw_macro
print("written_at", written)
print("OK")
