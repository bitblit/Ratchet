import { timer } from "rxjs";
import { ObservableRatchet } from "./observable-ratchet.js";
import { TimeoutToken } from "@bitblit/ratchet-common/lang/timeout-token";
import { describe, expect, test } from "vitest";

describe('#timeout', function () {
  test('should correctly return before timeout', function () {
    const src = timer(1000);
    const timeoutOb = ObservableRatchet.timeout(src, '1000ms interval', 1500);
    timeoutOb.subscribe((result) => expect(result).toEqual(0));
  });

  test('should correctly returns null after timeout', function () {
    const src = timer(1500);
    const timeoutOb = ObservableRatchet.timeout(src, '1500ms interval', 1000);
    timeoutOb.subscribe((result) => {
      expect(result).toBeTruthy();
      expect(result instanceof TimeoutToken).toBeTruthy();
    });
  });
});
