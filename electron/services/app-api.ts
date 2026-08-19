import type { CompleteHostServiceRegistry } from '../main/ipc/host-contract';
import { runinsightAllDoctor, runinsightAllDoctorFix } from '../utils/openclaw-doctor';
import { isRecord } from './payload-utils';

type insightAllDoctorPayload = {
  mode?: unknown;
};

export function createAppApi(): CompleteHostServiceRegistry['app'] {
  return {
    openClawDoctor: async (payload) => {
      const body = isRecord(payload) ? payload as insightAllDoctorPayload : {};
      return body.mode === 'fix' ? runinsightAllDoctorFix() : runinsightAllDoctor();
    },
  };
}
