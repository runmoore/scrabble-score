import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
  asLink?: boolean;
  to?: string;
}

export function Card({ title, children, asLink = false, to }: CardProps) {
  const cardClasses =
    "rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800";

  const content = (
    <>
      <h2 className="mb-4 text-lg font-semibold dark:text-gray-100">{title}</h2>
      {children}
    </>
  );

  if (asLink && to) {
    return (
      <a
        href={to}
        className={`${cardClasses} block transition-shadow hover:shadow-lg`}
      >
        {content}
      </a>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
