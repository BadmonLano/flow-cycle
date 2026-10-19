from pathlib import Path

old_h = "OKX Bitcoin Spot Taker Flow Flips From A 262.124 Bitcoin Buy Imbalance To A 191.751 Bitcoin Sell Imbalance"
root = Path(r"C:\Users\delan\.openclaw\workspace\bots\flow_cycle_site\data")
needles = ("headline", "narrative", "author", "voice", "jordan_written")
for name in ("brain_consensus.json", "macro.json"):
    lines = (root / name).read_text(encoding="utf-8").splitlines()
    print("====", name)
    for i, line in enumerate(lines, 1):
        if old_h in line or any(k in line for k in ('"author"', '"voice"', "jordan_written", '"headline"', '"narrative"')):
            if old_h in line or any(k in line for k in ('"author"', '"voice"', "jordan_written")):
                print(i, line[:240])
