# SPHEREx SkyBlink: Project & Website Guide
**NASA Space Apps Challenge 2026: Planet X and SPHEREx**

---

## 1. Executive Summary & Problem Statement

### The Mystery of Planet X / Planet Nine
In the outer reaches of our Solar System, beyond Neptune and Pluto, several icy bodies (Trans-Neptunian Objects) orbit in bizarre, clustered alignments. Astronomers hypothesize a massive, undiscovered planet—"Planet X" or "Planet Nine"—is gravitationally shepherding them. Because it orbits hundreds of Astronomical Units (AU) away from the Sun, it reflects almost zero visible sunlight, rendering it invisible to standard optical telescopes.

### NASA's SPHEREx Mission
SPHEREx (*Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer*) is a NASA space observatory designed to map the entire sky in **102 distinct near-infrared wavelengths** every six months. Because cold objects in space glow faintly in the infrared, SPHEREx is ideally suited for detecting cold brown dwarfs, outer solar system bodies, and interstellar interlopers.

### Our Solution: SPHEREx SkyBlink
SPHEREx SkyBlink is an interactive, web-based astronomical discovery platform. It modernizes the historic **Blink Comparator** technique (used to discover Pluto in 1930) with multi-epoch space infrared surveys and **102-band infrared spectroscopy**, enabling citizen scientists and researchers to detect, track, and verify moving and variable objects across the universe.

---

## 2. Core Scientific Concept: The Blink Comparator

```
[ Epoch 1 (Year 2020) ]   <-- Alternates at 2–3 Hz -->   [ Epoch 2 (Year 2024) ]
                                      |
                     Fixed Distant Stars: Remain motionless.
                     Moving Body (Planet X / Star): Jumps back and forth!
```

* **Historical Context:** In 1930, 24-year-old Clyde Tombaugh discovered Pluto by placing two glass photographic plates taken weeks apart into a mechanical blink comparator. As he rapidly switched between plates, stationary stars remained still, while Pluto "blinked" back and forth due to orbital motion.
* **Modern Implementation:** SkyBlink digitizes this process using space telescope infrared datasets taken years apart. Objects with high proper motion (nearby stars, brown dwarfs, or solar system bodies) immediately stand out to human vision.

---

## 3. Detailed Walkthrough of Website Features

### A. Header & Command Bar (Top)
* **Title & Badge:** Identifies the project as **SPHEREx SkyBlink** under the NASA Space Apps Challenge 2026.
* **Target & Coordinates:** Displays the currently active target name along with its celestial coordinates in **Right Ascension (RA)** and **Declination (Dec)**.
* **Share Link:** Copies a permalink containing the exact target, zoom level, and color adjustments for seamless team collaboration.

### B. Target Selector (Left Sidebar)
Curated targets showcasing different astrophysical phenomena:
1. **Barnard's Star:** The fastest-moving star in Earth's sky (proper motion of 10.3 arcseconds/year). Clearly shows noticeable motion across multi-year epochs.
2. **Luhman 16:** The closest brown dwarf binary system to Earth (6.5 light-years away). Brown dwarfs emit very little visible light but glow in the infrared.
3. **Proxima Centauri:** The closest star to our solar system (4.2 light-years away), exhibiting high proper motion.
4. **Planet X / Planet Nine Search Field:** A simulation of an ultra-faint, slow-moving outer solar system candidate blinking against distant background stars.
5. **Transiting & Variable Stars:** Objects that don't move across the sky but fluctuate dramatically in brightness between epochs (supernovae, variable stars).
6. **Custom RA / Dec Search:** Allows users to input any coordinate in the sky to query real NASA infrared archive cutouts.

### C. Main Sky Canvas (Centerpiece)
* **High-Resolution Infrared Viewport:** Renders dual-epoch infrared imagery (from NASA's unWISE/NEOWISE surveys, aligned with SPHEREx's coverage).
* **Viewfinder Reticles (`⌜ ⌝ ⌞ ⌟`):** NASA space telescope crosshairs centered on the target coordinate.
* **Continuous Optical FOV Zoom (5' to 60' arcminutes):**
  * Smooth scaling from a 1-degree wide-field survey down to a 5-arcminute close-up.
  * Uses in-memory caching for zero-latency, stutter-free zooming.
* **Image Adjustments:**
  * **Brightness & Contrast:** Enhances faint astronomical sources buried in dust.
  * **Invert Colors:** Inverts black sky to white, matching standard astronomical review plates for easier visual contrast.
  * **Colormaps (LUTs):** Toggle between Grayscale, High-Contrast Heat, and Cold-IR palettes.
* **Fullscreen Mode:** Expands the viewport to full screen for focused inspection.

### D. Time-Domain Blink Engine (Canvas Toolbar)
* **Play / Pause:** Starts or stops automatic cycling between Epoch 1 and Epoch 2.
* **Blink Speed (0.5 Hz – 5.0 Hz):** Adjusts the blink frequency. 2 to 3 Hz is the optimal rate for human visual motion perception.
* **Manual Epoch Step:** Allows frame-by-frame toggling between Epoch 1 and Epoch 2.
* **Difference Image Mode (Image Subtraction):**
  * Calculates `Image = Epoch 2 - Epoch 1`.
  * Stationary stars cancel out to pitch black (`0 - 0 = 0`).
  * Moving or brightening objects leave a distinct **bright-and-dark dipole pair**, mathematically confirming motion or variability.

### E. SPHEREx 102-Band Inspector (Bottom Drawer)
Clicking the titanium drawer at the bottom opens the spectral analysis pane:
* **What is a 102-Band SED?**
  * Typical cameras only capture 3 broad color channels (RGB).
  * SPHEREx uses linear variable filters to record **102 narrow infrared wavelengths** between **0.75 µm and 5.0 µm**.
* **Molecular Fingerprint Markers:**
  Highlights key chemical absorption dips:
  * **Water Ice ($\text{H}_2\text{O}$ at 3.05 µm):** Indicates icy planetary surfaces or interstellar biogenic reservoirs.
  * **Methane ($\text{CH}_4$ at 1.66 µm & 2.3 µm):** The signature fingerprint of cold gas giants, Planet X candidates, and T-type brown dwarfs.
  * **Carbon Dioxide Ice ($\text{CO}_2$ at 4.27 µm):** Signature of primordial cometary materials.
* **Direct NASA Data Integration:**
  * One-click download of official scientific **FITS files** via NASA IRSA.
  * Direct deep-link to **NASA WiseView** for independent citizen-science verification.

### F. Candidate Confirmation & Citizen Science
* **"Confirm Motion" / "Log Candidate":** When a user spots motion, clicking the confirmation button computes the angular displacement vector ($\Delta\text{RA}, \Delta\text{Dec}$) and estimated proper motion in milliarcseconds per year, accompanied by a discovery animation.

---

## 4. Technical Architecture

| Component | Technology | Role |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite | Ultra-fast rendering, type-safe astronomical calculations, zero build lag. |
| **Styling** | Tailwind CSS | Sleek obsidian-space dark theme with hairline borders and titanium accents. |
| **Canvas Engine** | HTML5 2D Canvas API | Hardware-accelerated 60 FPS multi-epoch image blending, difference math, and coordinate projections. |
| **Data Layer** | Static Manifest + Client Fetch | NASA IRSA cutouts and SED curves served statically with zero backend latency. |
| **Deployment** | Vercel Edge CDN | 100% serverless, zero maintenance, global low-latency CDN. |

---

## 5. Teammate Cheat Sheet: Common Questions & Answers

**Q: Is this real NASA data or simulated images?**  
*A: The images are real infrared sky cutouts from NASA's unWISE / NEOWISE survey missions, matching the infrared bandpasses observed by SPHEREx. The 102-band spectral curves accurately model the resolution ($R = 41\text{–}130$) of SPHEREx's linear variable filter spectrometers.*

**Q: Why use a human blink comparator instead of an AI model?**  
*A: Automated computer vision models suffer from high false-positive rates due to cosmic ray hits, diffraction spikes, and background noise. Projects like NASA's Backyard Worlds rely on human optical confirmation combined with difference imaging for high-confidence discoveries.*

**Q: How does this help discover Planet X?**  
*A: Planet X is expected to be cold (30–50 Kelvin) and very faint in visible light, but visible in thermal infrared. By blinking multi-epoch infrared surveys and verifying candidates with 102-band methane absorption signatures, SkyBlink provides the exact workflow needed to confirm a candidate.*
