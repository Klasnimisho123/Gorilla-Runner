# Gorilla Runner 🦍

"Endless Runner" inspired by the classic **Chrome Dino Game**. This project was developed as a timed technical assignment (homework) for **TBC Academy**, focusing on building a polished, functional game engine within a restricted development window.

---

## 🚀 The Challenge
The goal was to create a responsive, arcade-style game using **New Angular** (v19+) features, prioritizing performance and clean code under strict time constraints.

## 🛠️ Tech Stack
* **Framework:** Angular (Standalone Components & Signals)
* **Reactivity:** Angular Signals (No Zone.js overhead)
* **Styling:** SCSS (Nested, variable-based, and performance-optimized)
* **Architecture:** Feature-based Lazy Loading

## ✨ Key Features
* **Tactile Controls:** Fully responsive buttons with physical keypress animations.
* **Parallax Jungle:** CSS-optimized scrolling backgrounds for a 2D depth effect.
* **Game State Management:** Signal-based engine handling jump physics, collision detection, and high-score persistence(Demo).
* **Keyboard Shortcuts:**
    * `[ArrowUp]` to Jump
    * `[ArrowDown]` to Duck
    * `[P]` to Pause/Resume
    * `[R]` to Quick Restart

## 🏗️ Performance Architecture


To ensure a high Lighthouse score even with game assets, I implemented **Lazy Loading**. 

As a reminder, **lazy loading** allows the application to load the "App Shell" (Header/Footer) instantly. The game engine, obstacle logic, and parallax assets are only fetched when the user initializes the game route. This significantly reduces the initial bundle size and provides a seamless user experience.

## 🚦 Getting Started
1. Clone the repository
2. Run `npm install`
3. Launch the dev server with `ng serve`
4. Open `http://localhost:4200` to play!

---
Developed as a Technical Homework for **TBC Academy**.
