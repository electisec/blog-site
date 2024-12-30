import { GetStaticProps, GetStaticPaths } from "next";

import path from "path";
import fs from "fs";
import { extractDate, processMarkdown } from "../../lib/utils";
import Link from "next/link";

interface ReportPageProps {
  title: string;
  content: string;
  date: string;
  tags: string[];
  author: string;
}

export default function ReportPage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  content,
  date,
  tags,
  author,
}: ReportPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <article className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/" className="inline-block mb-4">
          <h2 className="text-xl text-black">← Back to Blogs</h2>
        </Link>

        <div className="bg-white shadow p-6 sm:px-6">
          <header className="flex flex-row justify-between items-center mb-6">
            <span>By {author}</span>
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
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emeraldlight bg-opacity-25 text-darkgreen"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none prose-table:shadow-lg prose-table:border prose-td:p-2 prose-th:p-2 prose-th:bg-gray-100"
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
        date: extractDate(slug) || new Date(),
        tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
        author: frontMatter.author || "Anonymous",
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
