import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
const source = readFileSync(
  resolve(__dirname, '../../../frontend/js/core/api.js'),
  'utf8',
);
describe('Frontend HTTP authentication errors (mock fetch)', () => {
  it.each(['{"message":"Expired"}', '<html>Expired</html>', '', 'Expired'])(
    'dispatches unauthorized for body %s',
    async (body) => {
      const window = { dispatchEvent: jest.fn() } as unknown as {
        dispatchEvent: jest.Mock;
        SinstockAPI: {
          request: (
            path: string,
            options?: { auth?: boolean; token?: string },
          ) => Promise<unknown>;
        };
      };
      runInNewContext(source, {
        window,
        Event: class {
          constructor(public type: string) {}
        },
        FormData: class {},
        AbortController,
        setTimeout,
        clearTimeout,
        sessionStorage: { getItem: () => 'fictional-token' },
        SinstockConfig: { apiBaseUrl: 'https://example.test' },
        fetch: jest.fn().mockResolvedValue({
          status: 401,
          ok: false,
          text: () => Promise.resolve(body),
        }),
      });
      await expect(
        window.SinstockAPI.request('/private'),
      ).rejects.toMatchObject({ status: 401 });
      expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
    },
  );
  it.each([{ auth: false }, { token: 'fictional-preauth' }])(
    'does not expire global session for explicit auth flow %j',
    async (options) => {
      const window = { dispatchEvent: jest.fn() } as unknown as {
        dispatchEvent: jest.Mock;
        SinstockAPI: {
          request: (
            path: string,
            options?: { auth?: boolean; token?: string },
          ) => Promise<unknown>;
        };
      };
      runInNewContext(source, {
        window,
        Event: class {},
        FormData: class {},
        AbortController,
        setTimeout,
        clearTimeout,
        sessionStorage: { getItem: () => 'fictional-token' },
        SinstockConfig: { apiBaseUrl: 'https://example.test' },
        fetch: jest.fn().mockResolvedValue({
          status: 401,
          ok: false,
          text: () => Promise.resolve('<html>Expired</html>'),
        }),
      });
      await expect(
        window.SinstockAPI.request('/auth', options),
      ).rejects.toMatchObject({ status: 401 });
      expect(window.dispatchEvent).not.toHaveBeenCalled();
    },
  );
});
