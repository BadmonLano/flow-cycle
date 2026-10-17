import pathlib
p = pathlib.Path(r"C:\Users\delan\.openclaw\workspace\bots\flow_cycle_site\data\brain_consensus.json")
lines = p.read_text(encoding="utf-8").splitlines()
for i, line in enumerate(lines, 1):
    if any(k in line for k in ("headline", "jordan_written", "narrative", "voice", "author")):
        print(f"{i}: {line}")
