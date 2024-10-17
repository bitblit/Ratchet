import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import {LocalStorageService} from "./local-storage.service";

describe('LocalStorageService', () => {
  let service: LocalStorageService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  test('should be created', () => {
    expect(service).toBeTruthy();
  });
});
