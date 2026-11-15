# 🛰️ SPHEREx SkyBlink — NASA Space Apps Challenge 2026

> **A Public-Facing Time-Domain Sky Comparator & Spectroscopic Explorer for NASA's SPHEREx Mission**

[![Live Web App](https://img.shields.io/badge/Live%20Demo-nasa--hackathon--spherex.vercel.app-06b6d4?style=for-the-badge&logo=vercel&logoColor=white)](https://nasa-hackathon-spherex.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SheersakSaha15/Nasa-Hackthon-SphereX)

![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-blue.svg)
![SPHEREx Mission](https://img.shields.io/badge/Mission-NASA%20SPHEREx-cyan.svg)
![Near-IR Bands](https://img.shields.io/badge/Bands-102%20Near--IR%20Channels-purple.svg)
![React + Vite + TypeScript](https://img.shields.io/badge/Built%20With-React%20%7C%20Vite%20%7C%20Tailwind-blue.svg)

🌐 **Live Deployed Application:** [https://nasa-hackathon-spherex.vercel.app/](https://nasa-hackathon-spherex.vercel.app/)  
📂 **Source Code Repository:** [https://github.com/SheersakSaha15/Nasa-Hackthon-SphereX](https://github.com/SheersakSaha15/Nasa-Hackthon-SphereX)

---

## 🌌 Challenge Context

In May 2025, NASA launched the **SPHEREx** (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) space telescope. SPHEREx maps the entire celestial sky once every six months in **102 near-infrared bands** (0.75 µm to 5.0 µm), observing over a billion astronomical objects.

Because SPHEREx observes the same sky patches in 6-month cycles (Epochs), comparing multi-epoch images allows anyone to discover:
1. **The "Jumpers" (Astrometric Motion):** Near-Earth asteroids, comets, nearby stars, and cold brown dwarfs that shift position across epochs.
2. **The "Blinkers" (Photometric Variability):** Pulsating red giants, young eruptive stars, and supernovae that change in brightness by hundreds of times.

**SPHEREx SkyBlink** is an interactive, public-facing web platform that turns complex multi-epoch near-infrared astronomical datasets into an intuitive, high-speed discovery tool.

---

## 🚀 Key Features

### 1. 2D Multi-Epoch Blink Comparator
* Smooth animation engine cycling between **Survey 1 (May 2025)**, **Survey 2 (Nov 2025)**, and **Survey 3 (May 2026)**.
* Interactive playback controls: Play/Pause, Step Backward, Step Forward, and FPS slider (0.5 to 6.0 FPS).
* Spacebar keyboard shortcut for instant play/pause.

### 2. Difference Subtraction Mode ($E_2 - E_1$)
* Performs real-time pixel-level difference imaging directly in the browser.
* Static background stars (millions of light-years away) cancel out into neutral grey.
* Moving objects produce a signature **dipole** (black pit where the object was, white peak where it jumped to).
* Variable stars appear as distinct bright or dark point sources.

### 3. Co-addition Mode ($E_1 + E_2$)
* Stacks multi-epoch observations to boost Signal-to-Noise Ratio (SNR) for faint, distant infrared targets.

### 4. Interactive Field of View (FOV) Slider
* Range from **5 arcmin (`5'`)** to **60 arcmin (`60'`)**:
  * `5'`: Tight close-up for single stars and brown dwarfs.
  * `15'`: Standard balanced field of view.
  * `30'`: Full Moon scale.
  * `60'`: Wide-angle lens for tracking fast-moving near-Earth asteroids and comets.

### 5. On-the-Fly 102-Band Near-Infrared Spectrum (SED)
* SPHEREx 102-channel flux curve from **0.75 µm to 5.0 µm**.
* Automatic labeling of molecular ice and gas absorption bands:
  * Water Ice ($H_2O$ at 3.0 µm)
  * Carbon Dioxide Ice ($CO_2$ at 4.26 µm)
  * Methane Gas ($CH_4$ at 1.66 µm & 3.3 µm)
  * Carbon Monoxide ($CO$ at 2.3 µm & 4.67 µm)

### 6. Official NASA Benchmark Targets (One-Click Presets)
Pre-configured with accurate physical parameters and coordinates:
* **Barnard’s Star**: Fastest moving star in the sky (~10.37 arcsec/yr).
* **WISE 0855−0714**: Coldest known brown dwarf (temp ~250 K / -23°C) with water ice clouds, moving at 8.15 arcsec/yr.
* **Epsilon Indi B**: Fast-moving binary brown dwarf system (~4.7 arcsec/yr).
* **RW Aurigae**: Young T Tauri variable star with chaotic circumstellar dust dimming.
* **R Draconis**: Pulsating Mira red giant undergoing massive 600x photometric brightness swings.

### 7. Dual Coordinate Parser & Deep-Linking
* Accepts both sexagesimal strings (`08h 55m 10.83s, -07° 14' 42.53"`) and decimal degrees (`133.7951, -7.2452`).
* Supports URL query parameters (`?ra=...&dec=...&fov=...`) for easy embedding into citizen-science portals.

### 8. Citizen Science Discovery Logger
* One-click candidate logging with estimated angular shift (arcseconds), classification, and downloadable JSON report.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS (Custom Dark Space Theme)
* **Astronomical Rendering:** HTML5 2D Canvas + Offscreen Double Buffering
* **Icons:** Lucide React
* **Celebration Effects:** Canvas Confetti

---

## 💻 Quick Start (Running Locally)

1. Clone or open the project folder:
   ```bash
   cd spherex-sky-blink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

---

## 🛰️ Plugging in Live SPHEREx Data Releases

When NASA or IPAC/IRSA releases the official public SPHEREx FITS cutouts / API endpoints, simply update the image fetch URL in `src/utils/imageMath.ts` to point to the live SPHEREx cutout service or Aladin Lite HiPS endpoint!
