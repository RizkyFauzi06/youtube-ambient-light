# YouTube Ambient Light — Vibe Edition

<p align="center">
  <strong>Bring the colors beyond the screen.</strong>
  <br>
  A lightweight ambient lighting experience for YouTube.
  <br><br>
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JavaScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License">
</p>

<p align="center">
  <img src="Screenshot%202026-10-25%20212212.png" alt="YouTube Ambient Light Vibe Edition running on YouTube" width="90%">
</p>

---

## Overview

**YouTube Ambient Light — Vibe Edition** is a lightweight browser extension that brings dynamic ambient lighting to YouTube videos.

By sampling video frames and scaling a small canvas behind the player, Vibe Edition creates a soft glow that reflects the colors of the video. Built with vanilla JavaScript, it integrates directly into YouTube's native interface without requiring a separate settings popup.

**Simple by design. Cinematic by nature.**

## Features

### 🎨 Dynamic Ambient Lighting

Extends the colors of your video beyond the player, creating a more immersive viewing experience.

### ⚙️ Native YouTube Controls

Enable or disable the effect and adjust its intensity directly from the YouTube player's settings menu.

### 🎬 Smart Crop

Samples a cropped portion of the video to reduce the influence of black letterbox bars on the ambient colors.

### 🖥️ Full-Screen & Mini-Player

Designed to work with YouTube's different playback modes, including full-screen and mini-player.

### 🌗 Theme Awareness

Detects YouTube's light and dark themes and adapts the ambient effect accordingly.

### ⚡ Lightweight Rendering

Uses a small **64 × 36 canvas** and CSS transforms to create the ambient glow without applying a high-resolution blur to the entire video frame.

### ⏯️ Playback-Aware Rendering

Uses `requestVideoFrameCallback` where supported to synchronize rendering with video frames. The rendering loop is designed to stop when playback is paused.

## Preview

<p align="center">
  <strong>Ambient Light — Dark Mode</strong>
  <br><br>
  <img src="screenshots/Screenshot 2026-10-25 212212.png" alt="Ambient lighting in YouTube dark mode" width="90%">
</p>

<p align="center">
  <strong>Ambient Light — Light Mode</strong>
  <br><br>
  <img src="screenshots/Screenshot 2026-10-25 212306.png" alt="Ambient lighting in YouTube light mode" width="90%">
</p>

<p align="center">
  <strong>Native Player Settings</strong>
  <br><br>
  <img src="screenshots/Screenshot 2026-10-25 212516.png" alt="Ambient Light controls in the YouTube player settings" width="75%">
</p>

## How It Works

Vibe Edition uses a simple rendering pipeline:

1. **Frame Sampling** — reads frames from the playing YouTube video.
2. **Smart Cropping** — excludes portions of the top and bottom of the frame to reduce black-bar interference.
3. **Low-Resolution Rendering** — draws the sampled image onto a 64 × 36 canvas.
4. **Optical Scaling** — enlarges the canvas using CSS transforms to create the ambient glow behind the player.
5. **Playback Synchronization** — schedules rendering around video frames and stops the rendering loop when playback is paused.

This approach keeps the implementation relatively simple while avoiding the need for a dedicated rendering framework.

> **Performance note:** Actual CPU and memory usage depend on the browser, video, playback conditions, and hardware. Performance figures should be added only after reproducible testing.

## Installation

Install the extension locally using your browser's Developer Mode.

### Requirements

- Microsoft Edge or Google Chrome.
- A local copy of this repository.

### Steps

1. **Download the repository.** Clone the repository or download it as a ZIP file and extract it.
2. **Open the extensions page.**
   - Microsoft Edge: `edge://extensions/`
   - Google Chrome: `chrome://extensions/`
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing the extension's `manifest.json` file.
6. Open YouTube and play a video.
7. Open the player's **Settings (⚙️)** menu and enable Ambient Light.

If the extension does not work as expected, verify that you selected the correct folder and try reloading the extension from the browser's extensions page.

## Technology Stack

| Technology | Purpose |
|---|---|
| Vanilla JavaScript | Extension logic and DOM integration |
| HTML Canvas | Low-resolution video-frame sampling |
| CSS Transforms | Optical scaling for the ambient effect |
| Chrome Extension Manifest V3 | Browser extension configuration |
| `requestVideoFrameCallback` | Video-frame-aware rendering where supported |
| Chrome Storage API | Persisting user settings |

## Design Principles

- **Lightweight** — keep the implementation simple and avoid unnecessary dependencies.
- **Native Integration** — make the controls feel like part of YouTube rather than a separate application.
- **Performance-Conscious** — limit canvas resolution and avoid unnecessary rendering while playback is paused.
- **Maintainable** — prefer straightforward JavaScript over a complex framework for a focused feature.
- **User-Friendly** — keep the controls simple and accessible.

## Roadmap

Potential improvements for future versions:

- [ ] Benchmark CPU and memory usage under repeatable conditions.
- [ ] Improve rendering lifecycle handling when navigating between YouTube videos.
- [ ] Test compatibility across playback modes, browsers, and YouTube UI updates.
- [ ] Refine ambient transitions and visual consistency.

*Roadmap items represent potential improvements and may change as development progresses.*

## Contributing

Contributions, bug reports, and suggestions are welcome.

When reporting an issue, please include:

- Your browser and version.
- The steps needed to reproduce the issue.
- The playback mode in which it occurs.
- Screenshots or a short recording, if applicable.

Please keep changes focused and avoid modifications that unnecessarily interfere with YouTube's native layout.

## License

This project is distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  <sub>Made for a more immersive YouTube experience.</sub>
</p>