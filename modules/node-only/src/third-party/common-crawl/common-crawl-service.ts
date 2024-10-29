import fetch from 'cross-fetch';
import * as querystring from 'node:querystring';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import zlib from 'zlib';
import { Readable } from 'stream';
import warc from 'warc';
import * as cheerio from 'cheerio';
import { WarcEntry } from './model/warc-entry.js';
import { CommonCrawlScan } from './model/common-crawl-scan.js';
import { CommonCrawlFetchOptions } from './model/common-crawl-fetch-options.js';
import { DomainIndexEntryRaw } from './model/domain-index-entry-raw.js';
import { IndexEntryRaw } from './model/index-entry-raw.js';
import { WarcEntryRaw } from './model/warc-entry-raw.js';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { NodeStreamRatchet } from '../../stream/node-stream-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { StopWatch } from '@bitblit/ratchet-common/lang/stop-watch';

/**
 * A very early take to simplify accessing and using the common crawl
 */
export class CommonCrawlService {
  public static readonly COMMON_CRAWL_URL: string = 'https://index.commoncrawl.org/';
  public static readonly CURRENT_CRAWL: string = 'CC-MAIN-2024-33'; // August 2024 index

  public async fetchIndexes(): Promise<IndexEntryRaw[]> {
    const res: Response = await fetch(CommonCrawlService.COMMON_CRAWL_URL + 'collinfo.json');
    const output: IndexEntryRaw[] = await res.json();
    return output;
  }

  public async readPageData(entry: DomainIndexEntryRaw): Promise<any> {
    const rval: Record<string, string[]> = {};
    const langs: string[] = CommonCrawlService.validLanguages(entry);

    for (const lang of langs) {
      rval[lang] = [];
      const data: WarcEntry = await this.pullPageEntry(entry);
      const asString: string = data.content.toString();
      const parsed: cheerio.Root = cheerio.load(asString);
      ['p', 'div', 'span'].forEach((tag) => {
        parsed(tag).each((idx: number, el: cheerio.Element) => {
          const txt: string = StringRatchet.trimToNull(parsed(el).text());
          if (txt && txt.includes('.')) {
            rval[lang].push(txt);
            //Logger.info('Div: %s : type %s : text %s', idx, el.type, txt);
          }
        });
      });
    }
    return rval;
  }

  public static validLanguages(entry: DomainIndexEntryRaw): string[] {
    const validLangs: string[] = entry.languages
      .split(',')
      .map((s) => StringRatchet.trimToNull(s))
      .filter((s) => !!s);
    return validLangs;
  }

  public async pullPageEntry(entry: DomainIndexEntryRaw, language?: string): Promise<WarcEntry> {
    const prefix: string = 'https://data.commoncrawl.org/'; //https://aws-publicdatasets.s3.amazonaws.com/';
    const url: string = prefix + entry.filename;

    const headers: Record<string, string> = { Range: 'bytes=' + entry.offset + '-' + (entry.offset + entry.length + 1) };
    if (language) {
      if (!CommonCrawlService.validLanguages(entry).includes(language)) {
        throw ErrorRatchet.fErr('Requested language %s, but valid are %s', language, entry.languages);
      }
      headers['Accept-Language'] = language;
    }

    const resp: Response = await fetch(url, {
      headers: headers,
    });
    //const do_unzip = promisify(unzip);

    let reader: Readable = null;
    if (resp.body instanceof Readable) {
      reader = resp.body;
    } else if (resp.body instanceof ReadableStream) {
      reader = NodeStreamRatchet.webReadableStreamToNodeReadable(resp.body);
    }

    const warcstream: warc = new warc();
    //const unzip: zlib.Gunzip = zlib.createGunzip();
    //const unzipped: Buffer = zlib.unzipSync(await resp.arrayBuffer());

    //const body: Readable = resp.body as unknown as Readable; // as unknown as PassThrough;
    //const nodeReadble: Readable = NodeStreamRatchet.webReadableStreamToNodeReadable(resp.body);

    Logger.info('Headers is %j', resp.headers);

    let rval: WarcEntryRaw = null;
    //let done: boolean = false;
    reader
      .pipe(zlib.createGunzip())
      .pipe(warcstream)
      .on('data', (val: WarcEntryRaw) => {
        Logger.info('Got data ' + val.content.length);
        rval = val; //.push(val);
        //if (val.headers['WARC-Target-URI'] === entry.url) {
        // }
        //rval = val;
        warcstream.destroy();
      })
      .on('close', () => {
        Logger.info('Got close event');
        //done = true;
      })
      .on('error', (err) => {
        Logger.error('Read error: %s', err, err);
        //done = true;
      });

    while (!rval) {
      // Shouldnt really happen if offset is correct
      await PromiseRatchet.wait(500);
    }

    const conv: WarcEntry = {
      protocol: rval.protocol,
      headers: rval.headers,
      content: rval.content.toString(),
    };

    return conv;
  }

  public async search(options: CommonCrawlFetchOptions): Promise<DomainIndexEntryRaw[]> {
    RequireRatchet.notNullOrUndefined(options, 'options');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(options.url, 'options.url');

    let url: string = CommonCrawlService.COMMON_CRAWL_URL + (options.index || CommonCrawlService.CURRENT_CRAWL);
    url += '-index?';
    const params = {
      url: options.url,
      //from: options.from,
      //to: options.to,
      matchType: options.matchType || 'domain', // exact, prefix, host , domain,
      //limit: options.limit,
      //sort: options.sort,
      //page: options.page,
      //pageSize: options.pageSize,
      //showNumPages: options.showNumPages || false,
      output: 'json',
    };

    const urlPart: string = querystring.stringify(params);
    url += urlPart;

    //Logger.info('URL: %s', url);

    const res: Response = await fetch(url);
    const body: string = await res.text();
    let rval: DomainIndexEntryRaw[] = null;
    if (res.status === 200) {
      const lines: string[] = body.split('\n');
      rval = lines.map((s) => (StringRatchet.trimToNull(s) ? JSON.parse(s) : null)).filter((s) => !!s);
      //Logger.info('%j', rval);
    } else {
      Logger.error('Failed to fetch: %s : %s : %j : %s', res.status, res.statusText, res.headers, res.body);
    }

    return rval;
  }

  /*
  public static async gunzip(input: ReadableStream): Promise<Buffer> {
    const promise = new Promise<Buffer>(function (resolve, reject) {
      zlib.gunzip(input, function (error, result) {
        if (!error) resolve(result);
        else reject(error);
      });
    });
    return promise;
  }

   */

  public async scanSite(
    opts: CommonCrawlFetchOptions,
    onPage?: (idx: number, cnt: number, header: string) => Promise<any>,
  ): Promise<CommonCrawlScan> {
    const sw: StopWatch = new StopWatch();
    const rval: CommonCrawlScan = {
      options: opts,
      pageIndexes: [],
      parsed: [],
      errors: [],
    };
    Logger.info('Performing domain index scan with %j', opts);
    rval.pageIndexes = await this.search(opts);
    Logger.info('Found %d entries, pulling each', rval.pageIndexes.length);
    for (const [idx, ent] of rval.pageIndexes.entries()) {
      try {
        Logger.info('Pulling item %d of %d, %s', idx, rval.pageIndexes.length, sw.dumpExpected(idx / rval.pageIndexes.length));
        if (onPage) {
          try {
            await onPage(idx, rval.pageIndexes.length, ent.url);
          } catch (err) {
            Logger.warn('Failed onpage: %s', err);
          }
        }
        const parsed: WarcEntry = await this.pullPageEntry(ent);

        rval.parsed.push(parsed);
      } catch (err) {
        Logger.warn('Failed to pull %j : %s', ent, err);
        rval.errors.push({ pageIdx: ent, error: err });
      }
    }
    Logger.info('Completed full scan in %s', sw.dump());
    return rval;
  }
}
