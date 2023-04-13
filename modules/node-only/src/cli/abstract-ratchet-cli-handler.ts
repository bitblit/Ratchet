import { BuildInformation } from '@bitblit/ratchet-common/dist/build/build-information.js';
import { CliRatchet } from './cli-ratchet.js';

export abstract class AbstractRatchetCliHandler {
  abstract fetchHandlerMap(): Record<string, any>;
  abstract fetchVersionInfo(): BuildInformation;

  public async findAndExecuteHandler(): Promise<void> {
    let handler: any = null;
    if (CliRatchet.argsAfterCommand(['version'])) {
      console.log('Version : ' + JSON.stringify(this.fetchVersionInfo()));
    } else {
      const handlerMap: Record<string, any> = this.fetchHandlerMap();
      const keys: string[] = Object.keys(handlerMap);
      let remainArgs: string[] = null;
      for (let i = 0; i < keys.length && !handler; i++) {
        remainArgs = CliRatchet.argsAfterCommand([keys[i], keys[i] + '.js']);
        if (remainArgs) {
          handler = handlerMap[keys[i]];
        }
      }
      if (handler) {
        console.debug('Running command with args ' + JSON.stringify(remainArgs));
        await handler(remainArgs);
      } else {
        console.log('Unrecognized command : ', process.argv);
        console.log('Valid commands are : ', Object.keys(handlerMap));
      }
    }
  }
}
