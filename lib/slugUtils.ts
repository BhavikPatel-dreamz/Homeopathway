import { supabase } from '@/lib/supabaseClient';

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    // Remove multiple consecutive hyphens
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Checks if a slug exists in the specified table
 * @param slug - The slug to check
 * @param table - The table to check ('ailments' or 'remedies')
 * @param excludeId - Optional ID to exclude from the check (for editing)
 * @returns Boolean indicating if slug exists
 */
export async function checkSlugExists(slug: string, table: 'ailments' | 'remedies' = 'ailments', excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from(table)
      .select('slug')
      .eq('slug', slug);

    // Exclude current record when editing
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which means slug doesn't exist
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking slug:', error);
    return false;
  }
}

/**
 * Generates a unique slug by appending numbers if the base slug exists
 * @param baseSlug - The base slug to make unique
 * @param table - The table to check ('ailments' or 'remedies')
 * @param excludeId - Optional ID to exclude from the check (for editing)
 * @returns A unique slug
 */
export async function generateUniqueSlug(baseSlug: string, table: 'ailments' | 'remedies' = 'ailments', excludeId?: string): Promise<string> {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(uniqueSlug, table, excludeId)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Creates a unique slug from a name
 * @param name - The name to convert to a unique slug
 * @param table - The table to check ('ailments' or 'remedies')
 * @param excludeId - Optional ID to exclude from the check (for editing)
 * @returns A unique slug
 */
export async function createUniqueSlugFromName(name: string, table: 'ailments' | 'remedies' = 'ailments', excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(name);
  return generateUniqueSlug(baseSlug, table, excludeId);
}