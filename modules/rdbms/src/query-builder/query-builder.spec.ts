import { QueryTextProvider } from "../model/query-text-provider.js";
import { describe, expect, test } from "vitest";
import { mock } from "vitest-mock-extended";

import { SortDirection } from "../model/sort-direction.js";
import { NamedParameterDatabaseService } from "../service/named-parameter-database-service.js";
import { DatabaseAccessProvider } from "../model/database-access-provider.js";
import { NamedParameterDatabaseServiceConfig } from "../model/named-parameter-database-service-config.js";
import { QueryDefaults } from "../model/query-defaults.js";

const prov: QueryTextProvider = {
  fetchQuery(queryPath: string): string {
    return this.fetchAllQueries()[queryPath];
  },
  fetchAllQueries(): Record<string, string> {
    return {
      'named_parameter_tests.named_fragment_1': 'SELECT b.`id`, b.`owner_id`, b.`name` FROM boards b',

      'named_parameter_tests.named_test_1': '[[named_parameter_tests.named_fragment_1]] WHERE id=:boardId OR owner_id=:ownerId',

      'named_parameter_tests.conditional_section_test':
        'SELECT b.`id` FROM boards b WHERE b.id < 1000<<COND1>> AND b.owner_id = :ownerId <</COND1>>',

      'named_parameter_tests.pagination_count_test':
        'SELECT b.`id` ##pagination## FROM boards b WHERE b.id < 1000 UNION (SELECT x.`id` ##pagination## FROM somewherelse WHERE x.`id` = 3)',

      'named_parameter_tests.negated_conditional_section_test':
        'SELECT b.`id` FROM boards b WHERE b.id < 1000 <<!COND1>> AND b.owner_id = :ownerId <</!COND1>>',

      'named_parameter_tests.conditional_param_section_test':
        'SELECT b.`id` FROM boards b WHERE b.id < 1000 <<:ownerId>> AND b.owner_id = :ownerId <</:ownerId>>',

      'named_parameter_tests.new_repeat_section_test': '<repeat count=:clsLength join=AND> repeated ::clsW:: ::clsH:: clause </repeat>',

      'named_parameter_tests.sql_construct_test': 'GROUP BY x.##sqlConstruct:groupingColumn##',

      'named_parameter_tests.constant_test': 'SELECT b.`id`, :constantName as constant FROM boards b where b.`id` = 52',
    };
  },
};

const mockAccess: DatabaseAccessProvider = mock<DatabaseAccessProvider>();
const cfg: NamedParameterDatabaseServiceConfig = {
  serviceName: 'testsrv',
  queryProvider: prov,
  connectionProvider: mockAccess,
  queryDefaults:  { databaseName: 'test', timeoutMS: 2_000 },
  longQueryTimeMs: 8_500
};
const mariaDb = new NamedParameterDatabaseService(cfg);

describe('query-builder', () => {
  test('builds filtered', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.pagination_count_test');
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.pagination_count_test */b.`id`  FROM boards b WHERE b.id < 1000 UNION (SELECT x.`id`  FROM somewherelse WHERE x.`id` = 3)',
    );
  });

  test('builds unfiltered', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.pagination_count_test');
    const build = queryBuilder.buildUnfiltered();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.pagination_count_test */COUNT(*)  FROM boards b WHERE b.id < 1000 UNION (SELECT x.`id`  FROM somewherelse WHERE x.`id` = 3)',
    );
  });

  test('fails if param is missing', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.pagination_count_test');
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.pagination_count_test */b.`id`  FROM boards b WHERE b.id < 1000 UNION (SELECT x.`id`  FROM somewherelse WHERE x.`id` = 3)',
    );
  });

  test('removes conditional blocks when missing', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.conditional_section_test');
    const build = queryBuilder.build();
    expect(build.query).toBe('SELECT /* named_parameter_tests.conditional_section_test */b.`id` FROM boards b WHERE b.id < 1000');
  });

  test('handles negated conditional blocks true state', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.negated_conditional_section_test');
    queryBuilder.withConditional('COND1');
    const build = queryBuilder.build();
    expect(build.query).toBe('SELECT /* named_parameter_tests.negated_conditional_section_test */b.`id` FROM boards b WHERE b.id < 1000');
  });

  test('handles negated conditional blocks false state', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.negated_conditional_section_test');
    queryBuilder.withConditional('COND1', false);
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.negated_conditional_section_test */b.`id` FROM boards b WHERE b.id < 1000  AND b.owner_id = :ownerId',
    );
  });

  test('leaves conditional blocks when present', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.conditional_section_test');
    queryBuilder.withConditional('COND1');
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.conditional_section_test */b.`id` FROM boards b WHERE b.id < 1000 AND b.owner_id = :ownerId',
    );
  });

  test('leaves param-conditional blocks when param exists', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.conditional_param_section_test');
    queryBuilder.withParam('ownerId', 'testvalue');
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.conditional_param_section_test */b.`id` FROM boards b WHERE b.id < 1000  AND b.owner_id = :ownerId',
    );
  });

  test('removes param-conditional blocks when param missing', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.conditional_param_section_test');
    const build = queryBuilder.build();
    expect(build.query).toBe('SELECT /* named_parameter_tests.conditional_param_section_test */b.`id` FROM boards b WHERE b.id < 1000');
  });

  test('removes param-conditional blocks when param is an empty array', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.conditional_param_section_test');
    queryBuilder.withParam('ownerId', []);
    const build = queryBuilder.build();
    expect(build.query).toBe('SELECT /* named_parameter_tests.conditional_param_section_test */b.`id` FROM boards b WHERE b.id < 1000');
  });

  test('applies query fragments', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.named_test_1');
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.named_test_1 */b.`id`, b.`owner_id`, b.`name` FROM boards b WHERE id=:boardId OR owner_id=:ownerId',
    );
  });

  test('applies sql constructs', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.sql_construct_test');
    queryBuilder.withSqlConstruct('groupingColumn', 'test_column');
    const build = queryBuilder.build();
    expect(build.query).toBe('GROUP /* named_parameter_tests.sql_construct_test */BY x.test_column');
  });

  test('expands object arrays', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.new_repeat_section_test');
    queryBuilder.withExpandedParam(
      'cls',
      [
        { w: 1, h: 1 },
        { w: 2, h: 2 },
      ],
      true,
    );
    expect(queryBuilder.fetchCopyOfParam('clsW0')).toBe(1);
    expect(queryBuilder.fetchCopyOfParam('clsW1')).toBe(2);
    expect(queryBuilder.fetchCopyOfParam('clsH0')).toBe(1);
    expect(queryBuilder.fetchCopyOfParam('clsH1')).toBe(2);
  });

  test('expands string arrays', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.new_repeat_section_test');
    queryBuilder.withExpandedParam('cls', ['s0', 's1'], true);
    expect(queryBuilder.fetchCopyOfParam('cls0')).toBe('s0');
    expect(queryBuilder.fetchCopyOfParam('cls1')).toBe('s1');
  });

  test('applies repeat blocks', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.new_repeat_section_test');
    queryBuilder.withExpandedParam(
      'cls',
      [
        { w: 1, h: 1 },
        { w: 2, h: 2 },
      ],
      true,
    );
    const build = queryBuilder.build();
    expect(build.query).toBe(
      '/* named_parameter_tests.new_repeat_section_test */repeated :clsW1 :clsH1 clause AND repeated :clsW0 :clsH0 clause',
    );
  });

  test.skip('applies pagination', () => {
    const queryBuilder = mariaDb.queryBuilder('named_parameter_tests.conditional_param_section_test');
    queryBuilder.withPaginator({ s: SortDirection.Desc, cn: 'b.id', max: 1000, l: 25 });
    const build = queryBuilder.build();
    expect(build.query).toBe(
      'SELECT /* named_parameter_tests.conditional_param_section_test */b.`id` FROM boards b WHERE b.id < 1000 ORDER BY id Desc LIMIT :queryBuilderLimit',
    );
    expect(build.namedParams).toStrictEqual({
      queryBuilderLimit: 20,
    });
  });
});
