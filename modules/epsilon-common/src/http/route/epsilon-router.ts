import { RouteMapping } from './route-mapping.js';
import { ModelValidator } from '@bitblit/ratchet-misc/dist/model-validator/model-validator.js';
import { HttpConfig } from '../../config/http/http-config.js';

export interface EpsilonRouter {
  routes: RouteMapping[];
  openApiModelValidator: ModelValidator; // Must be set to use model validation in your route mappings
  config: HttpConfig;
}
