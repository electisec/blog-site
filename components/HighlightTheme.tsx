"use client";

import { useTheme } from "@/lib/ThemeContext";
import { useEffect } from "react";

/**
 * Component that dynamically loads the appropriate Highlight.js theme
 * based on the current theme (light/dark)
 */
export default function HighlightTheme() {
  const { theme } = useTheme();

  useEffect(() => {
    // Function to apply the theme
    const applyTheme = () => {
      // Remove any existing highlight.js theme
      const existingLink = document.getElementById("highlight-theme-link");
      if (existingLink) {
        existingLink.remove();
      }

      // Create a new link element for the appropriate theme
      const link = document.createElement("link");
      link.id = "highlight-theme-link";
      link.rel = "stylesheet";
      link.href = theme === "light"
        ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
        : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";

      // Add the link to the head
      document.head.appendChild(link);

      // Re-highlight all code blocks when theme changes
      if (typeof window !== "undefined" && window.hljs) {
        window.hljs.highlightAll();
      }
    };

    // Apply theme when component mounts or theme changes
    applyTheme();
  }, [theme]);

  return null;
}
