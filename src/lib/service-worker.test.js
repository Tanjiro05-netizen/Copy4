const fs = require('fs');
const path = require('path');
const vm = require('vm');

const serviceWorkerSource = fs.readFileSync(
  path.join(process.cwd(), 'public', 'service-worker.js'),
  'utf8'
);

const loadServiceWorker = () => {
  const listeners = {};
  const fetch = jest.fn(() => Promise.resolve({ status: 200 }));

  const context = {
    URL,
    Date,
    Promise,
    Headers: class Headers {
      constructor(headers = {}) {
        this.headers = headers;
      }

      set() {}
    },
    Response: class Response {},
    caches: {
      keys: jest.fn(() => Promise.resolve([])),
      open: jest.fn(() =>
        Promise.resolve({
          keys: jest.fn(() => Promise.resolve([])),
          delete: jest.fn(() => Promise.resolve(true)),
          match: jest.fn(() => Promise.resolve(null)),
          put: jest.fn(() => Promise.resolve()),
        })
      ),
    },
    fetch,
    self: {
      addEventListener: (eventName, handler) => {
        listeners[eventName] = handler;
      },
      clients: {
        claim: jest.fn(() => Promise.resolve()),
      },
      skipWaiting: jest.fn(),
    },
  };

  vm.runInNewContext(serviceWorkerSource, context);

  return { fetch, listeners };
};

describe('service worker', () => {
  it('bypasses Supabase auth requests instead of caching them', async () => {
    const { fetch, listeners } = loadServiceWorker();
    const request = {
      method: 'GET',
      url: 'https://example.supabase.co/auth/v1/user',
      destination: '',
    };
    const event = {
      request,
      respondWith: jest.fn(),
    };

    listeners.fetch(event);

    expect(event.respondWith).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(request);
    await expect(event.respondWith.mock.calls[0][0]).resolves.toEqual({ status: 200 });
  });
});
