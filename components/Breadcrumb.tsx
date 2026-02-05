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
    <div className={`bg-[#F5F1E8] ${className}`}>
      <div className="max-w-7xl mx-auto sm:px-6 px-3 pt-3 sm:pb-6.5 pb-4">
        <div className="flex items-center gap-2 sm:text-base text-sm text-[#41463B]">
          {items?.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}

              {item.href && !item.isActive ? (
                <Link
                  href={item.href}
                  className={`text-[#41463B] hover:text-[#0B0C0A] transition-all duration-500 ${index === 0 ? "underline" : "no-underline"
                    }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    item.isActive
                      ? "text-[#0B0C0A] font-medium"
                      : "text-[#41463B]"
                  }
                >
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