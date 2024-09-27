/**
 * Configuration of environmental server
 */
export interface EnvironmentServiceConfig {
  maxRetries: number;
  backoffMultiplierMS: number;
}
