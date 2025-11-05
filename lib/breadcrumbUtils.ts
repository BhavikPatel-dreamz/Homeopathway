import { BreadcrumbItem } from '../components/Breadcrumb';

// Define common breadcrumb paths
export const breadcrumbPaths = {
  home: (): BreadcrumbItem[] => [
    { label: "Home", href: "/", isActive: true }
  ],
  
  profile: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Account Settings", isActive: true }
  ],
  
  ailments: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Ailments", isActive: true }
  ],
  
  ailmentDetail: (ailmentName: string, ailmentSlug?: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Ailments", href: "/ailments" },
    { label: ailmentName, href: ailmentSlug ? `/ailments/${ailmentSlug}` : undefined, isActive: true }
  ],
  
  remedies: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Remedies", isActive: true }
  ],
  
  remedyDetail: (remedyName: string, ailmentName?: string, ailmentSlug?: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    ...(ailmentName ? [{ label: ailmentName, href: ailmentSlug ? `/remedies` : "#" }] : []),
    { label: remedyName, isActive: true }
  ],
  
  search: (query?: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: query ? `Search: "${query}"` : "Search Results", isActive: true }
  ],
  
  admin: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin Dashboard", isActive: true }
  ],
  
  adminUsers: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Users", isActive: true }
  ],
  
  adminAilments: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Ailments", isActive: true }
  ],
  
  adminRemedies: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Remedies", isActive: true }
  ],
  
  // Generic function for custom paths
  custom: (items: BreadcrumbItem[]): BreadcrumbItem[] => items
};