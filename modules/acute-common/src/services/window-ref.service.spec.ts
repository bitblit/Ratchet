import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import {WindowRefService} from "./window-ref.service";

describe('WindowRefService', () => {
  let service: WindowRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowRefService);
  });

  test('should be created', () => {
    expect(service).toBeTruthy();
  });
});
