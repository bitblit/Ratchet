import { ErrorRatchet } from '@bitblit/ratchet-common';
import { Logger } from '@bitblit/ratchet-common';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { StringRatchet } from '@bitblit/ratchet-common';
import _ from 'lodash';

import { QueryBuilderResult } from './query-builder-result.js';
import { TransactionIsolationLevel } from '../model/transaction-isolation-level.js';
import { QueryTextProvider } from '../model/query-text-provider.js';
import { Paginator } from '../model/paginator.js';
import { SortDirection } from '../model/sort-direction.js';

export class QueryBuilder {
  public static readonly ALLOWED_SQL_CONSTRUCT: RegExp = /^[a-z0-9_.`]+$/i;
  private readonly queryProvider: QueryTextProvider;

  private query?: string;

  // Meta data
  public meta: { queryPath?: string } = Object.freeze({});

  private sqlConstructs: Record<string, unknown> = {};
  private namedParams: Record<string, unknown> = {};
  private conditionals: Record<string, unknown> = {};

  private debugComment = '';

  private paginator?: Paginator<any>;

  private debugAnnotateMode = false;
  private transactionIsolationLevel: TransactionIsolationLevel = TransactionIsolationLevel.Default;

  constructor(queryProvider: QueryTextProvider) {
    this.queryProvider = queryProvider;
  }

  public clone(): QueryBuilder {
    const clone: QueryBuilder = new QueryBuilder(this.queryProvider);
    if (this.query) {
      clone.withBaseQuery(this.query);
    }
    clone.sqlConstructs = _.clone(this.sqlConstructs);
    clone.namedParams = _.clone(this.namedParams);
    clone.conditionals = _.clone(this.conditionals);
    clone.paginator = _.clone(this.paginator);
    clone.debugComment = this.debugComment;
    clone.transactionIsolationLevel = this.transactionIsolationLevel;
    return clone;
  }

  public withTransactionIsolationLevel(level: TransactionIsolationLevel): QueryBuilder {
    this.transactionIsolationLevel = level;
    return this;
  }

  public withDebugComment(comment: string): QueryBuilder {
    this.debugComment = comment;
    return this;
  }

  public appendDebugComment(comment: string): QueryBuilder {
    this.debugComment = this.debugComment + comment;
    return this;
  }

  public withNamedQuery(queryPath: string): QueryBuilder {
    this.query = this.queryProvider.fetchQuery(queryPath);
    if (!StringRatchet.trimToNull(this.query)) {
      ErrorRatchet.throwFormattedErr('Requested query that does not exist : %s', queryPath);
    }
    this.meta = Object.freeze({ queryPath: queryPath });
    this.withDebugComment(' ' + queryPath + ' ');
    return this;
  }

  public withBaseQuery(baseQuery: string): void {
    this.query = baseQuery;
  }

  public withSqlConstruct(key: string, value: unknown): QueryBuilder {
    this.sqlConstructs[key] = value;
    return this;
  }

  public withSqlConstructs(params: Record<string, unknown>): QueryBuilder {
    this.sqlConstructs = Object.assign(this.sqlConstructs, params);
    return this;
  }

  public removeParam(key: string): QueryBuilder {
    delete this.namedParams[key];
    return this;
  }

  public paramNames(): string[] {
    return Object.keys(this.namedParams);
  }

  public withParam(key: string, value: unknown): QueryBuilder {
    this.namedParams[key] = value;
    return this;
  }

  public withParams(params: unknown): QueryBuilder {
    this.namedParams = Object.assign(this.namedParams, params);
    return this;
  }

  public withExpandedParam(keyPrefix: string, values: unknown[], extendIfExists: boolean): QueryBuilder {
    const lengthParamName: string = keyPrefix + 'Length';
    let oldSize: number = this.fetchCopyOfParam<number>(lengthParamName) ?? 0;
    if (oldSize > 0 && !extendIfExists) {
      Logger.silly('Old item found and not extending - removing old params');
      const toRemove: string[] = this.paramNames().filter((s) => s.startsWith(keyPrefix));
      toRemove.forEach((s) => this.removeParam(s));
      oldSize = 0;
    }

    this.withParam(lengthParamName, values.length + oldSize);
    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      if (typeof value === 'object' && !!value) {
        for (const key of Object.keys(value)) {
          const paramKey = keyPrefix + key.charAt(0).toUpperCase() + key.slice(1) + (i + oldSize);
          this.withParam(paramKey, value[key as keyof typeof value]);
        }
      } else {
        const paramKey = keyPrefix + i;
        this.withParam(paramKey, value);
      }
    }
    return this;
  }

  public withConditional(tag: string, state = true): QueryBuilder {
    this.conditionals[tag] = state;
    return this;
  }

  public withConditionals(params: Record<string, boolean>): QueryBuilder {
    this.conditionals = Object.assign(this.conditionals, params);
    return this;
  }

  public withPaginator(paginator: Paginator<any>): QueryBuilder {
    RequireRatchet.notNullOrUndefined(paginator, 'paginator');
    RequireRatchet.notNullOrUndefined(paginator.cn, 'paginator.cn');
    RequireRatchet.true(paginator.min || paginator.max || paginator.l, 'paginator must have some limit');
    paginator.s = paginator.s ?? SortDirection.Asc; // Default to asc sort

    this.paginator = paginator;
    return this;
  }

  public fetchCopyOfParam<T>(paramName: string): T | undefined {
    return this.namedParams[paramName] as T | undefined;
  }

  public fetchCopyOfConditional<T>(conditionalName: string): T | undefined {
    return this.conditionals[conditionalName] as T | undefined;
  }

  public containsParam(paramName: string): boolean {
    return this.namedParams[paramName] != undefined;
  }

  public getDebugComment(): string {
    return this.debugComment;
  }

  public containsConditional(conditionalName: string): boolean {
    return this.conditionals[conditionalName] != undefined;
  }

  public build(): QueryBuilderResult {
    const build = this.clone();
    return build.internalBuild(false);
  }

  public buildUnfiltered(): QueryBuilderResult {
    const builder: QueryBuilder = this.clone();
    return builder.internalBuild(true);
  }

  protected internalBuild(unfiltered: boolean): QueryBuilderResult {
    this.applyQueryFragments();
    this.applyConditionalBlocks();
    this.applyRepeatBlocks();
    this.applyPagination(unfiltered);
    this.applySqlConstructs();
    this.applyComments();
    this.runQueryChecks();
    this.stripNonAsciiParams();

    return new QueryBuilderResult((this.query ?? '').trim(), this.namedParams, this.paginator, this.transactionIsolationLevel);
  }

  private stripNonAsciiParams(): void {
    const reduced = StringRatchet.stripNonAscii(JSON.stringify(this.namedParams));
    this.namedParams = JSON.parse(reduced) as Record<string, unknown>;
  }

  private runQueryChecks(): void {
    const quotedNamedParams = [...(this.query?.matchAll(/['"]:[A-z-]*['"]/gm) ?? [])];
    if (quotedNamedParams.length > 0) {
      Logger.warn(
        'The resulting query contains quoted named params check this this is intended. Instances found: %s',
        quotedNamedParams.join(', ')
      );
    }
  }

  private applyComments(): void {
    if (this.debugComment.length && this.query) {
      const firstSpaceIndex = this.query.indexOf(' ');
      //const requestId = ContextUtil.currentRequestId(); TODO: Reimplement?
      const comment = this.debugComment; // + (requestId ? ` ${requestId}` : '');
      this.query = this.query.substring(0, firstSpaceIndex + 1) + `/*${comment}*/` + this.query.substring(firstSpaceIndex + 1);
    }
  }

  public applySqlConstructs(): void {
    for (const key of Object.keys(this.sqlConstructs)) {
      let value: string;
      const val = this.sqlConstructs[key];
      // If an array, check each individually, then join with comma
      if (Array.isArray(val)) {
        val.forEach((v: unknown) => {
          if (typeof v !== 'string' || !v.match(QueryBuilder.ALLOWED_SQL_CONSTRUCT)) {
            throw new Error(`sql construct entry ${v as string} is invalid value must be alphanumeric only.`);
          }
        });
        value = val.join(', ');
      } else {
        value = StringRatchet.safeString(val);
        if (value.length > 0 && !value.match(QueryBuilder.ALLOWED_SQL_CONSTRUCT)) {
          throw new Error(`sql construct ${value} is invalid value must be alphanumeric only.`);
        }
      }

      const sqlReservedWords: string[] = ['update', 'insert', 'delete', 'drop', 'select'];
      for (const word of sqlReservedWords) {
        if (value.toLowerCase().includes(word)) {
          throw new Error(`sql construct ${value} is invalid value must not contain reserved word ${word}.`);
        }
      }

      const rawKey = `##sqlConstruct:${key}##`;
      while (this.query?.includes(rawKey)) {
        this.query = this.query.replace(rawKey, value);
      }
    }
  }

  private applyRepeatBlocks(): void {
    const startSymbol = '<repeat';
    const endSymbol = '>';

    // eslint-disable-next-line
    while (true) {
      const startIndex = this.query?.indexOf(startSymbol);
      if (startIndex === -1 || !this.query || typeof startIndex !== 'number') {
        return;
      }

      const endIndex = this.query.indexOf(endSymbol, startIndex);
      if (endIndex == -1) {
        throw new Error(
          `Invalid query when finding end symbol matching ${endSymbol} in ${this.query} check that you have closed all your tags correctly.`
        );
      }

      const content = this.query.substring(startIndex + startSymbol.length, endIndex).trim();

      const countSymbol = 'count=';
      let countParam = '';

      const joinSymbol = 'join=';
      let joinString: string | undefined;

      const params = content.split(' ');
      for (const param of params) {
        if (param.includes(countSymbol)) {
          countParam = param.substring(param.indexOf(countSymbol) + countSymbol.length);
        }

        if (param.includes(joinSymbol)) {
          joinString = param.substring(param.indexOf(joinSymbol) + joinSymbol.length);
        }
      }

      const endTag = `</repeat>`;
      const endTagIndex = this.query.indexOf(endTag);

      const repeatedContent: string = this.query.substring(endIndex + endSymbol.length, endTagIndex);

      this.query = this.query.substring(0, startIndex) + this.query.substring(endTagIndex + endTag.length);

      const count = this.namedParams[countParam.substring(1)] as number;
      for (let i = 0; i < count; i++) {
        let indexedContent = repeatedContent;
        if (joinString && i != 0) {
          indexedContent += joinString;
        }

        let startParamTagIndex = indexedContent.indexOf(`::`);
        while (startParamTagIndex != -1) {
          const endParamTagIndex = indexedContent.indexOf(`::`, startParamTagIndex + 2);

          if (endParamTagIndex == -1) {
            throw new Error(
              `Invalid query when finding end symbol matching :: check that you have closed all your tags correctly. Query: ${this.query} `
            );
          }

          const param = indexedContent.substring(startParamTagIndex + 2, endParamTagIndex);
          indexedContent = indexedContent.replace('::' + param + '::', ':' + param + i);

          startParamTagIndex = indexedContent.indexOf(`::`);
        }

        this.query = this.query.substring(0, startIndex) + indexedContent + this.query.substring(startIndex);
      }
    }
  }

  private applyQueryFragments(): void {
    const startSymbol = '[[';
    const endSymbol = ']]';

    // eslint-disable-next-line
    while (true) {
      const startIndex = this.query?.indexOf(startSymbol);
      if (startIndex == -1 || !this.query || typeof startIndex !== 'number') {
        return;
      }

      const endIndex = this.query.indexOf(endSymbol, startIndex);
      if (endIndex == -1) {
        throw new Error(
          `Invalid query when finding end symbol matching ${endSymbol} in ${this.query} check that you have closed all your tags correctly.`
        );
      }

      const rawName = this.query.substring(startIndex + startSymbol.length, endIndex);
      const namedQueryElement = this.queryProvider.fetchQuery(rawName);
      if (!namedQueryElement) {
        throw new Error(`Invalid query, query fragment ${rawName} not found in named queries.`);
      }
      this.query = this.query.replace(`[[${rawName}]]`, namedQueryElement);
    }
  }

  private applyPagination(unfiltered: boolean): void {
    const paginationRawKey = '##pagination##';

    if (!unfiltered && this.paginator) {
      const sortDirEnum: SortDirection = this.paginator.s == SortDirection.Desc ? SortDirection.Desc : SortDirection.Asc;
      const sortDir: string = StringRatchet.safeString(sortDirEnum);

      if (this.paginator.min || this.paginator.max) {
        let wc: string = 'WHERE ##sqlConstruct:queryBuilderPaginatorWhere##';
        this.withSqlConstruct('queryBuilderPaginatorWhere', this.paginator.cn);
        if (this.paginator.min) {
          wc += '>= :queryBuilderPaginatorWhereMin';
          this.withParam('queryBuilderPaginatorWhereMin', this.paginator.min);
        }
        if (this.paginator.max) {
          if (this.paginator.min) {
            wc += ' AND ##sqlConstruct:queryBuilderPaginatorWhere##';
          }
          wc += '< :queryBuilderPaginatorWhereMax';
          this.withParam('queryBuilderPaginatorWhereMax', this.paginator.max);
        }
        this.query += wc;
      }

      this.query += ` ORDER BY ##sqlConstruct:queryBuilderOrderBy## ${sortDir}`;
      this.withSqlConstruct('queryBuilderOrderBy', this.paginator.cn);

      if (this.paginator.l) {
        this.query += ' LIMIT :queryBuilderLimit';
        this.withParam('queryBuilderLimit', this.paginator.l);
      }
    }

    if (unfiltered && this.query) {
      const paginationSplitIndex = this.query.indexOf(paginationRawKey);
      if (paginationSplitIndex != -1) {
        this.query = 'SELECT COUNT(*) ' + this.query.substring(paginationSplitIndex + paginationRawKey.length);
      }
    }

    while (this.query?.includes(paginationRawKey)) {
      this.query = this.query.replace(paginationRawKey, '');
    }
  }

  private applyConditionalBlocks(): void {
    const startSymbol = '<<';
    const endSymbol = '>>';

    // eslint-disable-next-line
    while (true) {
      const startIndex = this.query?.indexOf(startSymbol);
      if (startIndex == -1 || !this.query || typeof startIndex !== 'number') {
        return;
      }

      const endIndex = this.query.indexOf(endSymbol, startIndex);
      if (endIndex == -1) {
        throw new Error(
          `Invalid query when finding end symbol matching ${endSymbol} in ${this.query} check that you have closed all your tags correctly.`
        );
      }

      const rawTag = this.query.substring(startIndex + startSymbol.length, endIndex);
      const tag = rawTag.replace(':', '');
      const endTag = `<</${rawTag}>>`;
      const endTagIndex = this.query.indexOf(endTag);
      if (endTagIndex == -1) {
        throw new Error(
          `Invalid query when finding conditional end tag matching ${endTag} in ${this.query} check that your query contains an exact match of this tag.`
        );
      }

      let replacement = this.query.substring(endIndex + endSymbol.length, endTagIndex);
      if (rawTag.startsWith(':')) {
        const param = this.namedParams[tag];
        if (param == null || (Array.isArray(param) && param.length == 0)) {
          replacement = '';
        }
      } else {
        const conditional = this.conditionals[tag.replace('!', '')];
        if (conditional == undefined || conditional == tag.startsWith('!')) {
          replacement = '';
        }
      }

      if (this.debugAnnotateMode) {
        replacement = '/* conditional ' + tag + '*/';
      }

      this.query = this.query.substring(0, startIndex) + replacement + this.query.substring(endTagIndex + endTag.length);
    }
  }
}
