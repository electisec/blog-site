/* eslint-disable @typescript-eslint/no-explicit-any */
import matter from 'gray-matter';
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractDate(filename: string): string | null {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  
  if (match) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toISOString();
  }
  
  return new Date().toISOString();
}

// Custom plugin to wrap math blocks in centered divs
function remarkWrapMath() {
  return (tree: any) => {
    visit(tree, ['math', 'inlineMath'], (node: any) => {
      if (node.type === 'math') {
        // Split equations by alignment markers
        const equations = node.value.split(/\\[^\\]/).filter(Boolean);
        
        if (equations.length > 1) {
          // Multiple equations - create an align environment
          node.value = `\\begin{align*}\n${equations.join('\\\\\n')}\n\\end{align*}`;
        }
        
        // Wrap display math in a centered div with proper spacing
        node.data = node.data || {};
        node.data.hProperties = {
          className: 'math-display-wrapper',
          style: 'display: block; text-align: center; margin: 2rem auto; width: 100%;'
        };
      }
    });
  };
}

export async function processMarkdown(content: string) {
  const { data, content: markdownContent } = matter(content);
  
  // Clean up LaTeX comments before processing
  const cleanedContent = markdownContent.replace(/(%[^\n]*$)/gm, '');
  
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkReplaceImageUrls)
    .use(remarkMath)
    .use(remarkWrapMath)  // Add our custom plugin
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(rehypeKatex, {
      strict: false,  // Disable strict mode
      trust: true,    // Trust the input
      macros: {
        // Add any custom macros here if needed
        "\\eqref": "\\href{#1}{}",   // Example macro
      },
      errorColor: ' #cc0000',
      throwOnError: false,
      displayMode: true,  // Force display mode for all equations
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(cleanedContent);

  return {
    frontMatter: data,
    content: processedContent.toString()
  };
}

// Interface for image nodes in the AST
interface ImageNode {
  type: 'image';
  url: string;
  title: string | null;
  alt: string | null;
}

// Plugin to replace image URLs
function remarkReplaceImageUrls() {
  return (tree: any) => {
    visit(tree, 'image', (node: ImageNode) => {
      const url = node.url;
      
      // Handle paths that start with ../public/assets/
      if (url.startsWith('../public/')) {
        // Remove ../public/assets/ prefix and convert to /assets/
        node.url = url.replace('../public/', '/');
      }
      
      // Handle paths that might already start with /assets/
      else if (url.startsWith('/')) {
        // Keep as is
        node.url = url;
      }
    });
  };
}