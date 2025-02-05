import { LocalServer } from './local-server.js';
import { describe, expect, test } from 'vitest';

describe('#localServer', function () {
  test('should not URL decode query string parameters', async () => {
    const queryParams: Record<string, string> = LocalServer.parseQueryParamsFromUrlString(
      'http://localhost?test=fish+chips&test2=chicken%2bbeef&test3=ketchup%20mustard&test4=&test5=cat=dog',
    );

    expect(queryParams['test']).toBe('fish+chips');
    expect(queryParams['test2']).toBe('chicken%2bbeef');
    expect(queryParams['test3']).toBe('ketchup%20mustard');
    expect(queryParams['test4']).toBe('');
    expect(queryParams['test5']).toBe('cat=dog');
  });
});
