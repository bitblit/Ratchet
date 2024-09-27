/**
 * Classes implementing EnvironmentServiceProvider offer the ability to fetch a configuration
 * object from _somewhere_
 */
export interface EnvironmentServiceProvider<T> {
  fetchConfig(name: string): Promise<T>;
}
