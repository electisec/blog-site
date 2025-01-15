import matter from 'gray-matter';
import { unified } from "unified";
import remarkParse from "remark-parse";
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractDate(filename: string): string | null {
  // Match pattern: "MM-YYYY" from the start of the string
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, year, month, day] = match;
   const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
   return date.toISOString();
  }

  return new Date().toISOString();
}

export async function processMarkdown(content: string) {
  // Parse frontmatter
  const { data, content: markdownContent } = matter(content);

  // Process markdown with all plugins including image URL replacement
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkReplaceImageUrls)  // Add the image URL replacement plugin
    .use(html, {
      sanitize: false,
      allowDangerousHtml: true
    })
    .process(markdownContent);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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