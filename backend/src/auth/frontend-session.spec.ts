import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
const source = readFileSync(
  resolve(__dirname, '../../../frontend/js/auth/session.js'),
  'utf8',
);
function setup() {
  const storage = new Map([
    ['sinstock.access', 'fictional-access'],
    ['sinstock.preAuth', 'fictional-preauth'],
    ['sinstock.mfaMethod', 'TOTP'],
  ]);
  const listeners = new Map<string, () => void>();
  const replace = jest.fn();
  const removeLegacy = jest.fn();
  const request = jest.fn().mockRejectedValue(new Error('simulated offline'));
  const window = {
    addEventListener: (name: string, callback: () => void) =>
      listeners.set(name, callback),
  } as unknown as {
    addEventListener: (name: string, callback: () => void) => void;
    SinstockSession: { logout: () => Promise<void> };
  };
  runInNewContext(source, {
    window,
    document: {
      documentElement: { hasAttribute: () => false },
      addEventListener: jest.fn(),
    },
    location: { replace },
    SinstockConfig: { url: () => 'https://example.test/frontend/index.html' },
    sessionStorage: {
      getItem: (key: string) => storage.get(key),
      removeItem: (key: string) => storage.delete(key),
    },
    localStorage: { removeItem: removeLegacy },
    SinstockAPI: { request },
  });
  return { storage, listeners, replace, removeLegacy, window, request };
}
describe('Frontend session cleanup without browser or HTTP', () => {
  it('clears access and pre-auth and redirects on unauthorized', () => {
    const { listeners, storage, replace, removeLegacy } = setup();
    const unauthorized = listeners.get('sinstock:unauthorized');
    expect(unauthorized).toBeDefined();
    unauthorized!();
    expect(storage.size).toBe(0);
    expect(replace).toHaveBeenCalledWith(
      'https://example.test/frontend/index.html?reason=expired',
    );
    expect(removeLegacy).toHaveBeenCalledTimes(3);
  });
  it('clears local session even when server logout fails offline', async () => {
    const { window, storage, request, replace } = setup();
    await window.SinstockSession.logout();
    expect(request).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
    expect(storage.size).toBe(0);
    expect(replace).toHaveBeenCalledWith(
      'https://example.test/frontend/index.html',
    );
  });
});
