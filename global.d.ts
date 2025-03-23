// global.d.ts (or any .d.ts file in your project)
declare global {
  interface Window {
    mermaid?: {
      initialize: (config?: unknown) => void
      run: (options?: unknown) => void
      // ...any other Mermaid APIs you use
    }
  }
}

// This file needs to be a module
export {}
