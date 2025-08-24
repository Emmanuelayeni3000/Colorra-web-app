// Type declarations for modules without bundled TypeScript support
// Provides minimal typing to satisfy the compiler.

declare module 'color-blind' {
  const api: Record<string, (hex: string) => string>;
  export default api;
}

declare module 'wcag-contrast' {
  interface WcagContrastModule {
    hex: (color1: string, color2: string) => number;
    rgb: (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => number;
    luminance: (color: string) => number;
    score: (color1: string, color2: string) => { 
      AA: boolean; 
      AAA: boolean; 
      AALarge: boolean; 
      AAALarge: boolean; 
    };
  }
  const contrast: WcagContrastModule;
  export = contrast;
}
