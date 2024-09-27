export type GenericAwsEventHandlerFunction<T> = (event: T) => Promise<void>;
