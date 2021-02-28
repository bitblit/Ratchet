import BuildProperties from './build-properties.json';

export class Statics {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static buildProperties(): any {
    return BuildProperties;
  }
}
