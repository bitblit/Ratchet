import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { CssThemeService } from "./css-theme.service";

describe('CssThemeService', () => {
  let service: CssThemeService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CssThemeService);
  });

  test.skip('should be created', () => {
    expect(service).toBeTruthy();
  });
});
