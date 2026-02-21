/**
 * Configuration for the profile loader, replacing hard-coded
 * process.cwd() with dependency injection.
 */
export interface ProfileLoaderConfig {
  /** Base directory (replaces process.cwd()) */
  baseDir: string;
  /** Sub-path under baseDir where profile markdown files live. Defaults to 'src/content/profiles'. */
  contentSubPath?: string;
}

const DEFAULT_CONFIG: ProfileLoaderConfig = {
  baseDir: process.cwd(),
  contentSubPath: 'src/content/profiles',
};

let currentConfig: ProfileLoaderConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the profile loader with custom settings.
 * Merges the provided partial config with the current config.
 */
export function configure(config: Partial<ProfileLoaderConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get the current profile loader configuration.
 * Returns a copy to prevent external mutation.
 */
export function getConfig(): ProfileLoaderConfig {
  return { ...currentConfig };
}

/**
 * Reset the configuration to defaults.
 */
export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}
