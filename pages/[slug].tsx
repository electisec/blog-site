import { GetStaticProps, GetStaticPaths } from "next";

import path from "path";
import fs from "fs";
import { processMarkdown } from "../lib/utils";
import Link from "next/link";

interface ReportPageProps {
  title: string;
  content: string;
  date: string;
  tags: string[];
  author: string;
  twitter: string;
}

export default function ReportPage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  content,
  date,
  tags,
  author,
  twitter
}: ReportPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <article className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/" className="inline-block mb-4">
          <h2 className="text-xl text-title">← Back to Blogs</h2>
        </Link>

        <div className="bg-primary-foreground shadow p-6 sm:px-6 rounded-lg">
          <header className="flex lg:flex-row md:flex-row flex-col justify-between lg:items-center md:items-center gap-2 items-left mb-6 text-body">
            <span>By <a href={twitter} target="_blank" className="font-semibold text-button hover:underline">{author}</a></span>
            <span>
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emeraldlight bg-opacity-20 text-button"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none prose-table:shadow-lg prose-table:border prose-td:p-2 prose-th:p-2 prose-a:text-title"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const blogsDirectory = path.join(process.cwd(), "content");
  const filenames = fs.readdirSync(blogsDirectory);

  const paths = filenames
    .filter((file): file is NonNullable<typeof file> => file !== null)
    .map((file) => ({
      params: { slug: file.replace(".md", "") },
    }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    const blogsDirectory = path.join(process.cwd(), "content");
    const filePath = path.join(blogsDirectory, `${slug}.md`);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { frontMatter, content } = await processMarkdown(fileContent);

    return {
      props: {
        title: frontMatter.title,
        content: content || "",
        date: new Date(frontMatter.date).toISOString(),
        tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
        author: frontMatter.author || "Anonymous",
        twitter: frontMatter.twitter || "",
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return {
      notFound: true,
    };
  }
};
