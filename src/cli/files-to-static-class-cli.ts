/*
    Takes in a list of static files, and a class name, and generates a static
    class containing each of the files in a map.  This is to allow static
    content to be passed through webpack safely
 */

import * as yargs from 'yargs';
import { FilesToStaticClass, Logger } from '../common';

/**
 TODO: should use switches to allow setting the various non-filename params
 **/
Logger.info('Running FilesToStaticClassCLi from command line arguments');
const argv: any = yargs
  .usage('Usage: FilesToStaticClass -c [ClassName] -o [OutputFileName] [Files...]')
  .demandOption(['c'])
  .demandCommand(1).argv;

FilesToStaticClass.process(argv['_'], argv.c, argv.o).then((rval) => {
  Logger.info('%s', rval);
});
