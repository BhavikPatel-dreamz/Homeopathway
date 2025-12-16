import React from 'react';
import Link from 'next/link'; // Assuming you are using Next.js for routing

// Utility component for the separator icon
const ChevronRightIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
            
            <div className="flex items-center">
              {item.isActive ? (
                <span
                  className="ml-2 text-sm font-medium text-gray-500 cursor-default"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="ml-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    {item.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}