import { RouteMapping } from './route-mapping';
import { ModelValidator } from '@bitblit/ratchet-misc';
import { HttpConfig } from '../../config/http/http-config';

export interface EpsilonRouter {
  routes: RouteMapping[];
  openApiModelValidator: ModelValidator; // Must be set to use model validation in your route mappings
  config: HttpConfig;
}
