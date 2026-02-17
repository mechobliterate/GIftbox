# Giftbox

Giftbox is a Next.js application that lets you create beautiful, interactive digital gifts for your loved ones. Compose personalized messages with photos, voice recordings, music, handwritten notes, and custom doodles on a virtual canvas.

The project combines drag-and-drop interactions, real-time media capture, and music service integrations to provide a unique digital gifting experience.

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

### Doodle Drawer
- Freehand drawing with smooth paths
- **Shape tools**: Circle, Rectangle, Line
- **Text tool**: Add custom text to drawings
- **Eraser**: Remove parts of your drawing
- Adjustable brush size and color (8 colors)
- **Undo/Redo** functionality
- Export as SVG for crisp scaling

## Notes and Limitations

- All data is stored locally in the browser
- Refreshing the page clears your work
- Camera and microphone access required for those features
- Large projects may create long data URLs
- May have regional restrictions based on Apple Music availability
