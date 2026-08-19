// @vitest-environment node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  homeDir: '',
  resourcesDir: '',
  authoritativeConfig: {} as Record<string, unknown>,
}));

const { mutateinsightAllConfigMock } = vi.hoisted(() => ({
  mutateinsightAllConfigMock: vi.fn(),
}));

vi.mock('os', async () => {
  const actual = await vi.importActual<typeof import('os')>('os');
  return {
    ...actual,
    homedir: () => state.homeDir,
  };
});

vi.mock('@electron/utils/paths', () => ({
  getinsightAllDir: () => '/runtime/openclaw',
  getinsightAllResolvedDir: () => '/runtime/openclaw',
  getResourcesDir: () => state.resourcesDir,
  resolveinsightAllConfigPath: () => join(state.homeDir, '.openclaw', 'openclaw.json'),
}));

vi.mock('@electron/gateway/config-delivery', () => ({
  mutateinsightAllConfig: mutateinsightAllConfigMock,
}));

describe('preinstalled skill config', () => {
  let root: string;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    root = mkdtempSync(join(tmpdir(), 'insightallx-preinstalled-skill-'));
    state.homeDir = join(root, 'home');
    state.resourcesDir = join(root, 'resources');
    state.authoritativeConfig = { gatewayOnly: true };
    mutateinsightAllConfigMock.mockImplementation(async (
      mutator: (config: Record<string, unknown>) => void | Promise<void>,
    ) => {
      await mutator(state.authoritativeConfig);
      return true;
    });

    mkdirSync(join(state.resourcesDir, 'skills'), { recursive: true });
    mkdirSync(join(state.resourcesDir, 'preinstalled-skills', 'example'), { recursive: true });
    writeFileSync(
      join(state.resourcesDir, 'skills', 'preinstalled-manifest.json'),
      JSON.stringify({ skills: [{ slug: 'example', version: '1.0.0', autoEnable: true }] }),
    );
    writeFileSync(join(state.resourcesDir, 'preinstalled-skills', 'example', 'SKILL.md'), '# Example\n');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('auto-enables installed skills through the coordinator authoritative snapshot', async () => {
    const { ensurePreinstalledSkillsInstalled } = await import('@electron/utils/skill-config');
    await ensurePreinstalledSkillsInstalled();

    expect(state.authoritativeConfig).toEqual({
      gatewayOnly: true,
      skills: { entries: { example: { enabled: true } } },
    });
    expect(mutateinsightAllConfigMock).toHaveBeenCalledOnce();
    expect(existsSync(join(state.homeDir, '.openclaw', 'openclaw.json'))).toBe(false);
    expect(readFileSync(
      join(state.homeDir, '.openclaw', 'skills', 'example', 'SKILL.md'),
      'utf8',
    )).toBe('# Example\n');
  });
});
