# X99 Harbor Build — Parts List & Setup Notes

**Purpose:** dedicated machine for running Harbor / terminal-bench jobs in parallel, freeing the
main desktop for interactive exploration work.

**Compiled:** 2026-09-09 · **Cart audited 2026-09-10** · **Ordered 2026-09-10, R$3.755,75** (PSU swapped, §2.1) · **Assembled and OS installed 2026-09-14** — running **Debian 13 trixie**, headless at `192.168.1.22` (§6). The 1TB SSD upgrade was considered and **rejected** (§1.1). **One known defect: a dead DIMM slot (§6.6) — board kept, the 128GB path is unaffected.** **Monitoring and uptime policy settled 2026-09-18 (§6.7); fan control settled at 2 fans on the firmware default, no splitter needed (§6.6). the lsyncd reverse sync to the desktop was debugged and is verified working (§6.7). Open gap: no UPS (§6.7).**

---

## 1. Parts to buy


| # | Part | Item | Price | Link |
|---|------|------|-------|------|
| 1 | Board + CPU | Kit Huananzhi X99-CH8 + Xeon E5-2680 v4 | R$1,048 | https://www.mercadolivre.com.br/kit-placa-mae-atx-huananzhi-x99ch8-processador-e5-2680-v4/up/MLBU3620747751 |
| 2 | RAM ×2 | SK Hynix 32GB DDR4-2400 ECC RDIMM `HMA84GR7MFR4N` — 2Rx4, 1.2V, **Novo**, seller **RAPOSAMG** — **back in stock 2026-09-10, 15 units**, 30-day free return | R$625 ea = **R$1.250** | https://www.mercadolivre.com.br/MLB54497897 |
| 3 | Cooler | Maxcool MX-9201S — **92mm fan**, 120mm tall, preto, `Sem Led` — **interim pick, see §5.1** | R$75 | https://www.mercadolivre.com.br/cpu-cooler-120mm-led-intel-x79-x99-x299-lga-1200-1151-2011-cor-preto/p/MLB52346539 |
| 4 | Case | Kalkan Alfern Lite KLK088 — ATX mid tower, mesh front, sem fans | R$157 | https://www.mercadolivre.com.br/gabinete-gamer-alfern-lite-klk088-atx-mid-tower-preto-kalkan-preto/p/MLB67564215 |
| 5 | Fans ×3 | Thermalright **TL-C12C** 120mm PWM preto (see warning below) — 2 front intake + 1 rear exhaust | R$57 ea = R$171 | https://www.mercadolivre.com.br/ventoinha-cooler-fan-gamer-thermalright-tl-c12c-120mm-pwm-preto/p/MLB76059104 |
| 6 | PSU | **Cooler Master MWE Gold 650 V3** 650W 80+ Gold ATX 3.1 — *swapped 2026-09-10, see §2.1* | R$356 | https://www.mercadolivre.com.br/fonte-cooler-master-mwe-gold-650w-v3-80-plus-gold-atx-31-bl/up/MLBU3414114868 |
| 7 | SSD | Kingston NV3 500GB M.2 2280 NVMe `SNV3S/500G` — 1TB considered and rejected, §1.1 | R$689 | https://www.mercadolivre.com.br/ssd-kingston-nv3-500gb-m2-2280-nvme-pcie-40-gen-4x4/p/MLB39410080 |

**No GPU needed** — the board has onboard ASPEED AST2300/2400 VGA.
**No monitor/keyboard/mouse needed** — headless after first boot (see §6).
**Zero RGB in this build** — the case ships with no fans, the cooler is plain white, the fans are plain black.

> **Fan variant warning:** Thermalright sells near-identical 120mm fans under confusingly similar
> names. Get the plain **`TL-C12C`** (spec sheet: `Cor: Preto`, `Com iluminação RGB: Não`).
> Avoid `TL-C12C-L` (RGB, listed as `Cor: RGB`), `TL-C12C-S` (ARGB), `TL-C12CW-S` (white ARGB)
> and `TL-M12-S` (ARGB). Check the `Com iluminação RGB` field on the listing before buying —
> the model suffix is the only thing that distinguishes them.

### 1.1 SSD — 1TB upgrade considered and rejected

Weighed swapping the **NV3 500GB (R$689)** for the **1TB (R$1.099)**, +R$410. **Not worth it.**
Recording the reasoning so it doesn't get re-litigated later.

| | 500GB | 1TB |
|---|---|---|
| Price | R$689 | R$1.099 |
| Speed **on this board** | ~3.000 MB/s | ~3.000 MB/s — *identical* |
| Endurance | 160 TBW | 320 TBW |
| Warranty | 5 years | 5 years |

**Speed is a non-argument either way.** The board's M.2 is PCIe **3.0** x4, so both Gen4 drives run
at Gen3. Don't pay for Gen4 sequential numbers on this machine — you will never see them.

**But do not "downgrade" to a Gen3 drive to save money — there is no Gen4 premium to recover.**
Full 500GB tier on Mercado Livre, 2026-09-10:

| Drive | Gen | Price | TBW | Life @ 60GB/day |
|---|---|---|---|---|
| Lexar NM610 Pro | **Gen3** | R$629 | 120 | 5.5 yr |
| WD Green SN3000 | Gen4 | R$649 | 100 | 4.6 yr |
| SanDisk Plus | **Gen3** | R$649 | — | — |
| WD Green SN350 | **Gen3** | R$679 | **60** | **2.7 yr** |
| **Kingston NV3** *(chosen)* | Gen4 | **R$689** | **160** | **7.3 yr** |
| Netac | **Gen3** | R$699 | — | — |
| MSI Spatium M371 | **Gen3** | R$778 | — | — |

The best Gen3 price is R$629 — **R$60 (9%) below the NV3**, and several Gen3 parts cost *more* than
it. PCIe generation is not the price driver; NAND is. By 2026 Gen4 controllers are the mainstream
volume part, so a Gen3 drive still on the shelf is either old stock or bottom-tier, priced on its
flash rather than its interface.

More to the point, **every cheaper drive in the tier is worse on endurance** — the exact spec that
matters for this workload. The NV3's 160 TBW is the highest at this capacity. The R$60 Lexar saving
costs 25% of endurance; the WD Green SN350 costs *more* than the NV3 and is a 2.7-year drive at the
expected write rate.

Net: the NV3 is mid-price for its tier and best-in-tier on endurance. The Gen4 controller comes
along for free and idles at Gen3 speeds. Not a tax — just the most durable flash at 500GB.

**Endurance — measured against the real workload, not a guess.** Expected churn is **50–60GB/day
typical, 100GB/day ceiling** (most task images stay cached across runs). Against 160 TBW:

| Write rate | 7 days/week | ~5 days/week |
|---|---|---|
| **55–60 GB/day** *(typical)* | 7.3–8.0 years | 10–11 years |
| **100 GB/day** *(ceiling)* | **4.4 years** | 6.2 years |

Only the 100GB/day-every-day cell lands inside the 5-year warranty, and that is the ceiling rather
than the routine. At the expected rate the drive outlives its warranty comfortably. The 1TB would
roughly double every figure — protection against a case that isn't the expected one.

**The §7 second-NVMe step is not a saving unless it actually happens.** It was budgeted at ~R$690;
paying R$410 now to avoid it only pays off if 500GB genuinely runs out.

**The one real consideration:** the NV3 is **DRAM-less** and relies on an SLC write cache carved out
of free space, so sustained write speed degrades as the drive fills. Practical ceiling is ~70–80%
full — on 500GB that means keeping usage under **~350GB**, not the full ~455GB left after Ubuntu.

**Decision: buy the 500GB.** R$410 is 11% of the build to insure against a write rate above the
expected one, on the part that is by far the easiest to add to later.

At 60GB/day the entire drive turns over roughly every **8 days**. That is fine while there is spare
area for garbage collection, which is why the 70% ceiling matters more than the raw TBW figure — a
DRAM-less drive cycling weekly at 85% full behaves very differently from one at 50%.

> **Watch items — don't guess, the drive reports both.**
>
> ```
> df -h /                                    # keep under 70%
> sudo apt install smartmontools
> sudo smartctl -a /dev/nvme0n1 | grep -E 'Percentage Used|Data Units Written'
> ```
>
> `Percentage Used` is Kingston's own consumed-endurance estimate: 0 at install, 100 at rated TBW.
> Read it after **one month** of real benchmark runs — 2% means a ~4-year clock and a plan is
> needed; 0–1% means the 8-year path and it never needs thinking about again. `Data Units Written`
> × 512KB gives the exact byte count, so one month yields the true write rate.
>
> Past 70% full, `docker system prune`. If pruning stops holding it, *then* add storage — §7.
> Note the board has **10 SATA ports**: a cheap SATA SSD as a dedicated Docker data volume moves
> the write load off the boot drive with no reinstall and without touching the M.2.

**Also rejected:** SanDisk Plus 1TB R$919 and WD Green SN350 1TB R$932 — cheaper routes to 1TB, but
both are lower-endurance budget parts (the SN350 is rated **100 TBW**, *below* the 500GB NV3).

### RAM — the R$625 outlier came back (2026-09-10)

`HMA84GR7MFR4N` at **MLB54497897** (R$625, RAPOSAMG, Novo, 30-day free return) is **back in stock
with 15 units**. This is the listing that sold out on 2026-09-09; the doc's re-sourced replacements
(INFOUS R$760 / Roma Server R$834) are no longer needed.

Re-checked the whole 32GB DDR4-2400 ECC RDIMM market on 2026-09-10 — **R$625 is below every
comparable listing**, and the nearest things under R$700 are both used:

| R$650 *(usado)* | R$700 *(usado)* | R$799 *(usado)* | R$800 | R$850 | R$900 | R$930 | R$939 | R$990 |
|---|---|---|---|---|---|---|---|---|

The cheapest **new** SK Hynix elsewhere is R$1.400/stick, and a 2×32GB SK Hynix kit is R$2.633.
R$1.250 for the pair is the single best-bought item in the cart.

**This also settles the 128GB upgrade question.** 15 units in one lot means the second pair can come
from the same batch at the same part number — the thing §5 says to match. That is worth more than
the R$270 saved versus the R$760 cluster floor. Buying all four sticks now is **optional and
defensible**, but not urgent: the measurement below shows the market is flat, not rising.

**What actually changed on 2026-09-09 — measured, not assumed:** re-scraping the same search set 9h
apart gave **65 overlapping listings: 62 unchanged, 0 up, 3 down** (−22, −50, −72). The market did
**not** move. R$625 was a lone outlier below the live cluster; that lot sold out and the next rung
up became the visible floor. This was inventory depletion at the bottom tail, not a price rise —
an earlier revision of this doc wrongly claimed it was. Its return one day later confirms it.

**Retail channel re-checked and still empty:** KaBuM, Terabyte and Pichau return **zero** genuine
ECC RDIMM SKUs (their search falls back to unrelated UDIMM). Mercado Livre remains the only source.

**Rejected alternatives** (all above R$625, or used with a 12-day return window):
Samsung R$650 `(Usado)` · HPE SmartMemory R$700 `(Usado)` · Kingston 2400 CL17 R$799 `(Usado)` ·
Micron R$800 · Samsung `M393A4K40BB1-CRC` R$850 · Kingston `KTH-PL424/32G` R$939 ·
2×16GB kits (no cheaper per GB, and burns 4 of 8 DIMM slots).

### Alternates

**RAM** — see above. Every alternate is either used, or above R$625.

**SSD** — see §1.1 for the 1TB decision. Going *cheaper* is also rejected: the sub-R$600 512GB parts
(Keepdata R$575) have unstated or absent 3D NAND specs — wrong endurance profile for constant
Docker writes, and only ~R$115 saved.

### Case spec (Kalkan Alfern Lite KLK088)

Official page: https://www.kalkan.com.br/produto/alfern-lite

- Form factors: ATX / Micro-ATX / Mini-ITX, 7 horizontal expansion slots
- **Max air cooler height: 160 mm**
- Fan mounts: 3 × 120mm front, 1 × 120mm rear, 2 × 120mm bottom (6 total), ships with none
- Max GPU length: 306 mm
- Dimensions: 475 × 225 × 364 mm (H × W × D)
- Mesh front panel
- ML listing: ★4.8 (8 reviews), +100 sold

**Case alternate:** Clanm Smog Mid Tower sem fans — R$168, ATX, 7 slots, 7 fan mounts,
+1000 sold but 0 written reviews —
https://www.mercadolivre.com.br/gabinete-gamer-smog-mid-tower--sem-fans--placa-mae-atx/up/MLBU3955532409

**Cases that do NOT fit** (checked — Micro-ATX only, board is full ATX):
Kalkan Hakon KLK00080, PCYes Ozara Black Vulcan.

---

## 2. Cart audit and pre-order checklist — 2026-09-10

All 7 line items present, 10 units, **R$3.744,75** as audited; **R$3.755,75** after the PSU swap in §2.1. Every variant selection is correct.

| Item | Doc price | Cart | Δ | Verified |
|---|---|---|---|---|
| Kit X99-CH8 + E5-2680 v4 | R$1.048 | R$1.048,90 | — | Bundles of the same board+CPU *with* RAM run R$3.885–5.943, so the bare kit is priced right. **Listing shows "ÚLTIMAS 2"** |
| RAM ×2 SK Hynix 32GB RDIMM | R$1.520–1.668 | **R$1.250** | **−R$270** | R$625 ea, **15 units**, Novo, 30-day return — below every comparable listing (§1) |
| Cooler Maxcool MX-9201S | R$71 | R$74,95 | +R$4 | `Cor do LED: Sem Led` correctly selected |
| Case Kalkan Alfern Lite | R$157 | R$157,05 | — | Novo, +100 vendidos, ships with no fans as expected |
| Fans ×3 Thermalright TL-C12C | R$171 | R$179,70 | +R$9 | Spec sheet confirms **`Com iluminação RGB: Não`**, `Cor: Preto`, 4-pin, 1.550 rpm — the correct variant, not `-L` / `-S` |
| ~~PSU Gigabyte P650G 650W Gold~~ | R$317 | R$345,15 | +R$28 | **Replaced** — well priced, but delivery 17–18 Sep vs Tuesday for everything else. See §2.1 |
| SSD Kingston NV3 500GB | R$690 | R$689 | −R$1 | Keep — 1TB upgrade weighed and rejected (§1.1) |

### 2.1 PSU swapped — the Gigabyte was 5 days late (2026-09-10)

At checkout the **Gigabyte P650G (R$345, Terabyte oficial)** showed delivery **17–18 Sep**, while
every other part lands **Tuesday 15 Sep**. The PSU gates the whole build — nothing boots, and the
§5.2 memtest that has to happen inside the RAM's 30-day return window can't start without it. So a
late PSU makes every other delivery date irrelevant.

Every serious 650W Gold alternative beats Tuesday:

| PSU | Price | Δ | Seller | Arrives |
|---|---|---|---|---|
| *Gigabyte P650G (was in cart)* | R$345 | — | Terabyte oficial | **17–18 Sep** |
| **Cooler Master MWE Gold 650 V3** ← chosen | **R$356** | **+R$11** | JAYZSTORE (+100) | **Sun–Mon 13–14** |
| Cooler Master MWE V3 650W | R$386 | +R$41 | AUSTINNSTORE (+100) | Sun–Mon 13–14 |
| Cooler Master MWE Gold 650 V3 | R$404 | +R$59 | HELP SHOP (+100) | Fri 11 |
| MSI MAG A650GN II | R$407 | +R$62 | **Loja oficial Gigantec** (+500) | Sun 13 |

**R$11 to pull the PSU forward five days**, and the MWE Gold V3 is a better unit than the P650G
rather than a compromise — ATX 3.1, stronger platform than the budget-tier Gigabyte that Tom's
Hardware flagged for thermal limits under load.

**Fallback if the seller reputation matters more than R$62:** the MSI MAG A650GN II from an official
store (+500 vendas, real warranty channel, Sunday). Defensible on a PSU specifically — it is the one
component whose failure can take other parts with it.

> Delivery dates above were read logged-out. **Confirm against your own CEP at checkout** — the
> Tuesday estimate on the rest of the build suggests this address reads slower than the default.

Unchanged by the swap: still non-modular (same cable-routing note below), still 24-pin + 8-pin
EPS12V, still bivolt, still ~38% load at the build's ~250W peak.

**Revised total: R$3.755,75.**

**Two things to know, neither a reason to change anything:**

1. **The PSU is non-modular** (true of the Gigabyte and of the Cooler Master replacing it). With no GPU in this build, that is a full harness of unused PCIe
   and SATA cables to hide somewhere. It matters more here than usual, because the cooler is
   marginal (§5.1) and the RDIMMs have no heatspreaders (§5.3) — airflow is doing real work. Plan
   the cable routing behind the tray rather than bundling it in front of the intake.
2. **The kit shows "ÚLTIMAS 2".** It is the only single-sourced part with no equivalent at this
   price; the RAM, SSD, PSU, case and fans all have live alternatives. If the order gets split,
   let this be the one that goes through first.

### Before ordering — checklist

- [x] ~~Message the RAM seller: confirm 4+ units in stock~~ — listing shows **15 units** as of 2026-09-10, enough for the 128GB pair from the same batch
- [x] ~~Confirm with cooler seller: ships with the LGA2011 bracket~~ — **settled from the listing**,
  no message needed. Description: *"Acompanha Base para Intel X79 X99 X299 (LGA 2011, LGA 2066) +
  Parafusos"*; specs list `Intel LGA 2011, Intel LGA 2011 v3` under CPU sockets and
  `Acessórios incluídos = Parafusos, Suportes`.
- [ ] **On arrival:** confirm the box is the `Sem Led` variant. The listing *description* says
  "com iluminação por LEDs" — that is generic parent text across variants, and the spec table says
  `Com iluminação RGB = Não`, but check inside the return window.
- [x] ~~Case cooler clearance~~ — confirmed 160mm by Kalkan spec sheet
- [x] **Video for install only** — monitor has a VGA (D-Sub) input, so a plain **VGA male-male cable**
  is all that's needed. Bought ~R$21, 1.8m, blindado com filtro ferrite. No converter, and none of
  its risks.
  <details><summary>If a future monitor lacks VGA — the converter trap, recorded</summary>

  VGA is analog and HDMI digital, so **no passive adapter works** — it must be an active converter.
  `HDMI→VGA` adapters are commoner and cheaper and will *not* work backwards; the listing must read
  *VGA macho → HDMI fêmea*. Buy one with a USB power lead and prefer a known brand (Benfei ~R$61)
  over no-name R$27–31 units: cheap converters often fail to sync at BIOS POST timings
  (~720×400 @ 70Hz) and stay black until the OS loads — exactly when it's needed, to set boot order
  and confirm RAM training.
  </details>
- [ ] **USB keyboard** for BIOS + installer (no mouse — Ubuntu Server's installer is keyboard-only).
  Connect the monitor *before* first power-on to catch POST.

---

## 3. Why this configuration

### Workload sizing

Each Harbor job uses **2 threads**. Realistic ceiling: **12 concurrent** (8 batch + 4 validation).

- 12 jobs × 2 threads = **24 of 28 threads** — saturates the CPU, leaves ~4 threads for the
  Docker daemon, I/O and host. Running at literally 100% occupancy makes benchmark timings noisy.
- Typical task footprint is 2–4GB, some 6–8GB.

| Per-task RAM | 12 jobs | + host | Fits 64GB? |
|---|---|---|---|
| 2GB | 24GB | 28GB | Yes, easily |
| 4GB | 48GB | 52GB | **Yes — ~12GB spare** |
| 6GB | 72GB | 76GB | No — drop to ~10 jobs |
| 8GB | 96GB | 100GB | No — drop to ~7 jobs |

At the typical 2–4GB you land at 28–52GB with headroom. Leftover RAM isn't wasted — Linux uses it
as page cache for Docker image layers, which speeds up launching the same image 12 times over.

**64GB matches this CPU.** Buying 128GB now would pay for RAM the thread count prevents you from
using on the tasks you actually run.

### Why 2 × 32GB and not 4 × 16GB

Same money (R$1,300 vs R$1,430), but 2 × 32GB leaves 6 slots free — path to 128GB and then 256GB.
4 × 16GB dead-ends at 128GB with all 8 slots full and downclocked to 2133/1866.

Tradeoff accepted: two sticks = **dual-channel** (~38 GB/s instead of ~77 GB/s). Not a real
constraint for container workloads, which are bound by CPU and page-cache/disk, not stream bandwidth.

---

## 4. Compatibility — verified

| Interface | Status |
|---|---|
| CPU ↔ board | E5-2680 v4 is LGA2011-3 Broadwell-EP; CH8 supports E5 v3/v4. Pre-tested kit, BIOS already v4-capable |
| RAM ↔ board | CH8: 8 slots, quad-channel, DDR4 2400/2133/1866, RECC supported, 256GB max |
| RAM ↔ CPU | `M393A4K40BB1-CRC` = 32GB **2Rx4 PC4-2400T RDIMM**. Runs 2400 at 1 DIMM/channel |
| Cooler ↔ socket | Listed `CPU sockets: 2011`, line "X79/X99" = square ILM. Includes thermal paste |
| Cooler ↔ RAM | **Revised:** the MX-9201S is a **92mm** cooler (§5.1), not the 128mm tower assumed earlier, so it should clear the DIMM slots outright. Even if it shadows the nearest bank, server RDIMMs are flat (no tall heatspreaders) — the classic X99 trap doesn't apply. RAM can go in after the cooler is mounted; if the near slot is awkward, populate two slots further out (§5 needs different channels, not specific ones) |
| Cooler ↔ CPU | MX-9201S is rated **115W vs the CPU's 120W** — under spec. See §5.1 |
| Board ↔ case | CH8 is ATX 300×244mm; Alfern Lite supports ATX, 7 horizontal expansion slots |
| Cooler ↔ case | Alfern Lite is rated **160mm max air cooler**. MX-9201S is well under; the 154mm 4-heatpipe alternative also fits |
| PSU ↔ board | Board needs 24-pin ATX + one 8-pin EPS12V; MWE Gold 650 V3 has both |
| PSU ↔ load | ~250W peak on a 650W unit = ~38% load, near the efficiency peak, fan stays slow |
| PSU ↔ mains | Bivolt 127/220V |
| SSD ↔ board | NV3 is M.2 2280 PCIe 4.0 x4; board M.2 is key-M PCIe **3.0** x4. Backward compatible, runs Gen3 (~3,000 MB/s). Board boots NVMe |
| Fans ↔ case/board | 120mm 4-pin PWM; case has 7 mounts, board has 4-pin headers |

### Board spec reference (Huananzhi X99-CH8)

- Socket LGA2011-3, ATX 300×244mm, 10-layer PCB, 6-phase VRM
- 8 × DDR4 DIMM, quad-channel, 2400/2133/1866, max 256GB, RECC + non-ECC
- 1 × PCIe 3.0 x16, 2 × PCIe 3.0 x8, 1 × PCIe 2.0 x4
- 1 × M.2 2242/2260/2280 key-M NVMe PCIe 3.0 x4, 1 × U.2 x4 3.0
- 6 × SATA3 + 4 × SSATA3 (10 total)
- 2 × Realtek gigabit RJ45, 1 × VGA (ASPEED), Realtek ALC892 audio
- Official specs: https://www.huananzhi.com/en/list_6/59.html

### Why the X99-CH8 and not a cheaper 4-slot board

The 8 DIMM slots are **not** the main reason. 128GB only needs 4 slots (4 × 32GB), and 4 × 32GB is
one DIMM per channel on either board, so speed is identical. The real reasons:

1. **Onboard ASPEED VGA.** Xeon E5 v3/v4 have no iGPU, and the cheap 4-DIMM X99 boards
   (Machinist, Qiyida, JGINYUE) have **no video output at all** — they require a discrete GPU just
   to reach the BIOS. A GPU is R$200–400, occupies a PCIe slot, draws 10–30W whenever the machine
   is on, and usually adds a fan. That wipes out most of the ~R$300–450 saved on the board, and
   works against a quiet headless box.
2. **VRM and PCB.** 10-layer PCB, 6-phase power — matters for a 120W CPU at sustained load
   10–14h/day, and more so for the 145W E5-2699 v4 upgrade path.
3. **I/O.** 10 SATA + M.2 NVMe + U.2 + 3 spare PCIe slots (the 2nd-NVMe plan), 2 × gigabit NIC.
4. **256GB ceiling keeps the CPU upgrade coherent.** The E5-2699 v4 step means 22 concurrent jobs;
   at 6–8GB/task that's 132–176GB, which is past what a 4-slot board can hold.

Net: roughly cost-neutral once a GPU is priced in, and better on noise, power and expansion.

---

## 5. RAM installation

Install the two sticks in **different channels**. Check the silkscreen for `A1`/`B1`-style labels
and populate two different letters. If slots are only numbered, don't use two adjacent slots.


**Buying the sticks:** get **DDR4-2400**, 32GB, **2Rx4**, RDIMM (REG ECC), listed as `Novo` with a
30-day return — not a used listing with a 12-day window. Current market and rejected options: §1.

**In cart:** `HMA84GR7MFR4N` — SK Hynix 32GB **2Rx4** PC4-2400T RDIMM, 2 units, R$625 ea,
listed as **Novo**, seller RAPOSAMG (+500 vendas), **30-day free return**, Compra Garantida.

For the second pair, match **2Rx4 / DDR4-2400**. Same-brand SK Hynix is tidiest; mixing brands at
identical rank and speed is fine for RDIMMs. Equivalent parts: Samsung `M393A4K40CB1-CRC0Q` /
`M393A4K40BB1-CRC`, Micron `MTA36ASF4G72PZ-2G3`.

> Even on a `Novo` listing, **test on arrival inside the 30-day window** — see §5.2.

**Rejected:** see the table in §1 — everything on the market is either above R$625 or used with a
12-day return window. Also rejected: OLX R$650 (seller with 0 completed sales).

**Buy DDR4-2400, not 2133.** The downclock I mention below is a *configuration* effect (2 DIMMs
per channel), not a module property. At 2 sticks and at 4 sticks you run 1 DIMM per channel and get
the full 2400. A 2133 module is capped at 2133 permanently and can never run faster. Mixing speeds
forces *every* stick to the slowest one, so a 2133 purchase today would cap the second pair too.
At the time of writing the 2133 part (`M393A4K40BB0-CPB`, R$655) was actually R$5 *more* than the
2400 part anyway.

Verify after boot:

```
sudo dmidecode -t memory | grep -E 'Locator:|Size:|Speed:'
```

Expect two populated locators, different channels, both at 2400 MT/s.

### 5.1 Cooler — this is the weak part of the build

The **Maxcool MX-9201S** (R$75) is in the cart because the better option is out of stock and the
build needs to happen. Know what you're getting:

- 2 heatpipes, **rated 115W against a 120W CPU** — under spec
- **92mm fan** at 2.200 rpm, not 120mm. The "120mm" in the listing title is the cooler's *height*
  (`Largura = 92 mm`, `Altura = 120 mm`, description: "ventoinha de 92mm"). An earlier revision of
  this doc called it a 120mm cooler — wrong.
- Non-RGB (`Com iluminação RGB: Não`), 4-pin PWM, includes paste and the LGA2011 bracket, 77 CFM
- Claimed `14 dB` at 2.200 rpm is not a credible figure for a 92mm fan
- ★4.8 (8 reviews), 1000+ sold

**Why the 92mm matters:** a 92mm fan must spin far faster than a 120mm to move the same air, and
noise scales steeply with RPM. This raises the odds of ending up on the replacement path below —
budget the R$399 Coolserver mentally rather than being surprised by it. It also raises the value of
the three TL-C12C case fans (§5.3): the more air the case feeds this cooler, the less it has to
scream for it.

Preferred replacement when stock returns — 4 heatpipes, 130W, 154mm, non-RGB, R$135:
https://www.mercadolivre.com.br/cooler-processador-xeon-lga-2011-x79-x99-4-heatpipes-120mm/up/MLBU4791260944

**Rechecked 2026-09-10: still `publicação pausada`.** The LGA2011 cooler market is thin — below
R$100 everything is the same generic 2-heatpipe unit (mostly RGB variants of it), and the next
genuinely better *in-stock* part is a jump:

| Option | Price | Note |
|---|---|---|
| **Coolserver LGA2011/2066** | R$399 | 90–130W, 25–40 dB, explicitly LGA2011 — the real step up |
| Cooler Master Hyper 212 EVO (X79/X99) | R$585 | Known-good, well over budget |
| Storm 8-heatpipe 280W | R$699 | Overkill |
| Thermalright Assassin X 120 R | R$229 | **Does not fit** — LGA1700/1200/115x/AM4/AM5 only, no 2011 |

Conclusion unchanged: keep the R$75 Maxcool, run the temperature test below, and buy the Coolserver
only if it actually throttles or is audible. Do not pay R$324 up front for a problem that may not
appear.

**Check temps on the first heavy run:**

```
sudo apt install lm-sensors && sudo sensors-detect --auto
watch -n1 sensors
grep MHz /proc/cpuinfo | sort -u          # all-core clocks under load
```

Judging it: under sustained 12-job load, package temps holding **under ~80°C** with all-core clocks
at or above 2.4GHz base = fine, keep it. Pinned at 90°C+ with clocks dropping below base = it's
throttling, replace it. Loud enough to annoy you in the office is also a valid reason to replace it.

Mitigations that help a marginal cooler: populate the **3 front intake mounts** on the Alfern Lite
(a third TL-C12C is R$57), and keep the front mesh filter clean.

**Rejected alternatives:** Fortrek AC13 (`RGB: Sim`, 32 CFM, 2 sold); the R$89 160W LGA2011 unit
(RGB); the R$74 X99 unit (RGB Led).

### 5.1.1 Thermal paste — the bundled sachet is a backup, not the plan

The cooler **does** include paste (`Inclui pasta térmica = Sim`; description: *"No seu pedido ira um
sache de pasta térmica a base de Prata (Silver)"*), and some units ship with it **pre-applied** as a
grey patch on the copper base — check before wiping anything off. But buy a proper syringe anyway:

**Bought: Thermal Grizzly Hydronaut 1g, 11.8 W/mK — R$42**, arrives next day —
https://www.mercadolivre.com.br/pasta-termica-thermal-grizzly-hydronaut-high-performance-1g/p/MLB27050221

| Alternative | Spec | Price | Note |
|---|---|---|---|
| Thermalright TF7 2g | 12.8 W/mK | R$39 | First pick, but delivery slipped to Tuesday |
| Arctic MX-4 4g | 8.5 W/mK | R$83 | Industry workhorse |
| Arctic MX-6 4g | — | R$104 | |
| Generic silver sachet | ~1–3 W/mK | R$19 | What's bundled with the cooler |

**On the 11.8 vs 12.8 W/mK gap — ignore it.** There is no standardized industry test for thermal
conductivity, so the figures are not comparable across brands; each vendor measures its own way.
Independent testing puts the spread between any two good pastes under ~2°C and usually under 1 —
undetectable on a cooler limited by a 92mm fan and two heatpipes.

Two properties that genuinely favour the Hydronaut here:

- **Electrically non-conductive and non-capacitive.** Spreading a layer across a 52×45mm IHS with a
  card makes squeeze-out onto the LGA2011 socket a real possibility. Non-conductive makes that a
  cleanup job rather than a dead board.
- **Silicone-free** — won't bleed oil into the socket over years of thermal cycling.

**The real tradeoff is quantity, not performance: 1g vs the TF7's 2g.** An IHS this size takes
~0.4–0.5g per mount, so 1g is about two applications — install plus one remount. If both the cooler
swap (§5.1) and the E5-2699 v4 upgrade (§7) happen, budget another tube.

Why it's worth R$39 here specifically:

1. **LGA2011 has a large IHS.** The E5-2680 v4 heat spreader is roughly 52×45mm — close to double a
   consumer LGA1151 chip. Bundled sachets are sized for consumer CPUs and can genuinely fall short
   of full coverage.
2. **The cooler is already the weak part** (§5.1). Bundled "silver" paste runs ~1–3 W/mK against the
   TF7's 12.8. A few degrees is exactly what decides the keep-or-replace verdict — test the cooler on
   its merits, not handicapped by its own sachet.
3. **More than one mount is likely** — a cooler swap, and the E5-2699 v4 upgrade. A syringe covers
   several; the sachet is one-shot.

**Application:** on an IHS this large, spread a thin even layer with a card rather than the
single-centre-dot method. A dot sized for a consumer chip will not reach the corners under this
cooler's modest mounting pressure.

### 5.2 Test the RAM on arrival — before the return window closes

Used ECC modules are usually fine, but verify while you can still return them. Do this before
installing the OS.

**Step 0 — read the labels before anything else (do this the day they arrive).** Cheaper than any
other check and far easier to act on before installation:

| On the label | Want | Red flag |
|---|---|---|
| Rank/width | **`2Rx4`** | `4Rx4` = LRDIMM, **will not work**; `1Rx4` / `2Rx8` = not what was ordered |
| Speed code | **`PC4-2400T`** | `PC4-2133P` — the whole §5 argument for buying 2400 dies here |
| Part number | `HMA84GR7MFR4N-UH` | (`AFR4N-UH` is fine — A vs M is die revision, both 2400 RDIMM) |
| Both sticks | **identical part numbers** | A mismatched pair is the defect most worth returning, since the 128GB upgrade depends on matching this pair |

Also confirm they look genuinely new — clean gold contacts, no scratched or relabelled stickers, no
thermal residue or dust in the notches. They were sold as `Novo`; server pulls look different.
**Photograph both labels before installing.** A photo taken pre-installation makes any return
conversation short. Handle by the edges; leave them bagged until the board is ready.

Ubuntu's installer USB includes memtest86+ in the GRUB menu, or boot it standalone. **Run at least
one full pass; overnight is better.** Zero errors is the only acceptable result.

Once Ubuntu is up, confirm ECC is actually active and reporting:

```
sudo dmidecode -t memory | grep -E 'Locator:|Size:|Speed:|Type:'
sudo apt install edac-utils && sudo edac-util -v
```

Expect both sticks at 32GB / 2400 MT/s in different channels, and EDAC reporting no corrected
errors. A slow trickle of corrected errors on one DIMM means that stick is dying — return it.

### 5.3 Case fans — not optional in this build

**The Alfern Lite ships with zero fans.** Without them the only air movement in the case is the CPU
cooler and the PSU, which means the cooler recirculates its own exhaust.

That matters more here than in a typical build, for four reasons:

1. **The CPU cooler is already marginal** (§5.1) — 115W rated against a 120W CPU. A tower cooler is
   only as good as the air the case feeds it. Starving it guarantees the throttling you're trying
   to avoid.
2. **Server RDIMMs assume chassis airflow.** They have no heatspreaders (which is why the cooler
   clears them) because they're designed for front-to-back airflow in a rack chassis. In a still
   desktop case they run hot — and worse once all 8 slots are populated.
3. **Sustained duty cycle.** 10–14h/day at full load, not gaming bursts. Thermal margin is what
   buys you VRM, capacitor and DIMM lifespan.
4. **Noise — fans make it quieter, not louder.** Two 120mm fans at low RPM move more air than one
   small fan at high RPM. With no intake, the CPU fan has to scream for every bit of air.

**Minimum: 2 fans** (1 front intake + 1 rear exhaust) = R$114.
**Better: 3 fans** (2 front intake + 1 rear exhaust) = R$171 — recommended given the weak cooler.

Set front intake slightly stronger than rear exhaust for positive pressure, which keeps dust out
through the mesh filter rather than every seam in the case.

Cheaper generic 120mm fans exist at ~R$22, but sleeve bearings are louder and die sooner — a poor
trade on a machine that runs most of the working day beside you.

---

## 6. OS and setup — headless

**`cassandra` — Debian 13 "trixie" (13.7). No desktop environment.** Installed 2026-09-14 over PXE.

Reasons for headless: a DE costs 1.5–2GB RAM and background CPU on a machine bought for memory
headroom; the only video out is VGA; Harbor is pure CLI + Docker; and headless means the box can
live in another room, which solves noise entirely.

**Why Debian over Ubuntu** (changed from the original plan): no snapd, no Pro motd nags, leaner
base. Ubuntu's kernel-freshness advantage is moot on 11-year-old Broadwell silicon. Fedora was
rejected separately — SELinux on bind mounts adds benchmark noise, the ~13-month lifecycle means
churn, and firewalld/Docker friction.

**As built:**

| | |
|---|---|
| OS | Debian 13.7 trixie, netinst over PXE |
| Hostname | **cassandra** — reach it with `cassandra` / `cass` (`~/bin/cassandra` finds it by MAC, no fixed IP needed) |
| Address | `192.168.1.22` — MAC `00:e0:4c:b6:04:ad` |
| SSH | OpenSSH 10.0p2, `openssh-server` selected at install |
| Installed tasks | SSH server + standard system utilities **only** |
| Partitioning | guided, entire disk, **all files in one partition** — a fixed-size `/var` is how a Docker host wedges itself |
| Firmware | `rtl_nic/rtl8168h-2.fw` prompt skipped at install (no media, and the NIC works without it). Fix after: `sudo apt install firmware-realtek` |

Remaining steps:
1. Copy your SSH key over, install Docker
2. Unplug the VGA — everything else over SSH
3. Optional: Tailscale for access from outside the LAN
4. Use Cursor / VS Code **Remote-SSH** for editing and terminals

This is not a one-way door — `apt install task-xfce-desktop xrdp` later is a 5-minute job if a
concrete need shows up.

### Testing web projects from your desktop

```
ssh -L 3000:localhost:3000 you@buildbox
```

Then open `http://localhost:3000` in your normal browser. The `localhost` resolves on the *remote*
side, so this works with dev servers bound to 127.0.0.1 — no `--host` flags needed.

- Cursor / VS Code Remote-SSH forwards detected ports automatically, with a clickable link
- If the dev server runs **inside a container**, publish the port to the host first (`-p 3000:3000`)
- Tailscale alternative: browse `http://buildbox:3000` directly, no tunnel command

The handoff between machines is a **Docker image, not a GUI session** — build the task image during
exploration, run it locally to poke at it, then run the same image at scale here. Environment
identical by construction, which is what you want for a benchmark.

### Container hygiene

Set explicit memory limits per container:

```
--memory=4g
```

Stops one ballooning run from OOM-killing its neighbours, and makes benchmark runs deterministic.
An unbounded container isn't really a controlled benchmark.

For the 6–8GB tasks, a tuning pass is worth real throughput (8GB → 4GB takes a task from 7-wide to
14-wide). Usual suspects:

- `ES_JAVA_OPTS=-Xms512m -Xmx512m` — Elasticsearch/OpenSearch grabs a big default heap
- `innodb_buffer_pool_size=256M` — MySQL sizes this generously
- lower `pm.max_children` on PHP-FPM

Not worth doing for the 2–4GB tasks — those are already CPU-bound.

---

## 6.5 Delivery contingency — RAM (2026-09-13)

**Resolved — RAM delivered 13 Sep.** The courier located the package on the van later the same day.
30-day return window runs from 13 Sep. Remaining for 14 Sep: board+CPU kit and thermal paste.

*Original note, kept for reference:* RAM was out for delivery 13 Sep but the courier could not
locate the package in the van. This is routine — the normal outcome is redelivery the next business
day, and ML holds the seller responsible regardless. Tail cases that were being watched for:

- **Tail risk: a false `Entregue` scan.** Couriers sometimes close a route by marking an unfound
  package delivered. If tracking flips to delivered and nothing arrived, report it **the same day** —
  Compra Garantida covers non-delivery and the claim is far cleaner opened promptly.
- **Fallback cost if genuinely lost:** the R$625 RAPOSAMG listing has dropped out of search again.
  Cheapest same part now **R$700/stick** (MLBU5155302479), catalog MLB19157306 at R$760. Re-buying
  the pair costs ~R$150 over what was paid.
- **The delay costs no build time.** Do the full mechanical assembly on 14 Sep without RAM — CPU,
  paste, cooler, board into case, PSU, SSD, three fans, all cabling. RAM drops in on arrival and goes
  straight to POST + memtest (§5.2).
- The 30-day return window starts at **delivery**, so a late arrival costs none of the memtest window.

---

## 6.6 Assembly and install — what actually happened (2026-09-14)

Assembled open-bench on cardboard, then eight hours lost to a fault chain. Recorded because almost
none of it is guessable from the parts list.

### The defect: one dead DIMM slot

**The second Main Channel slot is dead.** A stick in it hangs POST at code `b7` every time; the
same stick works in neighbouring slots. Confirmed by swapping both sticks through it. Currently
running 64GB with one stick in a Main slot and one in a Secondary.

**Decision 2026-09-14: keeping the board. The 128GB path is not blocked.** Each of the four
channels has two slots and only one slot died, so every channel still has a working slot — four
sticks, one per channel, remains achievable. The obvious worry, that the dead slot is a primary
(Main ①) leaving only a Secondary ② on that channel, is already disproven in practice: the machine
runs a stick in a Secondary slot right now at full 2400 MT/s in dual-channel, so this board
tolerates secondary-only population.

Weighed against that, a return means redoing the whole assembly and losing days. Everything else on
the board works: CPU, socket, and full training on 64GB of RDIMM are all proven.

**Before buying the upgrade RAM**, move one existing stick to an Ha#1 slot and confirm
`/sys/devices/system/edac/mc/mc1/size_mb` goes non-zero — that costs ten minutes and proves the
four-channel population before money is spent.

**Resolved 2026-09-14 — the slot shuffle cost nothing.** EDAC reports:

```
mc0  [Broadwell SrcID#0_Ha#0]   size_mb = 65536   dimm0, dimm1
mc1  [Broadwell SrcID#0_Ha#1]   size_mb = 0
```

The E5-2680 v4 has two home agents, two channels each. Both sticks sit on Ha#0 as dimm0/dimm1 —
**different channels**, so it runs **dual-channel at 2400 MT/s**. That is all two sticks can give;
quad-channel needs four.

**But Ha#1 is entirely unpopulated**, so the 128GB upgrade needs two sticks to land there. Before
buying more RAM, move one existing stick to an Ha#1 slot and confirm `mc1/size_mb` goes non-zero —
that proves the dead slot isn't the only usable primary on its channel.

### ECC is live — this is why memtest is optional

`sb_edac` is loaded and both controllers report. Continuous hardware error detection during real
work beats a one-off memtest pass, so the §5.2 memtest was **deliberately skipped**.

```
mc0: CE=0 UE=0     mc1: CE=0 UE=0
```

Check counts with `cat /sys/devices/system/edac/mc/mc*/ce_count`, but note those sysfs counters are
**live driver state and reset to zero on every boot** — `CE=0` shortly after a reboot means "nothing
since boot", not "this RAM is clean".

**`rasdaemon` installed and enabled 2026-09-18** — this is what makes the count meaningful. It
persists events across reboots to `/var/lib/rasdaemon/ras-mc_event.db` and names the offending DIMM:
`sudo ras-mc-ctl --summary` / `--errors`. Before that date the box kept **no correctable-error
history at all**, so nothing prior to 2026-09-18 was recorded.

**Why it matters on this board specifically:** with one dead DIMM slot already (above), DIMM-level
attribution is what distinguishes a bad stick from a bad slot — needed before buying the two Ha#1
sticks for the 128GB path.

### Board facts the parts list doesn't carry

| | |
|---|---|
| **Onboard power + reset buttons** | Bottom edge, right of JUSB3.0. No need to jump F_PANEL pins at all |
| **Pin 1 is on the RIGHT** | Marked by a bold white line. Every jumper and header reads **right-to-left** — this cost hours of reading JCMOS/JVGA/JPWR1 backwards |
| **Jumpers as shipped** | JCMOS, JVGA, JPWR1 all on **1-2** = correct. Nothing needed moving |
| **DIMM naming** | Not A1/B1 on the silkscreen diagram — **Main Channel ① / Secondary Channel ②**. Counting **outward from the CPU** each bank runs Secondary, Main, Secondary, Main, so the Main slots are the **2nd and 4th out** |
| **Video chip** | ASPEED AST2300, near the CR2032. **Onboard VGA confirmed working** — a discrete GPU was borrowed during debugging and removed again; none is needed |
| **F_PANEL1** | 1/3 HDD_LED± · 2/4 PWR_LED± · **5+7 RESET** · **6+8 PWR_SW** · 9 KEY · 10 N.C |

### Thermal — first load test (2026-09-14, open bench)

**The bundled cooler sachet is good enough. Hydronaut not used — kept for the next remount.**

`stress-ng --cpu 28` for 4 min, open bench, read via `lm-sensors` / `coretemp`:

| | |
|---|---|
| Cores under full load | **53–59°C**, flat at 4 min |
| Limits | `high` 90°C · `crit` 100°C → ~30°C headroom |
| NVMe | 32.9°C composite (crit 79.8°C) |
| Noise | low at full load |

**`Package id 0` and `Core 0` are unreliable under load.** During the first load test they read
~25–30°C *below* the other cores, which is physically impossible on one die. At idle they are
perfectly consistent (all cores 23–25°C, package 28°C, correctly above the cores). So they are not
broken sensors — they misreport under load. Trust the core cluster when the machine is busy. Also normal: **Core 7 doesn't exist** — Broadwell-EP core IDs
aren't contiguous, this chip numbers its 14 cores 0–6 and 8–14.

The BIOS CPU temp reading is not trustworthy either — it showed 19°C, below room temperature.

**Closed-case test, 2026-09-14 — the cooler stays. §5.1 is settled.**

Fully assembled, 2 × 120mm front intake + 1 × 120mm rear exhaust, `stress-ng --cpu 28` for the full
10 minutes:

| | |
|---|---|
| Peak, closed case | **63°C** |
| Open bench, same load | 53–59°C |
| Cost of the case | ~4°C — the fan config is working |
| Headroom | 27°C to `high` (90°C), 37°C to `crit` (100°C) |

**Verdict: the R$75 Maxcool is adequate for the E5-2680 v4 and stays.** Revisit only on the
E5-2699 v4 upgrade (145W against a 130W-rated cooler — see §7).

### Final fan configuration — 2 fans beat 3 (2026-09-14)

Settled empirically. **Two fans outperform the original three**, because a rear exhaust continues the
CPU cooler's airflow path (cooler blows toward the rear I/O) while a second front intake only
pressurised a case with no strong outlet.

| Position | Header | Control | Notes |
|---|---|---|---|
| Front bottom intake | `SYS_FAN1` / `pwm1` | automatic, ramps 432 → 691 RPM | near-silent |
| Rear exhaust | uncontrolled header | constant 12V | the remaining noise source |
| CPU cooler | `CPU_FAN` / `pwm2` | automatic | |

**Measured peak, `stress-ng --cpu 28`, closed case:**

| Configuration | Peak |
|---|---|
| 2 front intake + 1 rear exhaust (original) | 63°C |
| 1 controlled intake only | 71°C |
| **1 controlled intake + 1 rear exhaust (final)** | **61°C** |

Against `high` 90°C / `crit` 100°C — 29°C of headroom. Add roughly degree-for-degree for a hotter
room; if it ever exceeds 80°C, put a second fan back.

**Closed 2026-09-18 — not needed.** Dropping to 2 fans (above) took the temperature *and* most of
the noise with it, so the low-noise adapter cable on the rear exhaust was never fitted and the PWM
splitter this was heading toward is moot. See "Fan control settled" below.

**DIMM temperatures could not be measured.** `jc42` won't bind — on this board the DIMM SPD/TSOD bus
sits behind the memory controller, not on the PCH SMBus exposed as `/dev/i2c-0,1`. Accepted because
only 2 of 8 slots are populated, so heat density is a quarter of design. **Use ECC as the proxy:**
thermal stress produces correctable errors before failures, so a rising CE count in
`ras-mc-ctl --summary` is the signal to add airflow back. **Revisit at 128GB** — four sticks doubles
the heat and closes the convection gaps.

### Fan headers — only two of them actually work (2026-09-14)

**The X99-CH8 wires only 2 of the nct6779's 5 PWM channels.** Established by measurement: plugging a
fan into `SYS_FAN2/3/4` produces no tachometer reading on any channel, and those headers ignore duty
cycle changes entirely. They supply constant 12V.

**Corroborated externally** — this is a known pattern across Chinese-market X99 server/mining boards:
only CPU_FAN and one designated system fan header support regulation, the rest run at constant 12V.
So this is the board class behaving as designed, not a firmware misconfiguration or a faulty unit.
(Measurement alone could not have distinguished "pins not routed" from "pin functions not enabled by
BIOS" — both give identical symptoms. The external report is what settles it.)

| Header | hwmon channel | Control |
|---|---|---|
| `CPU_FAN` | `pwm2` | full PWM + tach |
| `SYS_FAN1` | `pwm1` | full PWM + tach |
| `SYS_FAN2/3/4` | — | **constant 12V, no tach, no PWM** |
| — | `pwm3/4/5` | channels exist in the chip, routed to nothing |

**Consequence as originally planned: all case fans share `SYS_FAN1`** via a PWM splitter or a
SATA-powered hub (~R$20–50), reporting only one fan's tach. **Moot as of 2026-09-18** — the splitter
would have worked, there is simply nothing left to split at 2 fans. See "Fan control settled" below.

**Getting software control at all needs `sudo modprobe nct6775`** — the module is not autoloaded.
It binds as `nct6779` and appears as `hwmon2`. It is **not loaded on the running system** and was
deliberately never made permanent, because software fan control is no longer used.

Gotchas found along the way:

- **A fan at its minimum RPM looks like a broken header.** `pwm1` commanded to duty 0 stayed at
  432 RPM — that fan simply cannot spin slower. It is controlled; it was already at the floor.
- **`SYSTIN` reads +119°C with an ALARM, and `AUXTIN1/2/3` read 127°C.** Unconnected thermistor
  inputs reading maximum. Ignore them; never curve a fan against `SYSTIN` on this board.
- All channels ship as `pwm_mode = 1` (PWM, not DC), so that is not the problem when a fan
  won't respond.

### Fan control settled — the firmware default is enough (2026-09-18)

**Nothing further to do here.** Two headers regulate, as measured above — `CPU_FAN`/`pwm2` for the
cooler and `SYS_FAN1`/`pwm1` for the one case fan that can be driven. Everything else is constant
12V and always will be. Turning off the second front intake dropped both the peak temperature and
most of the noise (the 2-fans-beat-3 result above), and what remains runs near-silent on its stock
BIOS curve at 61°C peak with 29°C of headroom.

**Not needed — none of these failed, they are simply unnecessary at 2 fans:** the PWM splitter, the
low-noise adapter cable, the `modules-load.d` persistence for `nct6775`, and the plan to program a
curve into the chip itself (`pwm1_auto_point{1..5}_{pwm,temp}`, `pwm1_temp_sel`, `pwm1_floor`,
`pwm1_target_temp`). The firmware default already lands where a hand-tuned curve would, and it
survives reboots for free with no OS involvement. `nct6775` is **not loaded on the running system**
and does not need to be.

**`~/cassandra-fans.sh` on the desktop is dead code** — it drives `pwm3/4/5`, which are routed to
nothing, and its `hwmon2` guard fails regardless now that `nct6775` is not loaded. Retired.

**What serves as the thermal signal instead:** the ECC correctable-error count (above) and spot
checks under load. **Revisit only at 128GB or on the E5-2699 v4 step** (§7), where four sticks and a
145W part change the heat picture — that is when the splitter question could legitimately come
back.

### The manual

**Huananzhi does not publish an X99-CH8 manual** — it is absent from their own index at
`huananzhi.com/en/list_21/`, which lists ~100 other boards. A 15-page PDF exists and was found by
hand. ManualsLib and manuals.plus both sit behind Cloudflare challenges that no automation gets
through; open them in a browser.

**The PDF defeats text search.** It uses a subset font with a **+31 character shift** — `4;)6"/"/`
is `SZHUANAN`. Nothing matches until decoded:

```python
''.join(chr(ord(c)+31) if 0x20 <= ord(c) <= 0x7e else c for c in text)
```

Local copy: `~/Downloads/x99-ch8-manual.pdf`. It documents exactly one jumper (CLR-CMOS, location
only) and has **no POST-code table and no troubleshooting section**.

### POST codes (standard AMI Aptio — confirmed on this board)

The two-digit display is accurate and worth trusting. Validated by pulling RAM and watching it
change correctly.

| Code | Meaning |
|---|---|
| `53` | Memory initialization error — no usable memory detected |
| `AD` | Ready To Boot — POST complete, handing off |
| `AE` | Legacy Boot event — fell through, nothing bootable |
| `b7` | Configuration Reset (NVRAM) — **what a dead DIMM slot produced here** |
| `FF` | Not executing — on this board, missing EPS 12V CPU power |

A black screen after the manufacturer logo with `AD` showing is **normal** — it means POST
succeeded and control passed to a boot device that produces no output.

### PXE install — the two real gotchas

Installed with `~/pxe-debian.sh` (dnsmasq proxy-DHCP + TFTP, Debian's `netboot.tar.gz`). Teardown:
`sudo bash ~/cleanup-pxe.sh`.

**1. Proxy-DHCP mode ignores `dhcp-boot`.** The man page is explicit: in proxy mode dnsmasq serves
only what `--pxe-prompt` and `--pxe-service` provide. With `dhcp-boot` alone, dnsmasq logs the
client's request and then says nothing back. Required instead:

```
pxe-prompt="Booting Debian installer",1
pxe-service=BC_EFI,"Debian installer (UEFI)",debian-installer/amd64/bootnetx64.efi
pxe-service=x86-64_EFI,"Debian installer (UEFI)",debian-installer/amd64/bootnetx64.efi
pxe-service=x86PC,"Debian installer (BIOS)",pxelinux
```

The board reports `PXEClient:Arch:00007` → `BC_EFI`. A full filename with a suffix suppresses the
`.0` layer suffix; a bare basename like `pxelinux` gets `.0` appended by PXE.

**2. UFW must allow UDP 4011, not just 67 and 69.** Proxy-DHCP is two-stage: the first offer
carries option 60 `PXEClient` and says *"ask me on 4011"*, and the boot request goes there. Block
4011 and the exchange dies silently mid-handshake, looking exactly like a broken NIC.

```
sudo ufw allow 67/udp
sudo ufw allow 69/udp
sudo ufw allow 4011/udp
```

**Note on UFW logs:** absence of `[UFW BLOCK]` entries is **not** proof a port isn't being dropped
— ufw rate-limits its logging to 3/min, and a busy LAN saturates that.

**BIOS, in order:** Del at the logo · Advanced → Network Stack **Enabled**, IPv4 PXE **Enabled**,
IPv6 PXE **Disabled** (UEFI tries IPv6 first and burns a long timeout on a black screen) · save ·
**F11** and pick the PXE entry explicitly rather than trusting boot order. Leave CSM and Boot Mode
alone — changing them kills video on cards with a legacy-only VBIOS. Afterwards set the NVMe first
in the boot order but **leave Network Stack enabled**, so a headless reinstall stays possible.

---

## 6.7 Operational state and maintenance (2026-09-18)

**Uptime policy: leave it running.** Continuous operation is not what wears this build. The PSU sits
at ~38% load on an 80+ Gold unit (§4) — near its efficiency peak, fan slow, capacitors cool — and
the inrush of a cold start is harder on a supply than running is. Reboot when a kernel update lands,
not on a calendar.

**Monitoring installed 2026-09-18:**

| Tool | Status | What it gives |
|---|---|---|
| `rasdaemon` | enabled + active | Persistent ECC history with DIMM attribution (§6.6) |
| `needrestart` 3.11-1 | installed, apt hook at `/etc/apt/apt.conf.d/99needrestart` | Names daemons still holding stale libraries after an upgrade, and warns on a pending kernel |

**`/var/run/reboot-required` does not work on this box**, and will not as configured — that flag is
created by an apt hook from `update-notifier-common`, which is not installed. Checking for it reads
as "no reboot needed" whether or not one is pending. **Do not use it as the signal.** Use
`needrestart`, or compare by hand:

```
uname -r                      # running
dpkg -l 'linux-image-*'       # installed
```

**`needrestart` lives at `/usr/sbin/needrestart`** — not on a normal user's PATH, so call it with
the full path:

```
sudo /usr/sbin/needrestart -k -r l    # kernel status only, restart nothing
sudo /usr/sbin/needrestart -r l       # list stale services, restart nothing
```

Restart mode is still the packaged default `'i'` (interactive), so it will prompt during `apt`
transactions. To make it report-only, set `$nrconf{restart} = 'l';` in
`/etc/needrestart/needrestart.conf` — line 38, shipped commented out.

**State at 2026-09-18:** kernel `6.12.107+deb13-amd64`, the only one installed and the only
`vmlinuz` in `/boot`; `needrestart` reports "Running kernel seems to be up-to-date". ECC clean,
`mc0` and `mc1` both `CE=0 UE=0`. Nothing pending.

### Reverse channel — cassandra → desktop (lsyncd, set up 2026-09-17)

**The server pushes code back to the desktop.** This is the return leg of `bin/cassandra` (`cass`),
which goes the other way. It is **not** a general shell login — the desktop key is confined to a
single rsync target and nothing else.

**Cassandra side** — `lsyncd` 2.2.3 watching one tree, pushing on a 1s delay:

| | |
|---|---|
| Unit | `~/.config/systemd/user/lsyncd-potion-app.service` (user unit, `enabled`) |
| Survives reboot | **Yes** — `loginctl Linger=yes` for `krishna-godoi`, so it starts with no login |
| Config | `~/.config/lsyncd/potion-app.lua` |
| Source | `~/worker-toolkit-potion-polyglot/repos/potion-app/`, excluding `.git/` only — see excludes note below |
| Key | `~/.ssh/lsyncd_to_local` — dedicated, `SHA256:l8w/+p+8nXyMXTsWBwlyJ9g86KJ4Ffa80KURCOUMTLo` |
| Log | `/tmp/lsyncd-potion-app.log` |

**Desktop side** — one deliberately confined line in `~/.ssh/authorized_keys`:

```
command="/usr/bin/rrsync -wo /home/krisc/projects/worker-toolkit-potion-polyglot/repos/potion-app",
no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,no-user-rc ssh-ed25519 <key> lsyncd-to-krisc-local
```
*(one line in the real file — wrapped here for width)*

**What that key can and cannot do.** The forced `rrsync -wo` command means cassandra can only
**write into that one directory** — no shell, no pty, no port forwarding, no agent forwarding, and
no reading anything back out. A compromised server does not get an attacker onto the desktop. Keep
it that way; do not "simplify" it to a plain key.

### Fixed 2026-09-18 — it had never once run, for two separate reasons

**Symptom:** `lsyncd-potion-app.service` crash-looping, exit 255, every ~5s since setup on 09-17.
Nothing had ever transferred — the desktop still held 8,772 files from its own checkout while
cassandra had 120,647.

**⚠ The SSH layer was never the problem — do not go looking there.** This failure mode looks
exactly like a working sync from the outside, which is why it went unnoticed for a day:

| Check (2026-09-18) | Result |
|---|---|
| Key accepted by desktop `sshd` | **1,137 times**, ~6s apart — auth, restrictions, network all fine |
| `coverage/` written on cassandra 11:33 | **absent on the desktop** |
| Desktop files modified that day | **0** |
| Desktop newest file overall | `2026-09-17 21:38` — *predates the lsyncd key (22:04)* |

Every connection authenticated, ran the forced `rrsync`, failed, and hung up. The two trees still
*looked* synced only because they were the same git checkout populated independently.

**Bug 1 — absolute target path (rsync exit 11).** `rrsync` treats its configured directory as the
root and prepends it to whatever the client sends, so an absolute path concatenates:

```
rsync: [Receiver] mkdir ".../potion-app/home/krisc/projects/.../potion-app" failed (2)
rsync error: error in file IO (code 11)
```

**Bug 2 — `-s` / secluded-args (rsync exit 12).** Surfaced only after Bug 1 was fixed. lsyncd builds
its own flag string `-ogpszltD`, and the **`s`** is `--secluded-args` (formerly `--protect-args`),
which lsyncd enables by default and `rrsync` refuses outright:

```
/usr/bin/rrsync error: option -s has been disabled on this server.
rsync error: error in rsync protocol data stream (code 12)
```

**This is the one that will waste your time.** Hand-testing with a plain `rsync -a` *succeeds*,
because `-a` does not include `-s` — so the manual repro passes while the daemon keeps failing. The
only way to see it is lsyncd's own command line:

```
lsyncd -nodaemon -log Exec <config>
```

**Working configuration** (`~/.config/lsyncd/potion-app.lua` on cassandra — the desktop side needed
no change at all):

```lua
settings {
    logfile    = "/tmp/lsyncd-potion-app.log",
    statusFile = "/tmp/lsyncd-potion-app-status.log",
    nodaemon   = false,
    insist     = true,                            -- wait, don't die, when the desktop is away
}
sync {
    default.rsync,
    source = "/home/krishna-godoi/worker-toolkit-potion-polyglot/repos/potion-app/",
    target = "krisc@krishna-godoi.local:.",       -- relative path + mDNS name
    delay  = 1,
    exclude = { ".git/" },
    rsync = {
        binary       = "/usr/bin/rsync",
        archive      = true,
        compress     = true,
        protect_args = false,                     -- REQUIRED: rrsync rejects -s
        rsh = "/usr/bin/ssh -i /home/krishna-godoi/.ssh/lsyncd_to_local -o StrictHostKeyChecking=accept-new -o BatchMode=yes"
    }
}
```

**Verified working 2026-09-18 11:48:** initial sync moved the desktop from 8,772 files to **123,859
files / 1.6 GB**; a probe file created on cassandra appeared on the desktop in **under 6 seconds**,
and deleting it propagated just as fast.

### One-way, and what that means for desktop edits

**The sync is strictly cassandra → desktop.** Verified 2026-09-18: a file created on the desktop
never reached cassandra. Three independent reasons it cannot — `lsyncd` runs only on cassandra and
watches only cassandra's tree; `rrsync -wo` is **write-only**, so cassandra can push in but not read
out; and no sync process of any kind runs on the desktop.

**But desktop edits are not safe — they are reverted silently and on a delay.** All four cases
tested, not inferred:

| Event | Desktop edit to a shared file | New desktop-only file |
|---|---|---|
| Idle, no cassandra-side change | **survives** | **survives** |
| Cassandra changes *that same* file | **overwritten** | n/a |
| Cassandra changes some *other* file | survives | survives |
| **lsyncd restart, or a reboot** | **overwritten** | **deleted** |

The delay is what makes this dangerous. An edit made on the desktop sits there looking fine —
possibly for hours — then disappears the moment cassandra touches that file or the service restarts.
Incremental syncs only carry changed paths, so `--delete` does not sweep the whole tree; the
**startup** sync does, which is why a restart is the destructive moment.

**⚠ Every kernel-update reboot (§6.7) runs a full startup sync** and therefore reverts desktop edits
and removes desktop-only files.

**Rule: treat the desktop copy as read-only output.** Edit on cassandra, or edit on the desktop and
move the change across via git — never directly in that tree.

**Deliberately syncing everything.** No excludes beyond `.git/` — `node_modules/` and `coverage/`
included, by choice, so the two trees are byte-identical. A dry run with `--delete` first confirmed
**0 files would be removed** from the desktop. Note `coverage/` is Jest/Istanbul output (21 MB, 469
files, regenerated every `npm test`) and is **written as root** by the containerised test runs — so
root-owned files land in the desktop tree too.

### Name resolution — the desktop's IP is not static

**Use `krishna-godoi.local`, not `192.168.1.14`.** mDNS is already live on both machines, so this
needs nothing installed:

| | Desktop | Cassandra |
|---|---|---|
| `avahi-daemon` | active (publishing) | active |
| `libnss-mdns` | in `nsswitch.conf` | 0.15.1, in `nsswitch.conf` |
| Verified 2026-09-18 | — | `krishna-godoi.local` → `192.168.1.14` |

**The `.local` suffix is mandatory.** Both hosts use `mdns4_minimal [NOTFOUND=return]`, which only
handles that suffix — bare `krishna-godoi` does **not** resolve. IPv4 only, and both machines must
be on the same L2 segment.

Switching from IP to hostname creates a new host-key entry; the existing
`StrictHostKeyChecking=accept-new` in the `rsh` line absorbs that silently.

**This is also why `insist = true` matters** rather than being a nicety: when the desktop sleeps,
mDNS resolution fails outright, and without `insist` lsyncd exits instead of waiting for it to come
back.

*(Symmetry note: `bin/cassandra` on the desktop resolves the other direction by MAC address with an
ARP sweep, using `cassandra.local` only as a fallback. Given mDNS demonstrably works both ways on
this LAN, that script is more machinery than the job needs — but it works, so it stays.)*

**Worth fixing in the same pass:**

- **`insist` is not set**, so lsyncd terminates on any startup failure instead of retrying — which
  is *why* this is a crash loop rather than a patient wait. With the desktop asleep, off the LAN, or
  simply not resolvable by mDNS, it will die the same way. Add `insist = true` to `settings`.
- **`delay = 1` against a 136k-file, 1GB tree.** Fine once it is actually in sync, but worth
  watching that it does not load the box during benchmark runs — which is the whole point of the
  machine.

### Open gap: no UPS

**Nothing in this build protects against mains events.** That is the one real threat left to a
consumer PSU on Brazilian mains — a brownout or surge does far more damage than years of uptime
ever will, and an unclean cut puts the filesystem at risk too. A line-interactive nobreak is
~R$400–600 against a R$3.755 build plus the time to rebuild it. **Not bought as of 2026-09-18.**

---

## 7. Upgrade path

| Step | Parts | Cost | Gets you |
|---|---|---|---|
| Memory | 2 × 32GB RDIMM into free slots | ~R$1,300 | 128GB quad-channel; 12 jobs at 8GB each. Dead slot does **not** block this — verify Ha#1 populates first (§6.6) |
| Compute | Xeon E5-2699 v4 (22C/44T) | ~R$880 | 22 threads' worth of jobs |
| Storage | 2nd NVMe | ~R$690 | Spare U.2 port + 3 free PCIe slots for an M.2 adapter card. **Trigger:** `docker system prune` stops keeping the boot drive under ~70% (§1.1) |

**Trigger for the memory step:** when heavy tasks stop being outliers, or when you're routinely
capping Harbor concurrency below 12 because of memory rather than finishing at 12.

**Measured 2026-09-16 — the memory step is probably never needed.** Real terminal-bench jobs are
almost entirely *waiting* (model API responses, container startup, I/O), not computing. Sixteen
concurrent jobs produced:

| | Reading |
|---|---|
| Load average (28 threads) | **2.06** — roughly 7% of the machine |
| Package temp | **36°C** |
| RAM in use | **8 GB of 62** — about 0.5 GB per job, not the 8 GB budgeted above |

At Krishna's stated ceiling of **32 concurrent jobs for peak usage only**, that extrapolates to
~16 GB and a load average around 4. 64GB carries the intended workload with roughly 4x headroom,
so the 128GB step is a capacity hedge against a need that hasn't materialised. The real ceiling is
**API rate limits**, then Docker/container churn on the NV3 — not threads, RAM, or thermals.

This also retires the fan question (§6.6): at 36°C under real load the rear exhaust is optional and
can be chosen on noise preference alone.

**Wrinkle on the compute step:** the E5-2699 v4 is a **145W** part and the cooler in this build is
rated 130W. Budget a better cooler at the same time. The PSU is fine across the whole path — 650W
Gold covers a 2699 v4 with 8 DIMMs and two NVMes comfortably.

Steps are independent; none strands an earlier purchase.

---

## 8. Rejected alternatives (for future reference)

**Prebuilt rack servers.** Checked the whole ML market. Two dealbreakers:

- *Tiers 1–2* (Dell R610/R710/R410, HP DL360/DL380 G7/G8 with 128GB, R$1,600–5,000): limited to
  **x86-64-v2, no AVX2**. Harbor runs arbitrary containers, and Go/Rust releases and Python wheels
  targeting `x86-64-v3` will `SIGILL` rather than degrade. Bad failure mode for a benchmark harness.
  Also 1U = 60–75 dBA, unusable in a home office.
- *Tier 3* (DL380 G9 / R430 with dual E5-2680 v4, DDR4, AVX2): correct on specs but starts at
  ~R$8,000–12,000, 2–3× this build.

At 10–14h/day in earshot, the noise and ~130W power delta (~R$85/month at 24/7 Brazilian rates)
settle it independently.

**Whitebox "servers" on ML.** `Xeon E5 2680 v4 / 32GB / 256GB NVMe` sells for R$3,489 — this exact
build with half the RAM and half the SSD. The 128GB version is R$8,029 vs ~R$5,072 to build it.

**Upgrading the current desktop instead** (16GB stick, ~R$716). Doesn't solve the real problem:
validation needs 4 concurrent runs, which won't fit on the desktop at any sane RAM size. And
consumer DDR4 UDIMM is currently **R$45–56/GB vs R$20/GB for server RDIMM** — worse value per real.

**OLX Belo Horizonte.** Checked. 32GB DDR4 ECC RDIMM at R$650, same as ML. X99 kits available but
mostly Machinist/Qiyida boards with 4 DIMM slots, which kills the upgrade path. No advantage.

---

## 9. Market context (Sept 2026)

DRAM prices are rising, not falling — server DRAM contract pricing rose 80–110% in Q1 2026 as fabs
shifted capacity to HBM for AI; DDR4 ECC RDIMM is up 60–80% since early 2025, with suppliers filling
~70% of orders. Relief is not expected before 2027. Waiting to buy RAM has a real expected cost and
no expected saving.

Reference: https://datacenterdisk.com/server-ram/ddr4
