# Lumera Brand Assets

All files in this folder are referenced by `index.html` and `site.webmanifest`.
Place completed assets here before deploying.

---

## Required Files

### Favicon Set
| File | Size | Format | Notes |
|---|---|---|---|
| `favicon.svg` | scalable | SVG | Primary favicon — vector, works at any size. Use the icon mark (not wordmark). |
| `favicon-32.png` | 32×32 px | PNG | Fallback for older browsers. |
| `favicon-16.png` | 16×16 px | PNG | Small tab favicon. Keep it simple — just the mark. |

### Apple / Mobile
| File | Size | Format | Notes |
|---|---|---|---|
| `apple-touch-icon.png` | 180×180 px | PNG | iOS home screen icon. No transparency — use `#0a0a0f` background with gold mark. |

### PWA Icons (site.webmanifest)
| File | Size | Format | Notes |
|---|---|---|---|
| `icon-192.png` | 192×192 px | PNG | Android home screen icon. |
| `icon-512.png` | 512×512 px | PNG | Android splash / large icon. |
| `icon-maskable-512.png` | 512×512 px | PNG | Maskable variant — safe zone is center 80%. Keep logo inside safe zone. |

### Social Sharing (Open Graph / Twitter)
| File | Size | Format | Notes |
|---|---|---|---|
| `og-image.jpg` | 1200×630 px | JPG | Used when sharing watchlumera.com on Facebook, LinkedIn, iMessage. Dark cinematic background + "Lumera" wordmark + tagline "Cinema for Creators". |
| `twitter-image.jpg` | 1200×600 px | JPG | Twitter / X card. Same design as og-image is fine — crop to 1200×600. |

---

## Design Guidance

**Color palette:**
- Background: `#0a0a0f` (lumera-dark)
- Gold accent: `#c9a84c` (lumera-gold)
- White: `#e2e2ec` (lumera-text)

**Icon mark:** A minimal, geometric mark that reads at 16px. Consider a stylized "L" or an abstract film-related shape (lens, frame, aperture). Must be legible on both dark and light backgrounds.

**Wordmark:** "Lumera" set in DM Serif Display. For SVG export, convert to outlines.

**OG image layout:**
```
[dark cinematic background — could be a blurred film still]
[center or lower-left: LUMERA wordmark in DM Serif Display, gold]
[below: "Cinema for Creators" in Inter 400, white/muted]
[subtle gold line or gradient at bottom]
```

---

## Figma / Design Tool Export Settings

- SVG: Export as SVG 1.1, no clipping masks, flatten where possible
- PNG: Export @2x for all raster assets, then downscale to target size
- OG images: Export as JPG at quality 85–90 (balance size vs. quality)
- All PNGs: Optimize with `pngquant` or squoosh.app before committing
