# HH Goa ID Card 2026

A frontend-only Builder ID card generator for Hacker House Goa 2026.

## Overview

- Built with **React + Vite + Framer Motion**
- Generates a custom card entirely in the browser using **Canvas**
- No backend required: the image is composited locally on the user device
- Supports download, native sharing, and opening a pre-filled X composer

## Features

- Photo upload with preview
- Name and tech stack input
- Client-side builder class generation
- Download card image directly
- Share via native share sheet when available
- Open X composer with caption and link

## Install & run

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Project structure

```
src/
  components/
    Logo.jsx
    PhotoUpload.jsx
    ResultView.jsx
    ShareSheet.jsx
    Decorations.jsx
    VideoBackground.jsx
  lib/
    cardGenerator.js
    builderClass.js
    shareUtils.js
  styles/
    index.css
  App.jsx
```

## Notes

- The app expects a local video file at `src/assets/Create_a_smooth_cinematic_anim.mp4`.
- `src/assets/card-frame.webp` is the static card frame used by the canvas generator.
- There is no backend, so image generation and sharing happen entirely in the browser.

## Deployment

This is a static frontend app and can be deployed to Vercel, Netlify, GitHub Pages, or Cloudflare Pages.

## GitHub

Repository: `https://github.com/adarshsahu666/hh-goa-idcard-2026`
