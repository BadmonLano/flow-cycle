import json
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

url = "https://api.llama.fi/cexs"
req = urllib.request.Request(url, headers={"User-Agent": "openclaw-flow-headline"})
with urllib.request.urlopen(req, timeout=25) as r:
    data = json.loads(r.read().decode())
rows = data.get("cexs") or []


def fnum(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


clean_total = 0.0
net24 = 0.0
venues = {}
for c in rows:
    if not isinstance(c, dict):
        continue
    clean = fnum(c.get("cleanAssetsTvl"))
    if clean is None or clean <= 0:
        continue
    clean_total += clean
    f24 = fnum(c.get("inflows_24h"))
    net24 += f24 or 0.0
    name = c.get("name")
    if name:
        venues[name] = f24


def musd(v):
    return round((v or 0.0) / 1e6, 1)


pct = round((net24 / clean_total * 100.0) if clean_total else 0.0, 4)
binance = musd(venues.get("Binance"))
bybit = musd(venues.get("Bybit"))
bitfinex = musd(venues.get("Bitfinex"))
bitget = musd(venues.get("Bitget"))
net_m = musd(net24)
print("net_m", net_m, "pct", pct, "binance", binance, "bybit", bybit, "bitfinex", bitfinex, "bitget", bitget)

expected = (209.0, 294.0, 0.1091, 43.3, -63.0, -39.7)
got = (binance, net_m, pct, bybit, bitfinex, bitget)
if got != expected:
    raise SystemExit("FIGURES_MOVED " + str(got))

written = datetime.now(ZoneInfo("America/New_York")).isoformat(timespec="seconds")
headline = "Binance Took In 209.0 Million Dollars, Down From 416.2 Million"
narrative = (
    "Binance took in 209.0 million dollars over 24 hours, down from 416.2 million, "
    "while exchanges overall took in 294.0 million dollars, 0.1091 percent of custodied value "
    "excluding each venue's own token, down from 413.1 million dollars and 0.1539 percent. "
    "The figure is the change in dollars held on trading venues, so a positive print means money "
    "arrived where holders can sell, and the smaller print means that arrival slowed. "
    "Bybit took in 43.3 million dollars, while Bitfinex shed 63.0 million and Bitget shed 39.7 million."
)
lead = "binance_intake_fell_to_209.0m_from_416.2m"

old_h = "Exchange Inflows Fell To 413.1 Million Dollars As Binance Took In 416.2 Million"
old_n = (
    "Exchanges took in 413.1 million dollars across assets over 24 hours, 0.1539 percent of custodied "
    "value excluding each venue's own token, down from 570.6 million dollars and 0.2127 percent. "
    "The figure is the change in dollars held on trading venues, so a positive print means money arrived "
    "where holders can sell, and the smaller print means that arrival slowed. "
    "Binance took in 416.2 million dollars, above the 413.1 million dollar net, while Bitfinex shed 61.4 million, "
    "Bybit shed 31.5 million, and Bitget shed 31.0 million."
)

root = Path(__file__).resolve().parent / "data"
card = {
    "headline": headline,
    "narrative": narrative,
    "written_at": written,
    "author": "jordan",
    "voice": "newsroom",
    "lead": lead,
}
(root / "jordan_headline.json").write_text(json.dumps(card, indent=2) + "\n", encoding="utf-8")


def stamp(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    hc = text.count(old_h)
    nc = text.count(old_n)
    if hc == 0 or nc == 0:
        raise SystemExit(f"missing old copy in {path.name}: headline={hc} narrative={nc}")
    text = text.replace(old_h, headline).replace(old_n, narrative)
    path.write_text(text, encoding="utf-8")
    print(path.name, "headlines", hc, "narratives", nc)


stamp(root / "brain_consensus.json")
stamp(root / "macro.json")

bc_path = root / "brain_consensus.json"
bc_text = bc_path.read_text(encoding="utf-8")
old_ts = "2026-10-17T23:20:00-04:00"
if bc_text.count(old_ts) != 1:
    raise SystemExit(f"timestamp count {bc_text.count(old_ts)}")
bc_text = bc_text.replace(old_ts, written, 1)
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
if needle not in bc_text:
    raise SystemExit("narrative author block not found after timestamp swap")
bc_text = bc_text.replace(needle, repl, 1)
bc_path.write_text(bc_text, encoding="utf-8")

bc = json.loads(bc_path.read_text(encoding="utf-8"))
macro = json.loads((root / "macro.json").read_text(encoding="utf-8"))
jh = json.loads((root / "jordan_headline.json").read_text(encoding="utf-8"))
assert jh["headline"] == headline
assert jh["narrative"] == narrative
assert jh["author"] == "jordan"
assert jh["voice"] == "newsroom"
assert jh["lead"] == lead
assert jh["written_at"] == written
assert bc["narrative"]["headline"] == headline
assert bc["narrative"]["narrative"] == narrative
assert bc["narrative"]["author"] == "jordan"
assert bc["narrative"]["voice"] == "newsroom"
assert bc["narrative"]["jordan_written_at"] == written
assert macro["brain_consensus"]["headline"] == headline
assert macro["brain_consensus"]["narrative"] == narrative
raw_bc = bc_path.read_text(encoding="utf-8")
raw_macro = (root / "macro.json").read_text(encoding="utf-8")
assert old_h not in raw_bc and old_h not in raw_macro
assert old_n not in raw_bc and old_n not in raw_macro
assert "does not confirm" not in narrative.lower()
assert "\u2014" not in headline and "\u2014" not in narrative
print("written_at", written)
print("OK")
