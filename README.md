# DEFINE — Residence Explorer

Interactive showcase for **DEFINE** by CapitaLand (Thạnh Mỹ Lợi, Thủ Đức): 1 tower, 26 levels, 88 residences.

Personal portfolio project by Vương Nhật Nguyên.

## Journey

1. **Tower** — photoreal render with hoverable residential floors and a level card.
2. **Master floor plan** — Plan A (even floors), Plan B (odd floors) and Penthouse, rendered top-down in three.js; hover draws a gold line around each residence.
3. **Residence** — hand-built 3D cutaway of each residence type (Jardin, Rivière, Monte Carlo penthouse), with 3D / Top view, camera reset and previous / next.

## Run

Plain HTML, CSS and JavaScript — no build step. Open `index.html` in a browser (an internet connection is needed for three.js, GSAP and Google Fonts from their CDNs).

## Files

| Path | What |
|---|---|
| `index.html` | Page markup |
| `css/style.css` | Styles, including the button system at the end |
| `js/data.js` | Levels, plans, unit placements, hero alignment |
| `js/hand.js` | Hand-built residence models (walls, finishes, furniture) |
| `js/app.js` | Hero, floor plan and 3D residence views |
| `js/footprints.js` | Shared tower footprint |
| `js/modules.js`, `js/plans.js`, `js/plans25d.js` | Traced plan data used for cores, thumbnails and outlines |
| `assets/` | Hero render, backgrounds, plan textures |

Architectural information and imagery belong to CapitaLand; this is a non-commercial study.
