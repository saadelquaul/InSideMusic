# 🎵 InSideMusic 

<div align="center">



A modern, elegant personal music player built with **Angular 21** and **Tailwind CSS**. Upload your tracks, organize them by categories, and enjoy your music anywhere.

[![Angular](https://img.shields.io/badge/Angular-21.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

- 🎧 **Audio Player** - Full-featured audio player with play/pause, next/previous, shuffle, loop, and volume controls
- 📤 **Upload Tracks** - Upload MP3, WAV, and OGG audio files (up to 10MB)
- 🖼️ **Cover Images** - Add cover art to your tracks (PNG, JPEG)
- 📂 **Categories** - Organize your music by custom categories
- 🔍 **Search & Filter** - Search tracks by title, artist, or description and filter by category
- 💾 **Local Storage** - All data stored locally using IndexedDB for offline access
- 📱 **Responsive Design** - Beautiful UI that works on desktop and mobile
- 🎨 **Modern UI** - Clean, gradient-based design with smooth transitions


---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Angular CLI](https://angular.dev/tools/cli) (v21)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/InSideMusic.git
   cd InSideMusic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm run watch` | Build in watch mode |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── album-detail/      # Album detail view
│   │   ├── album-form/        # Album create/edit form
│   │   ├── album-list/        # Albums listing
│   │   ├── audio-player/      # Global audio player component
│   │   ├── category-list/     # Categories management
│   │   ├── home/              # Home dashboard
│   │   ├── track-form/        # Track upload/edit form
│   │   └── track-list/        # Music library
│   ├── models/
│   │   ├── album.model.ts     # Album interface
│   │   ├── category.model.ts  # Category interface
│   │   └── track.model.ts     # Track interface
│   ├── services/
│   │   ├── album.service.ts   # Album CRUD operations
│   │   ├── audio-player.service.ts  # Audio playback management
│   │   ├── category.service.ts      # Category CRUD operations
│   │   ├── storage.service.ts       # IndexedDB storage
│   │   └── track.service.ts         # Track CRUD operations
│   ├── app.config.ts          # App configuration
│   ├── app.html               # Root template
│   ├── app.routes.ts          # Route definitions
│   └── app.ts                 # Root component
├── index.html
├── main.ts
└── styles.css
```

---

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Frontend framework |
| **TypeScript 5.9** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first styling |
| **RxJS** | Reactive programming |
| **IndexedDB** | Client-side storage |

---

## 📋 Supported Formats

### Audio Files
- MP3 (`audio/mpeg`)
- WAV (`audio/wav`)
- OGG (`audio/ogg`)

### Image Files
- PNG (`image/png`)
- JPEG (`image/jpeg`)

### Limits
- Maximum file size: **10MB**
- Maximum title length: **50 characters**
- Maximum description length: **200 characters**

---

## 🧩 Key Features in Detail

### Audio Player Service
The audio player service provides:
- Play, pause, resume functionality
- Next/previous track navigation
- Shuffle and loop modes
- Volume control with mute
- Progress tracking and seeking
- Queue management

### Storage Service
Uses IndexedDB for:
- Storing audio files as blobs
- Storing cover images
- Persisting track metadata
- Category management
- Offline-first approach
