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
    <main className="bg-gray-50 flex flex-col min-h-screen">
      <div className=" bg-gray-50 mt-10 mx-auto">
        <Link href="/"><h2 className="text-xl mb-4 text-black">← Back to Blogs</h2></Link>

        <div className="max-w-7xl bg-white shadow py-6 sm:px-6 flex flex-row text-black justify-between items-center">
          {/* <h1 className="text-3xl font-bold ">{title}</h1> */}
          {/* <div className="mt-2 flex items-center text-sm text-gray-500"> */}
            <span>By {author}</span>
            {/* <span className="mx-2">•</span> */}
            <span>
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
          {/* </div> */}
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
        </div>
        <div className="max-w-7xl bg-white shadow py-6 mt-4 sm:px-6">
          <div
            className="prose prose-lg max-w-none prose-table:shadow-lg prose-table:border prose-td:p-2 prose-th:p-2 prose-th:bg-gray-100"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
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
