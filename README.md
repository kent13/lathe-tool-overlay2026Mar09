# Lathe Tool Overlay

A web application designed for machinists to capture lathe tools and overlay them onto a live camera feed for precise comparison and alignment.

## Features

- **Live Camera Feed**: Real-time monitoring of your lathe workspace.
- **Local AI Background Removal**: Automatically isolates the tool from the background using on-device machine learning (no API keys required).
- **Interactive Overlays**: Drag, scale, and adjust the opacity of captured tools.
- **Multi-Camera Support**: Easily switch between available cameras (e.g., built-in webcam vs. external USB camera).
- **Privacy Focused**: All image processing happens locally in your browser.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Build and Deployment

This application is a static Single Page Application (SPA) and can be hosted on any standard static webserver.

### 1. Build the Project

Run the following command to generate a production-ready build:

```bash
npm run build
```

This will create a `dist/` directory containing all the necessary static files (HTML, JS, CSS, and WASM).

### 2. Deployment Requirements

To ensure the application functions correctly, your hosting environment must meet these requirements:

#### HTTPS (Mandatory)
Browsers require a **Secure Context** to access the camera. You must serve the application over `https://`.

#### Security Headers (Recommended)
The local background removal library uses `SharedArrayBuffer` for optimal performance. For the best experience, configure your server to send the following headers:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

*Note: The application will still function without these headers, but background removal may be significantly slower.*

#### WASM MIME Type
Ensure your server is configured to serve `.wasm` files with the correct MIME type:
`application/wasm`

### 3. Static Hosting Examples

- **Nginx**: Copy the contents of `dist/` to your web root and configure the headers in your site configuration.
- **GitHub Pages / Netlify / Vercel**: These platforms support static SPA deployment out of the box. Ensure HTTPS is enabled.

## Technology Stack

- **React** & **TypeScript**
- **Tailwind CSS** for styling
- **Motion** for animations
- **Lucide React** for icons
- **@imgly/background-removal** for local AI processing
