import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mutateinsightAllConfigMock,
} = vi.hoisted(() => ({
  mutateinsightAllConfigMock: vi.fn(),
}));

vi.mock('@electron/gateway/config-delivery', () => ({
  mutateinsightAllConfig: mutateinsightAllConfigMock,
}));

vi.mock('@electron/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('syncProxyConfigToinsightAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function useCoordinatorConfig(config: Record<string, unknown>): void {
    mutateinsightAllConfigMock.mockImplementation(async (
      mutator: (snapshot: Record<string, unknown>) => void | Promise<void>,
    ) => {
      const before = JSON.stringify(config);
      await mutator(config);
      return JSON.stringify(config) !== before;
    });
  }

  it('preserves existing telegram proxy on startup-style sync when proxy is disabled', async () => {
    const config = {
      channels: {
        telegram: {
          botToken: 'token',
          proxy: 'socks5://127.0.0.1:7891',
        },
      },
    };
    useCoordinatorConfig(config);

    const { syncProxyConfigToinsightAll } = await import('@electron/utils/openclaw-proxy');

    await syncProxyConfigToinsightAll({
      proxyEnabled: false,
      proxyServer: '',
      proxyHttpServer: '',
      proxyHttpsServer: '',
      proxyAllServer: '',
      proxyBypassRules: '',
    });

    expect(config.channels.telegram.proxy).toBe('socks5://127.0.0.1:7891');
    expect(mutateinsightAllConfigMock).toHaveBeenCalledOnce();
  });

  it('clears telegram proxy when explicitly requested while proxy is disabled', async () => {
    const config = {
      channels: {
        telegram: {
          botToken: 'token',
          proxy: 'socks5://127.0.0.1:7891' as string | undefined,
        },
      },
    };
    useCoordinatorConfig(config);

    const { syncProxyConfigToinsightAll } = await import('@electron/utils/openclaw-proxy');

    await syncProxyConfigToinsightAll({
      proxyEnabled: false,
      proxyServer: '',
      proxyHttpServer: '',
      proxyHttpsServer: '',
      proxyAllServer: '',
      proxyBypassRules: '',
    }, {
      preserveExistingWhenDisabled: false,
    });

    expect(mutateinsightAllConfigMock).toHaveBeenCalledOnce();
    expect(config.channels.telegram.proxy).toBeUndefined();
  });
});
