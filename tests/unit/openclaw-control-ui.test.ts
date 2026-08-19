import { describe, expect, it } from 'vitest';

import { buildinsightAllControlUiUrl } from '@electron/utils/openclaw-control-ui';

describe('buildinsightAllControlUiUrl', () => {
  it('uses the URL fragment for one-time token bootstrap', () => {
    expect(buildinsightAllControlUiUrl(18789, 'insightallx-test-token')).toBe(
      'http://127.0.0.1:18789/#token=insightallx-test-token',
    );
  });

  it('omits the fragment when the token is blank', () => {
    expect(buildinsightAllControlUiUrl(18789, '   ')).toBe('http://127.0.0.1:18789/');
  });
});
