/**
 * Path Utilities
 * Cross-platform path resolution helpers
 */
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, realpathSync } from 'fs';

const require = createRequire(import.meta.url);

type ElectronAppLike = Pick<typeof import('electron').app, 'isPackaged' | 'getPath' | 'getAppPath'>;

export {
  quoteForCmd,
  needsWinShell,
  prepareWinSpawn,
  normalizeNodeRequirePathForNodeOptions,
  appendNodeRequireToNodeOptions,
} from './win-shell';

function getElectronApp() {
  if (process.versions?.electron) {
    return (require('electron') as typeof import('electron')).app;
  }

  const fallbackUserData = process.env.INSIGHTALLX_USER_DATA_DIR?.trim() || join(homedir(), '.insightallx');
  const fallbackAppPath = process.cwd();
  const fallbackApp: ElectronAppLike = {
    isPackaged: false,
    getPath: (name) => {
      if (name === 'userData') return fallbackUserData;
      return fallbackUserData;
    },
    getAppPath: () => fallbackAppPath,
  };
  return fallbackApp;
}

/**
 * Expand ~ to home directory
 */
export function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return path.replace('~', homedir());
  }
  return path;
}

/**
 * Get insightAll config directory
 */
export function getinsightAllConfigDir(): string {
  return join(homedir(), '.openclaw');
}

export function resolveinsightAllStateDir(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.OPENCLAW_STATE_DIR?.trim();
  return resolve(expandPath(configured || join(homedir(), '.openclaw')));
}

export function resolveinsightAllConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.OPENCLAW_CONFIG_PATH?.trim();
  return resolve(expandPath(configured || join(resolveinsightAllStateDir(env), 'openclaw.json')));
}

export function resolveinsightAllConfigDir(env: NodeJS.ProcessEnv = process.env): string {
  return dirname(resolveinsightAllConfigPath(env));
}

/**
 * Get insightAll skills directory
 */
export function getinsightAllSkillsDir(): string {
  return join(getinsightAllConfigDir(), 'skills');
}

/**
 * Get insightAllX config directory
 */
export function getinsightAllXConfigDir(): string {
  return join(homedir(), '.insightallx');
}

/**
 * Get insightAllX logs directory
 */
export function getLogsDir(): string {
  return join(getElectronApp().getPath('userData'), 'logs');
}

/**
 * Get insightAllX data directory
 */
export function getDataDir(): string {
  return getElectronApp().getPath('userData');
}

/**
 * Ensure directory exists
 */
export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get resources directory (for bundled assets)
 */
export function getResourcesDir(): string {
  if (getElectronApp().isPackaged) {
    return join(process.resourcesPath, 'resources');
  }
  return join(__dirname, '../../resources');
}

/**
 * Get preload script path
 */
export function getPreloadPath(): string {
  return join(__dirname, '../preload/index.js');
}

/**
 * Get insightAll package directory
 * - Production (packaged): from resources/openclaw (copied by electron-builder extraResources)
 * - Development: from node_modules/openclaw
 */
export function getinsightAllDir(): string {
  if (getElectronApp().isPackaged) {
    return join(process.resourcesPath, 'openclaw');
  }
  // Development: use node_modules/openclaw
  return join(__dirname, '../../node_modules/openclaw');
}

/**
 * Get insightAll package directory resolved to a real path.
 * Useful when consumers need deterministic module resolution under pnpm symlinks.
 */
export function getinsightAllResolvedDir(): string {
  const dir = getinsightAllDir();
  if (!existsSync(dir)) {
    return dir;
  }
  try {
    return realpathSync(dir);
  } catch {
    return dir;
  }
}

/**
 * Get insightAll entry script path (openclaw.mjs)
 */
export function getinsightAllEntryPath(): string {
  return join(getinsightAllDir(), 'openclaw.mjs');
}

/**
 * Get ClawHub CLI entry script path (clawdhub.js)
 */
export function getClawHubCliEntryPath(): string {
  return join(getElectronApp().getAppPath(), 'node_modules', 'clawhub', 'bin', 'clawdhub.js');
}

/**
 * Get ClawHub CLI binary path (node_modules/.bin)
 */
export function getClawHubCliBinPath(): string {
  const binName = process.platform === 'win32' ? 'clawhub.cmd' : 'clawhub';
  return join(getElectronApp().getAppPath(), 'node_modules', '.bin', binName);
}

/**
 * Check if insightAll package exists
 */
export function isinsightAllPresent(): boolean {
  const dir = getinsightAllDir();
  const pkgJsonPath = join(dir, 'package.json');
  return existsSync(dir) && existsSync(pkgJsonPath);
}

/**
 * Check if insightAll is built (has dist folder)
 * For the npm package, this should always be true since npm publishes the built dist.
 */
export function isinsightAllBuilt(): boolean {
  const dir = getinsightAllDir();
  const distDir = join(dir, 'dist');
  const hasDist = existsSync(distDir);
  return hasDist;
}

/**
 * Get insightAll status for environment check
 */
export interface insightAllStatus {
  packageExists: boolean;
  isBuilt: boolean;
  entryPath: string;
  dir: string;
  version?: string;
}

export function getinsightAllStatus(): insightAllStatus {
  const dir = getinsightAllDir();
  let version: string | undefined;

  // Try to read version from package.json
  try {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      version = pkg.version;
    }
  } catch {
    // Ignore version read errors
  }

  const status: insightAllStatus = {
    packageExists: isinsightAllPresent(),
    isBuilt: isinsightAllBuilt(),
    entryPath: getinsightAllEntryPath(),
    dir,
    version,
  };

  try {
    const { logger } = require('./logger') as typeof import('./logger');
    logger.info('insightAll status:', status);
  } catch {
    // Ignore logger bootstrap issues in non-Electron contexts such as unit tests.
  }
  return status;
}
