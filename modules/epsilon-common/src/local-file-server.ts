import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";
import http, { IncomingMessage, Server, ServerResponse } from "http";
import https from "https";
import { LocalServerCert } from "./local-server-cert.js";
import { EsmRatchet } from "@bitblit/ratchet-common/lang/esm-ratchet";
import path from "path";
import fs from 'fs';
import mime from 'mime-types';
import { SimpleArgRatchet } from "@bitblit/ratchet-common/lang/simple-arg-ratchet";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { NumberRatchet } from "@bitblit/ratchet-common/lang/number-ratchet";
import { BooleanRatchet } from "@bitblit/ratchet-common/lang/boolean-ratchet";

/**
 * Very simple file server like 'serve', but can run https for things that
 * need that (like most apis these days)
 */
export class LocalFileServer {
  private server: Server;
  private urlRoot: string;

  constructor(
    private port: number = 8888,
    private https: boolean = false,
    private fileRoot: string = EsmRatchet.fetchDirName(import.meta.url)
  ) {
    if (fs.existsSync(fileRoot)) {
      if (!fs.statSync(fileRoot).isDirectory()) {
        throw ErrorRatchet.fErr('Cannot start with %s - it is not a directory', fileRoot);
      }
    } else {
      throw ErrorRatchet.fErr('Cannot start with %s - it does not exist', fileRoot);
    }
  }

  async runServer(): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      try {
        Logger.info('Starting file server on port %d at root %s', this.port, this.fileRoot);

        if (this.https) {
          const options = {
            key: LocalServerCert.CLIENT_KEY_PEM,
            cert: LocalServerCert.CLIENT_CERT_PEM,
          };
          Logger.info(
            'Starting https server - THIS SERVER IS NOT SECURE!  The KEYS are in the code!  Testing Server Only - Use at your own risk!',
          );
          this.server = https.createServer(options, this.requestHandler.bind(this)).listen(this.port);
          this.urlRoot = 'https://localhost:'+this.port;
        } else {
          this.server = http.createServer(this.requestHandler.bind(this)).listen(this.port);
          this.urlRoot = 'http://localhost:'+this.port;
        }
        Logger.info('File server is listening');

        // Also listen for SIGINT
        process.on('SIGINT', () => {
          Logger.info('Caught SIGINT - shutting down test server...');
          this.server.close();
          res(true);
        });
      } catch (err) {
        Logger.error('Local server failed : %s', err, err);
        rej(err);
      }
    });
  }

  async requestHandler(request: IncomingMessage, response: ServerResponse): Promise<any> {
    let reqPath: string = request.url.includes('?') ? request.url.substring(0, request.url.indexOf('?')) : request.url;
    let filePath: string = path.join(this.fileRoot, reqPath);
    if (fs.existsSync(filePath)) {
      let stats: fs.Stats = fs.statSync(filePath);
      if (stats.isFile()) {
        let mimetype: string = mime.contentType(filePath);
        if (mimetype==='video/mp2t') { // Not very likely for me!
          mimetype='text/x-typescript';
        }
        const buf:Buffer = fs.readFileSync(filePath);
        response.setHeader('Content-Type', mimetype);
        response.statusCode=200;
        response.end(buf);
      } else if (stats.isDirectory()) {
        this.writeFolderListToResponse(reqPath, filePath, response);
      }
    } else {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/html');
      response.end(`<html><body>No such file: ${reqPath}</body></html>`)
    }

  }

  public writeFolderListToResponse(rootpth: string, pth: string, response: ServerResponse ): void {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');

    let body: string = '<html><body><h1>Files in '+pth+'</h1><ul>';

    if (rootpth!=='/') {
      let sub: string = rootpth.substring(0, rootpth.lastIndexOf('/'));
      sub = sub.length===0 ? '/':sub;
      body+='<li><a href="'+sub+'">..</a></li>';
    }

    fs.readdirSync(pth).forEach(file=>{
      let fullUrl: string = this.urlRoot+rootpth;
      fullUrl += fullUrl.endsWith('/') ? file : '/'+file;
      body+=`<li><a href="${fullUrl}">${file}</a></li>`;
    });

    body+='</ul></body></html>';

    response.end(body);

  }

  public static async runLocalFileServerFromCliArgs(args: string[]): Promise<void> {
    Logger.setLevel(LoggerLevelName.debug);
    const pArgs: Record<string,string> = SimpleArgRatchet.parseSingleArgs(args, ['root','port','https']);
    const port:number = pArgs['port'] ? NumberRatchet.safeNumber(pArgs['port']) : 8888;
    const https:boolean = pArgs['https'] ? BooleanRatchet.parseBool(pArgs['https']) : false;
    const root: string = pArgs['root'] ?? EsmRatchet.fetchDirName(import.meta.url);
    const testServer: LocalFileServer = new LocalFileServer(port, https, root);
    const res: boolean = await testServer.runServer();
    Logger.info('Res was : %s', res);
  }



}
