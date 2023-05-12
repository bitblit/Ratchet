import { Logger } from '@bitblit/ratchet-common';
import { ErrorRatchet } from '@bitblit/ratchet-common';
import yaml from 'js-yaml';
import { ModelValidator } from '@bitblit/ratchet-misc';
import { BackgroundHttpAdapterHandler } from '../background/background-http-adapter-handler.js';
import { OpenApiDocument } from '../config/open-api/open-api-document.js';
import { EpsilonConfig } from '../config/epsilon-config.js';
import { EpsilonInstance } from '../epsilon-instance.js';
import { BackgroundHandler } from '../background/background-handler.js';
import { EpsilonRouter } from '../http/route/epsilon-router.js';
import { RouterUtil } from '../http/route/router-util.js';
import { WebHandler } from '../http/web-handler.js';
import { MisconfiguredError } from '../http/error/misconfigured-error.js';
import { EpsilonGlobalHandler } from '../epsilon-global-handler.js';
import { BackgroundManagerLike } from '../background/manager/background-manager-like.js';

export class EpsilonConfigParser {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public static epsilonConfigToEpsilonGlobalHandler(
    config: EpsilonConfig,
    backgroundManager?: BackgroundManagerLike
  ): EpsilonGlobalHandler {
    return new EpsilonGlobalHandler(EpsilonConfigParser.epsilonConfigToEpsilonInstance(config, backgroundManager));
  }

  public static epsilonConfigToEpsilonInstance(config: EpsilonConfig, backgroundManager?: BackgroundManagerLike): EpsilonInstance {
    this.validateGlobalConfig(config);
    const label: string = config?.label || 'NO EPSILON CONFIG LABEL SET';
    Logger.info('Creating epsilon : %s : BM : %j', label, backgroundManager);
    const parsed: OpenApiDocument = EpsilonConfigParser.parseOpenApiDocument(config.openApiYamlString);
    const modelValidator: ModelValidator = EpsilonConfigParser.openApiDocToValidator(parsed);
    const backgroundHttpAdapter: BackgroundHttpAdapterHandler = new BackgroundHttpAdapterHandler(
      config.backgroundConfig,
      modelValidator,
      backgroundManager
    );
    const backgroundHandler: BackgroundHandler = config.backgroundConfig
      ? new BackgroundHandler(config.backgroundConfig, backgroundManager, modelValidator)
      : null;

    // TODO: refactor me
    const epsilonRouter: EpsilonRouter = config.httpConfig
      ? RouterUtil.openApiYamlToRouterConfig(config.httpConfig, parsed, modelValidator, backgroundHttpAdapter)
      : null;
    const webHandler: WebHandler = epsilonRouter ? new WebHandler(epsilonRouter) : null;

    const inst: EpsilonInstance = {
      config: config,
      parsedOpenApiDoc: parsed,
      modelValidator: modelValidator,
      webHandler: webHandler,
      backgroundHandler: backgroundHandler,
      backgroundManager: backgroundManager,
    };

    return inst;
  }

  public static parseOpenApiDocument(yamlString: string): OpenApiDocument {
    if (!yamlString) {
      throw new MisconfiguredError('Cannot configure, missing either yaml or cfg');
    }
    const doc: OpenApiDocument = yaml.load(yamlString) as OpenApiDocument;
    return doc;
  }

  public static openApiDocToValidator(doc: OpenApiDocument): ModelValidator {
    let rval: ModelValidator = null;
    if (doc?.components?.schemas) {
      rval = ModelValidator.createFromParsedObject(doc.components.schemas);
    }
    return rval;
  }

  public static validateGlobalConfig(config: EpsilonConfig) {
    if (!config) {
      ErrorRatchet.throwFormattedErr('Config may not be null');
    }
    if (!config.openApiYamlString) {
      ErrorRatchet.throwFormattedErr('Config must define an open api document');
    }
    if (!!config.cron && !config.cron.timezone) {
      ErrorRatchet.throwFormattedErr('Cron is defined, but timezone is not set');
    }
  }
}
