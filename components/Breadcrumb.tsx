"use client";

import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <div className={`bg-[#F5F1E8] border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              {item.href && !item.isActive ? (
                <Link href={item.href} className="hover:text-gray-900">
                  {item.label}
                </Link>
              ) : (
                <span className={item.isActive ? "text-gray-900" : "text-gray-600"}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}