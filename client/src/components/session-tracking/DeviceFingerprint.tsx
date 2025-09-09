import { useEffect, useState } from 'react';

interface DeviceFingerprint {
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  plugins: string[];
  fonts: string[];
  canvas: string;
  webgl: string;
}

interface InteractionData {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  keystrokes: Array<{ key: string; timestamp: number }>;
  scrollBehavior: Array<{ position: number; timestamp: number }>;
  clickEvents: Array<{ x: number; y: number; element: string; timestamp: number }>;
}

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        // Screen resolution
        const screenResolution = `${screen.width}x${screen.height}`;
        const colorDepth = screen.colorDepth;

        // Timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Language
        const language = navigator.language || 'unknown';

        // Browser plugins
        const plugins = Array.from(navigator.plugins).map(plugin => plugin.name);

        // Fonts detection (simplified)
        const fonts = await detectFonts();

        // Canvas fingerprint
        const canvas = generateCanvasFingerprint();

        // WebGL fingerprint
        const webgl = generateWebGLFingerprint();

        setFingerprint({
          screenResolution,
          colorDepth,
          timezone,
          language,
          plugins,
          fonts,
          canvas,
          webgl
        });
      } catch (error) {
        console.error('Failed to generate device fingerprint:', error);
      }
    };

    generateFingerprint();
  }, []);

  return fingerprint;
}

export function useInteractionTracking() {
  const [interactions, setInteractions] = useState<InteractionData>({
    mouseMovements: [],
    keystrokes: [],
    scrollBehavior: [],
    clickEvents: []
  });

  useEffect(() => {
    const mouseMovements: Array<{ x: number; y: number; timestamp: number }> = [];
    const keystrokes: Array<{ key: string; timestamp: number }> = [];
    const scrollBehavior: Array<{ position: number; timestamp: number }> = [];
    const clickEvents: Array<{ x: number; y: number; element: string; timestamp: number }> = [];

    // Track mouse movements (throttled)
    let lastMouseTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseTime > 100) { // Throttle to every 100ms
        mouseMovements.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: now
        });
        lastMouseTime = now;
      }
    };

    // Track keystrokes (without capturing actual keys for privacy)
    const handleKeyPress = (e: KeyboardEvent) => {
      keystrokes.push({
        key: 'key', // Don't capture actual keys for security
        timestamp: Date.now()
      });
    };

    // Track scroll behavior
    const handleScroll = () => {
      scrollBehavior.push({
        position: window.scrollY,
        timestamp: Date.now()
      });
    };

    // Track click events
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      clickEvents.push({
        x: e.clientX,
        y: e.clientY,
        element: target.tagName.toLowerCase(),
        timestamp: Date.now()
      });
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);

    // Update state periodically
    const interval = setInterval(() => {
      setInteractions({
        mouseMovements: [...mouseMovements],
        keystrokes: [...keystrokes],
        scrollBehavior: [...scrollBehavior],
        clickEvents: [...clickEvents]
      });
    }, 1000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      clearInterval(interval);
    };
  }, []);

  return interactions;
}

// Helper functions
async function detectFonts(): Promise<string[]> {
  const testFonts = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
    'Helvetica', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman',
    'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'MS Sans Serif'
  ];

  const detectedFonts: string[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return detectedFonts;

  const baseText = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const baseFont = 'monospace';

  // Get baseline measurement
  ctx.font = `12px ${baseFont}`;
  const baseWidth = ctx.measureText(baseText).width;

  for (const font of testFonts) {
    ctx.font = `12px ${font}, ${baseFont}`;
    const width = ctx.measureText(baseText).width;
    
    if (width !== baseWidth) {
      detectedFonts.push(font);
    }
  }

  return detectedFonts;
}

function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    // Draw some shapes and text
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(10, 10, 50, 30);
    
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.font = '14px Arial';
    ctx.fillText('Canvas fingerprint', 60, 25);
    
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(150, 25, 20, 0, 2 * Math.PI);
    ctx.stroke();

    return canvas.toDataURL();
  } catch (error) {
    return 'canvas-error';
  }
}

function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no-webgl';

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    return `${vendor}|${renderer}`;
  } catch (error) {
    return 'webgl-error';
  }
}