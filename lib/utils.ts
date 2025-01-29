/* eslint-disable @typescript-eslint/no-explicit-any */
import matter from 'gray-matter';
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
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

function remarkCodeBlocks() {
  return (tree: any) => {
    visit(tree, 'code', (node: any) => {
      // Add a pre class that highlight.js can target
      node.data = node.data || {};
      node.data.hProperties = {
        className: `language-${node.lang || 'text'}`,
      };
    });
  };
}

function remarkTrimBackticks() {
  return (tree: any) => {
    visit(tree, 'inlineCode', (node: any) => {
      // Convert the node to plain text if it starts and ends with backticks
      const value = node.value;
      if (value.startsWith('`') && value.endsWith('`') && value.startsWith('```') === false) {
        console.log(value);
        
        node.value = value.slice(1, -1);
      }
      console.log(node.value);
      
      // Add classes for styling
      node.data = node.data || {};
      node.data.hProperties = {
        className: 'inline-code-block'
      };
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
    .use(remarkTrimBackticks) 
    .use(remarkCodeBlocks)
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
    .use(rehypeHighlight)
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