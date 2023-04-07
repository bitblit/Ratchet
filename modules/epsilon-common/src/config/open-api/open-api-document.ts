import { OpenApiDocumentComponents } from './open-api-document-components.js';
import { OpenApiDocumentPath } from './open-api-document-path.js';

export interface OpenApiDocument {
  components: OpenApiDocumentComponents;
  paths: OpenApiDocumentPath[];
}
