import { InterApiAwsConfig } from './inter-api-aws-config.js';
import { InterApiProcessMapping } from './inter-api-process-mapping.js';

export interface InterApiConfig {
  aws: InterApiAwsConfig;
  processMappings: InterApiProcessMapping[];
}
