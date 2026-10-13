<div align="center">

<img src="assets/logo.png" alt="Flow Cycle Index logo" width="120" />

# Flow Cycle Index

**Live crypto market cycle dashboard with a graded track record of every call.**

[![Site live](https://img.shields.io/website?url=https%3A%2F%2Ftheflowcycle.com&label=theflowcycle.com&up_message=live&style=for-the-badge)](https://theflowcycle.com)
[![Languages](https://img.shields.io/badge/languages-10-4f9eff?style=for-the-badge)](https://theflowcycle.com)
[![Auto-updated](https://img.shields.io/badge/data-auto--updated-00e5a0?style=for-the-badge)](https://theflowcycle.com)

### [→ Open the live dashboard](https://theflowcycle.com)

</div>

[![Flow Cycle Index dashboard](assets/screenshot.png)](https://theflowcycle.com)

## What it does

Flow Cycle Index reads where the crypto market sits in its emotional cycle and turns that into a single 0–100 cycle score for **Bitcoin (BTC), Ethereum (ETH) and Solana (SOL)**, with history back to 2017.

- **The 13 emotional phases.** The score is mapped onto the market's recurring crowd-psychology loop: Disbelief, Hope, Optimism, Belief, Thrill, Euphoria, Complacency, Anxiety, Denial, Panic, Capitulation, Anger and Depression. Each phase links to historical examples on the chart.
- **Blow-off top detector.** Six signatures (parabolic move, magnitude, retail mania, macro alignment, mania breadth and shape match against past tops) are scored together. The strict detector only fires when several line up at once, the kind of setup seen at the December 2017 and November 2021 tops.
- **7-day price projection.** A day-by-day path for BTC, ETH and SOL over the next week, built from historical analogs and each coin's beta to Bitcoin.
- **Pattern match against history.** Shows how closely today's market resembles past cycle tops and bottoms.
- **Macro and on-chain context.** Fear & Greed, funding rates, open interest, spot ETF flows, stablecoin supply, MVRV, Fed net liquidity, the dollar index, yields and more, in one view.

## Receipts

Every directional call is **timestamped when it is made and graded afterwards** against what the market actually did, over a fixed window. Hits and misses stay on the record, and revisions are graded too, so nothing gets quietly edited. Separate scoreboards compare the mechanical model with the editor's calls and track 7-day price-target accuracy.

See the current hit rate and every recent call in the **Track Record** section of the [live dashboard](https://theflowcycle.com).

## Features

- **Auto-updates** about every 70 minutes, with no manual refresh needed
- **10 languages**, detected automatically from the browser and switchable from the header
- **Installable app**: add it to your home screen or desktop like a native app
- **Light and dark themes**, with your choice remembered
- **Share to X**: one click tweets the latest market headline with a link to the dashboard

## How it works

1. A data collection bot gathers market, sentiment, derivatives, ETF flow, on-chain and macro data on a regular schedule.
2. It scores the cycle, records and grades calls, and publishes the results as JSON files in `data/`.
3. The static site, hosted on GitHub Pages, renders those files in the browser, so the dashboard is always current.

## Links

- [Live dashboard](https://theflowcycle.com)
- [About Flow Cycle Index](https://theflowcycle.com/about/)
- X: [@BadmonLano](https://x.com/BadmonLano)
- GitHub: [BadmonLano](https://github.com/BadmonLano)

---

<div align="center">© 2026 Bentayga Empire LLC</div>
