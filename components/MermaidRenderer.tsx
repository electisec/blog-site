'use client';

import { useEffect } from 'react';

// This component initializes Mermaid on the client side
const MermaidInitializer: React.FC = () => {
  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Configure and initialize
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'monospace',
        });
        
        // Render all Mermaid diagrams
        mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      } catch (error) {
        console.error('Failed to initialize Mermaid:', error);
      }
    };

    initializeMermaid();
  }, []);

  return null; // This component doesn't render anything
};

export default MermaidInitializer;