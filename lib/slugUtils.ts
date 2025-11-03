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
 * Checks if a slug exists in the ailments table
 * @param slug - The slug to check
 * @param excludeId - Optional ID to exclude from the check (for editing)
 * @returns Boolean indicating if slug exists
 */
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('ailments')
      .select('slug')
      .eq('slug', slug);

    // Exclude current ailment when editing
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
 * @param excludeId - Optional ID to exclude from the check (for editing)
 * @returns A unique slug
 */
export async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(uniqueSlug, excludeId)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Creates a unique slug from a name
 * @param name - The name to convert to a unique slug
 * @param excludeId - Optional ID to exclude from the check (for editing)
 * @returns A unique slug
 */
export async function createUniqueSlugFromName(name: string, excludeId?: string): Promise<string> {
  const baseSlug = generateSlug(name);
  return generateUniqueSlug(baseSlug, excludeId);
}