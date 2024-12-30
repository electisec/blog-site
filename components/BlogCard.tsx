import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface BlogCardProps {
  title: string;
  subtitle: string;
  date: string;
  slug: string;
  tags: string[];
  author: string;
}

const ReportCard: React.FC<BlogCardProps> = ({
  title,
  subtitle,
  date,
  slug,
  tags,
  author,
}) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      year: "numeric",
      month: "short",
    });
  };

  const router = useRouter();

  return (
    <div
      className="bg-white flex flex-row justify-between rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden hover:cursor-pointer duration-700"
      onClick={() => router.push(`/blogs/${slug}`)}
    >
      <div className="p-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Link href={`/blogs/${slug}`}>
            <h2 className="text-xl font-semibold text-black">{title}</h2>
          </Link>
        </div>
        <p className="text-gray-600 ">{subtitle}</p>
      </div>
      <div className="p-8 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emeraldlight bg-opacity-25 text-darkgreen"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-right">
          {formatDate(date)} • {author}
        </p>
      </div>
    </div>
  );
};

export default ReportCard;
