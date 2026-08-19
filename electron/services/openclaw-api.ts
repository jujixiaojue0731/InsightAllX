import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import { getinsightAllCliCommand } from '../utils/openclaw-cli';
import { ensureDir, getinsightAllSkillsDir, getinsightAllStatus } from '../utils/paths';
import { existsSync } from 'node:fs';

export function createinsightAllApi(): CompleteHostServiceRegistry['openclaw'] {
  return {
    status: () => getinsightAllStatus(),
    getSkillsDir: () => {
      const dir = getinsightAllSkillsDir();
      ensureDir(dir);
      return dir;
    },
    getCliCommand: () => {
      const status = getinsightAllStatus();
      if (!status.packageExists) {
        return { success: false, error: `insightAll package not found at: ${status.dir}` };
      }
      if (!existsSync(status.entryPath)) {
        return { success: false, error: `insightAll entry script not found at: ${status.entryPath}` };
      }
      return { success: true, command: getinsightAllCliCommand() };
    },
  };
}
