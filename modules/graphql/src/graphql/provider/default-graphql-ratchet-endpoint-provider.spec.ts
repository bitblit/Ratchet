import { describe, expect, test } from 'vitest';
import { DefaultGraphqlRatchetEndpointProvider } from './default-graphql-ratchet-endpoint-provider.js';

describe('DefaultGraphqlRatchetEndpointProvider', () => {
  test.each(['https://example.com/graphql', '/graphql', ''])('returns the configured endpoint unchanged: %s', (endpoint) => {
    const provider = new DefaultGraphqlRatchetEndpointProvider(endpoint);

    expect(provider.fetchGraphqlEndpoint()).toBe(endpoint);
    expect(provider.fetchGraphqlEndpoint()).toBe(endpoint);
  });

  test('keeps endpoints independent between instances', () => {
    const first = new DefaultGraphqlRatchetEndpointProvider('/first');
    const second = new DefaultGraphqlRatchetEndpointProvider('/second');

    expect(first.fetchGraphqlEndpoint()).toBe('/first');
    expect(second.fetchGraphqlEndpoint()).toBe('/second');
  });
});
