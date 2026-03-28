import https from "https";
import { LocalServerCert } from "./local-server-cert.js";
import { Agent } from "node:https";

/**
 * This can be added to fetch RequestInit's on the node side to allow this particular
 * cert to be used
 */
export class LocalFileServerHttpsFetch {

  public static createLocalFileServerAgent(): Agent {
    return new https.Agent ({
      ca: LocalServerCert.CLIENT_KEY_PEM
    });
  }

}
