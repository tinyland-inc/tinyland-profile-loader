import type { Profile } from './types.js';
import { getConfig } from './config.js';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

/**
 * Load all profile markdown files from disk.
 * Reads .md, .mdx, and .svx files, parses frontmatter via gray-matter,
 * and returns sorted profiles.
 */
export function loadProfilesServer(): Profile[] {
  const config = getConfig();
  const profilesPath = join(config.baseDir, config.contentSubPath ?? 'src/content/profiles');
  const profiles: Profile[] = [];

  try {
    const files = readdirSync(profilesPath);

    for (const file of files) {
      if (file.match(/\.(md|mdx|svx)$/)) {
        const filePath = join(profilesPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content: markdownContent } = matter(content);

        const slug = file.replace(/\.(md|mdx|svx)$/, '');

        profiles.push({
          frontmatter: {
            layout: 'profile',
            ...frontmatter,
            slug: frontmatter.slug || slug,
          },
          content: markdownContent,
          slug: frontmatter.slug || slug,
        });
      }
    }

    // Sort by display order, then by name
    profiles.sort((a, b) => {
      if (a.frontmatter.displayOrder !== undefined && b.frontmatter.displayOrder !== undefined) {
        return a.frontmatter.displayOrder - b.frontmatter.displayOrder;
      }

      const nameA = a.frontmatter.name || a.frontmatter.displayName || '';
      const nameB = b.frontmatter.name || b.frontmatter.displayName || '';
      return nameA.localeCompare(nameB);
    });

    return profiles;
  } catch (error) {
    console.error('Error loading profiles:', error);
    return [];
  }
}

/**
 * Get published profiles only.
 * Uses visibility field if present, otherwise falls back to legacy
 * published/hidden boolean checks.
 */
export function getPublishedProfilesServer(): Profile[] {
  const profiles = loadProfilesServer();

  return profiles.filter((profile) => {
    if (profile.frontmatter.visibility) {
      return profile.frontmatter.visibility === 'published';
    }

    return profile.frontmatter.published !== false && profile.frontmatter.hidden !== true;
  });
}

/**
 * Get featured profiles (only from published profiles).
 */
export function getFeaturedProfilesServer(): Profile[] {
  return getPublishedProfilesServer().filter(
    (profile) => profile.frontmatter.featured === true,
  );
}

/**
 * Find a single profile by its slug.
 * Searches all profiles (including unpublished) by slug.
 */
export function getProfileBySlugServer(slug: string): Profile | null {
  const profiles = loadProfilesServer();
  return profiles.find((profile) => profile.slug === slug) || null;
}

/**
 * Get profiles filtered by role.
 * Matches against both the single `role` field and the `roles` array.
 */
export function getProfilesByRoleServer(role: string): Profile[] {
  return getPublishedProfilesServer().filter(
    (profile) =>
      profile.frontmatter.role === role || profile.frontmatter.roles?.includes(role),
  );
}

/**
 * Get profiles filtered by tag.
 * Matches against both the `tags` array and the `interests` array.
 */
export function getProfilesByTagServer(tag: string): Profile[] {
  return getPublishedProfilesServer().filter(
    (profile) =>
      profile.frontmatter.tags?.includes(tag) || profile.frontmatter.interests?.includes(tag),
  );
}

/**
 * Get all unique roles across published profiles, sorted alphabetically.
 */
export function getAllRolesServer(): string[] {
  const profiles = getPublishedProfilesServer();
  const roleSet = new Set<string>();

  profiles.forEach((profile) => {
    if (profile.frontmatter.role) {
      roleSet.add(profile.frontmatter.role);
    }
    profile.frontmatter.roles?.forEach((role) => roleSet.add(role));
  });

  return Array.from(roleSet).sort();
}

/**
 * Get all unique tags and interests across published profiles, sorted alphabetically.
 */
export function getAllProfileTagsServer(): string[] {
  const profiles = getPublishedProfilesServer();
  const tagSet = new Set<string>();

  profiles.forEach((profile) => {
    profile.frontmatter.tags?.forEach((tag) => tagSet.add(tag));
    profile.frontmatter.interests?.forEach((interest) => tagSet.add(interest));
  });

  return Array.from(tagSet).sort();
}

/**
 * Search profiles by a query string.
 * Case-insensitive search across name, displayName, bio, role, and content.
 */
export function searchProfilesServer(query: string): Profile[] {
  const profiles = getPublishedProfilesServer();
  const searchTerm = query.toLowerCase();

  return profiles.filter((profile) => {
    const name = profile.frontmatter.name || profile.frontmatter.displayName || '';
    if (name.toLowerCase().includes(searchTerm)) return true;

    if (profile.frontmatter.bio?.toLowerCase().includes(searchTerm)) return true;

    if (profile.frontmatter.role?.toLowerCase().includes(searchTerm)) return true;

    if (profile.content.toLowerCase().includes(searchTerm)) return true;

    return false;
  });
}

/**
 * Get a random selection of published profiles.
 * @param count Number of random profiles to return (default: 3)
 */
export function getRandomProfilesServer(count: number = 3): Profile[] {
  const profiles = getPublishedProfilesServer();
  const shuffled = [...profiles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
