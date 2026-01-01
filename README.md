# Giftbox

Giftbox is a Next.js application that lets you create beautiful, interactive digital gifts for your loved ones. Compose personalized messages with photos, voice recordings, music, handwritten notes, and custom doodles on a virtual canvas.

The project combines drag-and-drop interactions, real-time media capture, and music service integrations to provide a unique digital gifting experience.

![Giftbox Demo](https://via.placeholder.com/800x400?text=Giftbox+Demo)

## Motivation

In an increasingly digital world, sending meaningful gifts can feel impersonal. Giftbox bridges this gap by allowing users to create rich, multimedia experiences that combine the thoughtfulness of handwritten notes with the convenience of digital delivery.

This project explores:
- Modern web APIs for media capture (camera, microphone)
- Drag-and-drop interactions with precise positioning
- Music service embed integrations
- Canvas-based drawing tools
- Persistent local state management

## Features

### Interactive Canvas
- Drag and drop items freely across the canvas
- Press **ESC** to lock items in place
- Visual feedback during drag operations
- Layer management (move items forward/backward)

### Photo Integration
- Upload photos from your device
- Take photos directly with your webcam
- Live camera preview with mirror effect
- Draggable photo frames with captions

### Colorful Notes
### Colorful Notes
- Choose from 5 note colors (White, Yellow, Blue, Green, Pink)
- Realistic sticky note appearance with paperclip
- Editable text content
- Stack effect animation on hover

### Voice Messages
- Record audio directly in the browser
- Visual waveform display
- Playback controls with progress tracking
- Audio persists as base64 data

### Video Messages
- Record video messages with your webcam
- Live camera preview with mirrored display
- Recording timer with visual indicator
- Preview before adding to canvas
- Playback controls with play/pause overlay

### Music Embeds
- Support for both **Spotify** and **Apple Music**
- Automatic service detection
- Clean, compact player (300x152px)
- Drag-friendly interface

### ✏️Doodle Drawer
- Freehand drawing with smooth paths
- **Shape tools**: Circle, Rectangle, Line
- **Text tool**: Add custom text to drawings
- **Eraser**: Remove parts of your drawing
- Adjustable brush size and color (8 colors)
- **Undo/Redo** functionality
- Export as SVG for crisp scaling

## Project Structure

```
GIftbox/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main canvas component
│   │   ├── layout.tsx            # Root layout with metadata
│   │   └── globals.css           # Global styles and Tailwind
│   ├── components/
│   │   ├── toolbar.tsx           # Bottom toolbar with all tools
│   │   ├── letter-canvas.tsx    # Canvas rendering logic
│   │   ├── draggable-item.tsx   # Wrapper for draggable elements
│   │   ├── photo-uploader.tsx   # Camera & file upload modal
│   │   ├── photo-item.tsx       # Photo frame component
│   │   ├── note-paper.tsx       # Note creation with color picker
│   │   ├── letter-note.tsx      # Editable sticky note
│   │   ├── microphone.tsx       # Voice recorder trigger
│   │   ├── voice-recorder.tsx   # Audio recording modal
│   │   ├── voice-note.tsx       # Audio playback component
│   │   ├── video-camera.tsx     # Video recorder trigger
│   │   ├── video-recorder.tsx   # Video recording modal
│   │   ├── video-player.tsx     # Video playback component
│   │   ├── cd.tsx               # Music link input
│   │   ├── spotify-player.tsx   # Music embed handler
│   │   ├── pencil.tsx           # Doodle tool trigger
│   │   ├── doodle-drawer.tsx    # Drawing canvas modal
│   │   ├── polaroid.tsx         # Photo trigger component
│   │   └── dotted-background.tsx # Canvas background
│   └── lib/
│       └── utils.ts              # Utility functions
├── public/                        # Static assets
├── package.json                   # Dependencies
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS config
└── tsconfig.json                  # TypeScript config
```

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/giftbox.git
cd giftbox
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technical Implementation

### Drag and Drop System

Giftbox uses a custom drag implementation rather than HTML5 drag-and-drop:

```typescript
const handleDragStart = (e: React.MouseEvent | React.TouchEvent, item: LetterItem) => {
  const position = "touches" in e ? e.touches[0] : e;
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const offsetX = position.clientX - rect.left;
  const offsetY = position.clientY - rect.top;

  setIsDragging(true);
  setCurrentItem({ ...item, offsetX, offsetY });
};
```

Items remain "grabbed" until the user presses **ESC**, allowing precise positioning without accidental drops.

### Camera Integration

The photo uploader uses the MediaDevices API:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: false,
});
videoRef.current.srcObject = stream;
```

The video feed is mirrored using CSS transforms, and captured to a canvas element for conversion to base64.

### Music Service Detection

The Spotify player component automatically detects music service URLs:

```typescript
const detectMusicService = (url: string): MusicService => {
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("apple.com") || url.includes("music.apple")) return "apple";
  return "unknown";
};
```

Apple Music URLs are converted from standard to embed format:
```typescript
// https://music.apple.com/... → https://embed.music.apple.com/...
```

### Voice Recording

Audio is captured using the MediaRecorder API and stored as base64 data URLs:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);

mediaRecorder.ondataavailable = (e) => {
  chunks.push(e.data);
};

mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: "audio/webm" });
  // Convert to base64 for persistence
};
```

### Video Recording

Video messages are captured with both video and audio:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: true,
});

const mediaRecorder = new MediaRecorder(stream, {
  mimeType: "video/webm;codecs=vp8,opus",
});

// Recording with timer
mediaRecorder.start();
const timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

// Preview and playback after recording
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: "video/webm" });
  const videoUrl = URL.createObjectURL(blob);
};
```

### Enhanced Drawing Tools

The doodle drawer now supports multiple drawing modes:

```typescript
type DrawMode = "draw" | "erase" | "circle" | "rectangle" | "line" | "text";

interface DrawElement {
  type: "path" | "circle" | "rectangle" | "line" | "text";
  data: any;
  color: string;
  strokeWidth: number;
}

// Shape drawing with live preview
const draw = (e: MouseEvent) => {
  if (drawMode === "circle") {
    const radius = Math.sqrt(
      Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
    );
    setPreviewShape({ cx: startPoint.x, cy: startPoint.y, r: radius });
  }
};

// Undo/redo with history stack
const undo = () => {
  if (historyStep > 0) {
    setHistoryStep(historyStep - 1);
    setElements(history[historyStep - 1]);
  }
};
```

### State Management

All items on the canvas are stored in a single state array:

```typescript
interface LetterItem {
  id: string;
  type: 'photo' | 'note' | 'voice' | 'video' | 'spotify' | 'doodle';
  content: string | Blob;
  position: { x: number; y: number };
  rotation: number;
  zIndex?: number;
  color?: string;
  caption?: string;
}
```

Items are positioned absolutely and layered using z-index values.

## Dependencies

### Core
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript 5** - Type safety

### UI & Styling
- **Tailwind CSS 3** - Utility-first CSS
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants

### Interactions
- **react-dnd** - Drag and drop utilities
- **react-dnd-html5-backend** - HTML5 backend for DnD

## Browser Compatibility

Giftbox requires modern browser features:
- MediaDevices API (camera/microphone)
- Web Audio API (voice playback)
- Canvas API (drawing/screenshots)
- ES6+ JavaScript

**Recommended browsers:**
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

## Notes and Limitations

* **No backend** - All data is stored locally in the browser
* **No persistence** - Refreshing the page clears your work
* **Media permissions** - Camera and microphone access required for those features
* **File size** - Large projects may create long data URLs
* **Apple Music embeds** - May have regional restrictions based on Apple Music availability
