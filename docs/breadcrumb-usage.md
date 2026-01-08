# Global Breadcrumb Component

## Overview
The global Breadcrumb component provides a consistent navigation breadcrumb across all pages in the HomeoPathway application.

## Files
- `components/Breadcrumb.tsx` - The main breadcrumb component
- `lib/breadcrumbUtils.ts` - Utility functions for common breadcrumb paths

## Basic Usage

### Import the component
```tsx
import Breadcrumb from '@/components/Breadcrumb';
```

### Simple usage with custom items
```tsx
<Breadcrumb 
  items={[
    { label: "Home", href: "/" },
    { label: "Remedies", href: "/remedies" },
    { label: "Belladonna", isActive: true }
  ]}
/>
```

## Using Breadcrumb Utilities

For common navigation patterns, use the predefined utilities:

```tsx
import Breadcrumb from '@/components/Breadcrumb';
import { breadcrumbPaths } from '@/lib/breadcrumbUtils';

// Home page
<Breadcrumb items={breadcrumbPaths.home()} />

// Profile/Account Settings
<Breadcrumb items={breadcrumbPaths.profile()} />

// Ailments listing
<Breadcrumb items={breadcrumbPaths.ailments()} />

// Specific ailment page
<Breadcrumb items={breadcrumbPaths.ailmentDetail("Headache", "headache")} />

// Remedies listing
<Breadcrumb items={breadcrumbPaths.remedies()} />

// Specific remedy page
<Breadcrumb items={breadcrumbPaths.remedyDetail("Belladonna", "Headache", "headache")} />

// Search results
<Breadcrumb items={breadcrumbPaths.search("headache remedy")} />

// Admin dashboard
<Breadcrumb items={breadcrumbPaths.admin()} />
<Breadcrumb items={breadcrumbPaths.adminUsers()} />
<Breadcrumb items={breadcrumbPaths.adminAilments()} />
<Breadcrumb items={breadcrumbPaths.adminRemedies()} />

// Custom breadcrumb
<Breadcrumb items={breadcrumbPaths.custom([
  { label: "Home", href: "/" },
  { label: "Custom Page", isActive: true }
])} />
```

## BreadcrumbItem Interface

```tsx
interface BreadcrumbItem {
  label: string;        // Display text
  href?: string;        // Link URL (optional)
  isActive?: boolean;   // Whether this is the current page
}
```

## Styling

The breadcrumb uses the application's design system:
- Background: `bg-[#F5F1E8]` (light cream)
- Border: `border-gray-200`
- Text: Gray text with hover effects
- Active item: Darker text to indicate current page

## Examples

### Ailment Detail Page
```tsx
// /ailments/headache/page.tsx
<Breadcrumb items={breadcrumbPaths.ailmentDetail("Headache", "headache")} />
// Result: Home / Ailments / Headache
```

### Remedy Detail Page
```tsx
// /remedies/belladonna/page.tsx
<Breadcrumb items={breadcrumbPaths.remedyDetail("Belladonna", "Headache", "headache")} />
// Result: Home / Headache / Belladonna
```

### Admin User Management
```tsx
// /admin/users/page.tsx
<Breadcrumb items={breadcrumbPaths.adminUsers()} />
// Result: Home / Admin Dashboard / Users
```

## Adding New Breadcrumb Patterns

To add new common patterns, edit `lib/breadcrumbUtils.ts`:

```tsx
export const breadcrumbPaths = {
  // ... existing patterns
  
  newPattern: (param1: string, param2?: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Section", href: "/section" },
    { label: param1, isActive: true }
  ]
};
```

## Integration

The breadcrumb component is designed to work with:
- Next.js routing
- The global Header component
- The application's design system
- Responsive layouts

Make sure to place the Breadcrumb component after the Header component in your page layout.