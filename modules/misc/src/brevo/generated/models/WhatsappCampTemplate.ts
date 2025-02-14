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
import type { ComponentItems } from './ComponentItems.js';
import { ComponentItemsFromJSON, ComponentItemsToJSON } from './ComponentItems.js';
import type { VariablesItems } from './VariablesItems.js';
import { VariablesItemsFromJSON, VariablesItemsToJSON } from './VariablesItems.js';

/**
 *
 * @export
 * @interface WhatsappCampTemplate
 */
export interface WhatsappCampTemplate {
  /**
   * name of the template
   * @type {string}
   * @memberof WhatsappCampTemplate
   */
  name?: string;
  /**
   * description of the template
   * @type {string}
   * @memberof WhatsappCampTemplate
   */
  category?: string;
  /**
   * language of the template
   * @type {string}
   * @memberof WhatsappCampTemplate
   */
  language?: string;
  /**
   *
   * @type {boolean}
   * @memberof WhatsappCampTemplate
   */
  containsButton?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof WhatsappCampTemplate
   */
  displayHeader?: boolean;
  /**
   * type of header
   * @type {string}
   * @memberof WhatsappCampTemplate
   */
  headerType?: string;
  /**
   * array of component item objects
   * @type {Array<ComponentItems>}
   * @memberof WhatsappCampTemplate
   */
  components?: Array<ComponentItems>;
  /**
   * array of variables item object
   * @type {Array<VariablesItems>}
   * @memberof WhatsappCampTemplate
   */
  headerVariables?: Array<VariablesItems>;
  /**
   * array of variables item variables
   * @type {Array<VariablesItems>}
   * @memberof WhatsappCampTemplate
   */
  bodyVariables?: Array<VariablesItems>;
  /**
   *
   * @type {string}
   * @memberof WhatsappCampTemplate
   */
  buttonType?: string;
  /**
   *
   * @type {boolean}
   * @memberof WhatsappCampTemplate
   */
  hideFooter?: boolean;
}

/**
 * Check if a given object implements the WhatsappCampTemplate interface.
 */
export function instanceOfWhatsappCampTemplate(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function WhatsappCampTemplateFromJSON(json: any): WhatsappCampTemplate {
  return WhatsappCampTemplateFromJSONTyped(json, false);
}

export function WhatsappCampTemplateFromJSONTyped(json: any, ignoreDiscriminator: boolean): WhatsappCampTemplate {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: !exists(json, 'name') ? undefined : json['name'],
    category: !exists(json, 'category') ? undefined : json['category'],
    language: !exists(json, 'language') ? undefined : json['language'],
    containsButton: !exists(json, 'contains_button') ? undefined : json['contains_button'],
    displayHeader: !exists(json, 'display_header') ? undefined : json['display_header'],
    headerType: !exists(json, 'header_type') ? undefined : json['header_type'],
    components: !exists(json, 'components') ? undefined : (json['components'] as Array<any>).map(ComponentItemsFromJSON),
    headerVariables: !exists(json, 'header_variables') ? undefined : (json['header_variables'] as Array<any>).map(VariablesItemsFromJSON),
    bodyVariables: !exists(json, 'body_variables') ? undefined : (json['body_variables'] as Array<any>).map(VariablesItemsFromJSON),
    buttonType: !exists(json, 'button_type') ? undefined : json['button_type'],
    hideFooter: !exists(json, 'hide_footer') ? undefined : json['hide_footer'],
  };
}

export function WhatsappCampTemplateToJSON(value?: WhatsappCampTemplate | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    category: value.category,
    language: value.language,
    contains_button: value.containsButton,
    display_header: value.displayHeader,
    header_type: value.headerType,
    components: value.components === undefined ? undefined : (value.components as Array<any>).map(ComponentItemsToJSON),
    header_variables: value.headerVariables === undefined ? undefined : (value.headerVariables as Array<any>).map(VariablesItemsToJSON),
    body_variables: value.bodyVariables === undefined ? undefined : (value.bodyVariables as Array<any>).map(VariablesItemsToJSON),
    button_type: value.buttonType,
    hide_footer: value.hideFooter,
  };
}
