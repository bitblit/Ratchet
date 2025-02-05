import { BuiltInFilters } from './built-in-filters.js';
import { describe, expect, test } from 'vitest';
import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';
import { FilterChainContext } from '../../config/http/filter-chain-context.js';

describe('#uriDecodeQueryParams', function () {
  test('should not URL decode query string parameters', async () => {
    const queryParams: Record<string, string> = {
      test: 'fish+chips',
      test2: 'chicken%2bbeef',
      test3: 'ketchup%20mustard',
      test4: '',
      test5: 'cat=dog',
    };

    BuiltInFilters.uriDecodeQueryParams({
      event: { queryStringParameters: queryParams } as ExtendedAPIGatewayEvent,
    } as FilterChainContext);

    expect(queryParams['test']).toBe('fish chips');
    expect(queryParams['test2']).toBe('chicken+beef');
    expect(queryParams['test3']).toBe('ketchup mustard');
    expect(queryParams['test4']).toBe('');
    expect(queryParams['test5']).toBe('cat=dog');
  });
});
