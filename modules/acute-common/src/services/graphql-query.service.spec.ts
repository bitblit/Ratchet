import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import {GraphqlQueryService} from "./graphql-query.service";

describe('GraphqlQueryService', () => {
  let service: GraphqlQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphqlQueryService);
  });

  test('should be created', () => {
    expect(service).toBeTruthy();
  });
});
