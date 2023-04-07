import { LastSuccessProvider } from './last-success-provider.js';
import { CompositeLastSuccessProvider } from './composite-last-success-provider.js';

describe('#lastSuccess', function () {
  const last5: LastSuccessProvider = {
    lastSuccess(): number {
      return 5;
    },
  } as LastSuccessProvider;
  const last4: LastSuccessProvider = {
    lastSuccess(): number {
      return 4;
    },
  } as LastSuccessProvider;
  const lastNull: LastSuccessProvider = {
    lastSuccess(): number {
      return null;
    },
  } as LastSuccessProvider;

  it('should return 4 as last (min)', function () {
    const result: number = new CompositeLastSuccessProvider([last5, last4, lastNull], false).lastSuccess();
    expect(result).toEqual(4);
  });

  it('should return 5 as last (max)', function () {
    const result: number = new CompositeLastSuccessProvider([last5, last4, lastNull], true).lastSuccess();
    expect(result).toEqual(5);
  });
});
