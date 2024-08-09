import { EpsilonConfig } from './config/epsilon-config.js';
import { WebHandler } from './http/web-handler.js';
import { BackgroundHandler } from './background/background-handler.js';
import { OpenApiDocument } from './config/open-api/open-api-document.js';
import { ModelValidator } from '@bitblit/ratchet-misc/model-validator/model-validator';
import { BackgroundManagerLike } from './background/manager/background-manager-like.js';

/**
 * This interface just wraps up everything that gets created by the config parsing process so that
 * I can hand it in a neat package to EpsilonGlobalHandler, rather than passing in a bunch of
 * params on the constructor
 */
export interface EpsilonInstance {
  config: EpsilonConfig;
  parsedOpenApiDoc: OpenApiDocument;
  modelValidator: ModelValidator;
  webHandler: WebHandler;
  backgroundHandler: BackgroundHandler;
  backgroundManager: BackgroundManagerLike;
}
