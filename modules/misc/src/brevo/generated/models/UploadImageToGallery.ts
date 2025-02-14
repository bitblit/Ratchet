/* eslint-disable */
/**
 * SendinBlue API
 * SendinBlue provide a RESTFul API that can be used with any languages. With this API, you will be able to :   - Manage your campaigns and get the statistics   - Manage your contacts   - Send transactional Emails and SMS   - and much more...  You can download our wrappers at https://github.com/orgs/sendinblue  **Possible responses**   | Code | Message |   | :-------------: | ------------- |   | 200  | OK. Successful Request  |   | 201  | OK. Successful Creation |   | 202  | OK. Request accepted |   | 204  | OK. Successful Update/Deletion  |   | 400  | Error. Bad Request  |   | 401  | Error. Authentication Needed  |   | 402  | Error. Not enough credit, plan upgrade needed  |   | 403  | Error. Permission denied  |   | 404  | Error. Object does not exist |   | 405  | Error. Method not allowed  |   | 406  | Error. Not Acceptable  |
 *
 * The version of the OpenAPI document: 3.0.0
 * Contact: contact@sendinblue.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists } from '../runtime.js';

/**
 *
 * @export
 * @interface UploadImageToGallery
 */
export interface UploadImageToGallery {
  /**
   * The absolute url of the image (no local file). Maximum allowed size for image is 2MB. Allowed extensions for images are - jpeg, jpg, png, bmp, gif.
   * @type {string}
   * @memberof UploadImageToGallery
   */
  imageUrl: string;
  /**
   * Name of the image.
   * @type {string}
   * @memberof UploadImageToGallery
   */
  name?: string;
}

/**
 * Check if a given object implements the UploadImageToGallery interface.
 */
export function instanceOfUploadImageToGallery(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'imageUrl' in value;

  return isInstance;
}

export function UploadImageToGalleryFromJSON(json: any): UploadImageToGallery {
  return UploadImageToGalleryFromJSONTyped(json, false);
}

export function UploadImageToGalleryFromJSONTyped(json: any, ignoreDiscriminator: boolean): UploadImageToGallery {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    imageUrl: json['imageUrl'],
    name: !exists(json, 'name') ? undefined : json['name'],
  };
}

export function UploadImageToGalleryToJSON(value?: UploadImageToGallery | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    imageUrl: value.imageUrl,
    name: value.name,
  };
}
