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

import { exists, mapValues } from '../runtime.js';
import type { UpdateSmtpTemplateSender } from './UpdateSmtpTemplateSender.js';
import {
  UpdateSmtpTemplateSenderFromJSON,
  UpdateSmtpTemplateSenderFromJSONTyped,
  UpdateSmtpTemplateSenderToJSON,
} from './UpdateSmtpTemplateSender.js';

/**
 *
 * @export
 * @interface UpdateSmtpTemplate
 */
export interface UpdateSmtpTemplate {
  /**
   * Tag of the template
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  tag?: string;
  /**
   *
   * @type {UpdateSmtpTemplateSender}
   * @memberof UpdateSmtpTemplate
   */
  sender?: UpdateSmtpTemplateSender;
  /**
   * Name of the template
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  templateName?: string;
  /**
   * Required if htmlUrl is empty. Body of the message (HTML must have more than 10 characters)
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  htmlContent?: string;
  /**
   * Required if htmlContent is empty. URL to the body of the email (HTML)
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  htmlUrl?: string;
  /**
   * Subject of the email
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  subject?: string;
  /**
   * Email on which campaign recipients will be able to reply to
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  replyTo?: string;
  /**
   * To personalize the «To» Field. If you want to include the first name and last name of your recipient, add {FNAME} {LNAME}. These contact attributes must already exist in your SendinBlue account. If input parameter 'params' used please use {{contact.FNAME}} {{contact.LNAME}} for personalization
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  toField?: string;
  /**
   * Absolute url of the attachment (no local file). Extension allowed: xlsx, xls, ods, docx, docm, doc, csv, pdf, txt, gif, jpg, jpeg, png, tif, tiff, rtf, bmp, cgm, css, shtml, html, htm, zip, xml, ppt, pptx, tar, ez, ics, mobi, msg, pub and eps
   * @type {string}
   * @memberof UpdateSmtpTemplate
   */
  attachmentUrl?: string;
  /**
   * Status of the template. isActive = false means template is inactive, isActive = true means template is active
   * @type {boolean}
   * @memberof UpdateSmtpTemplate
   */
  isActive?: boolean;
}

/**
 * Check if a given object implements the UpdateSmtpTemplate interface.
 */
export function instanceOfUpdateSmtpTemplate(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function UpdateSmtpTemplateFromJSON(json: any): UpdateSmtpTemplate {
  return UpdateSmtpTemplateFromJSONTyped(json, false);
}

export function UpdateSmtpTemplateFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateSmtpTemplate {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    tag: !exists(json, 'tag') ? undefined : json['tag'],
    sender: !exists(json, 'sender') ? undefined : UpdateSmtpTemplateSenderFromJSON(json['sender']),
    templateName: !exists(json, 'templateName') ? undefined : json['templateName'],
    htmlContent: !exists(json, 'htmlContent') ? undefined : json['htmlContent'],
    htmlUrl: !exists(json, 'htmlUrl') ? undefined : json['htmlUrl'],
    subject: !exists(json, 'subject') ? undefined : json['subject'],
    replyTo: !exists(json, 'replyTo') ? undefined : json['replyTo'],
    toField: !exists(json, 'toField') ? undefined : json['toField'],
    attachmentUrl: !exists(json, 'attachmentUrl') ? undefined : json['attachmentUrl'],
    isActive: !exists(json, 'isActive') ? undefined : json['isActive'],
  };
}

export function UpdateSmtpTemplateToJSON(value?: UpdateSmtpTemplate | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    tag: value.tag,
    sender: UpdateSmtpTemplateSenderToJSON(value.sender),
    templateName: value.templateName,
    htmlContent: value.htmlContent,
    htmlUrl: value.htmlUrl,
    subject: value.subject,
    replyTo: value.replyTo,
    toField: value.toField,
    attachmentUrl: value.attachmentUrl,
    isActive: value.isActive,
  };
}
