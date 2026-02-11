/**
 * Frontmatter metadata extracted from a profile markdown file.
 * Uses a loose typing approach with an index signature to allow
 * arbitrary additional fields beyond the known ones.
 */
export interface ProfileFrontmatter {
  name?: string;
  displayName?: string;
  layout?: string;
  slug?: string;
  role?: string;
  roles?: string[];
  bio?: string;
  tags?: string[];
  interests?: string[];
  featured?: boolean;
  visibility?: string;
  published?: boolean;
  hidden?: boolean;
  displayOrder?: number;
  [key: string]: any;
}

/**
 * A profile loaded from a markdown file on disk.
 * Contains parsed frontmatter, the raw markdown content body,
 * and the resolved slug identifier.
 */
export interface Profile {
  frontmatter: ProfileFrontmatter;
  content: string;
  slug: string;
}
