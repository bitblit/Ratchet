import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { WardenAdapterService } from "./warden-adapter.service";

describe('WardenAdapterService', () => {
  let service: WardenAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WardenAdapterService);
  });

  test.skip('should be created', () => {
    expect(service).toBeTruthy();
  });
});
