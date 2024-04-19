/* tslint:disable */
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
import type { GetContactCampaignStatsClickedInner } from './GetContactCampaignStatsClickedInner.js';
import {
    GetContactCampaignStatsClickedInnerFromJSON,
    GetContactCampaignStatsClickedInnerFromJSONTyped,
    GetContactCampaignStatsClickedInnerToJSON,
} from './GetContactCampaignStatsClickedInner.js';
import type { GetContactCampaignStatsOpenedInner } from './GetContactCampaignStatsOpenedInner.js';
import {
    GetContactCampaignStatsOpenedInnerFromJSON,
    GetContactCampaignStatsOpenedInnerFromJSONTyped,
    GetContactCampaignStatsOpenedInnerToJSON,
} from './GetContactCampaignStatsOpenedInner.js';
import type { GetContactCampaignStatsTransacAttributesInner } from './GetContactCampaignStatsTransacAttributesInner.js';
import {
    GetContactCampaignStatsTransacAttributesInnerFromJSON,
    GetContactCampaignStatsTransacAttributesInnerFromJSONTyped,
    GetContactCampaignStatsTransacAttributesInnerToJSON,
} from './GetContactCampaignStatsTransacAttributesInner.js';
import type { GetContactCampaignStatsUnsubscriptions } from './GetContactCampaignStatsUnsubscriptions.js';
import {
    GetContactCampaignStatsUnsubscriptionsFromJSON,
    GetContactCampaignStatsUnsubscriptionsFromJSONTyped,
    GetContactCampaignStatsUnsubscriptionsToJSON,
} from './GetContactCampaignStatsUnsubscriptions.js';
import type { GetExtendedContactDetailsAllOfStatisticsMessagesSent } from './GetExtendedContactDetailsAllOfStatisticsMessagesSent.js';
import {
    GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON,
    GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSONTyped,
    GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON,
} from './GetExtendedContactDetailsAllOfStatisticsMessagesSent.js';

/**
 * Campaign Statistics for the contact
 * @export
 * @interface GetContactCampaignStats
 */
export interface GetContactCampaignStats {
    /**
     * 
     * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
     * @memberof GetContactCampaignStats
     */
    messagesSent?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
    /**
     * 
     * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
     * @memberof GetContactCampaignStats
     */
    hardBounces?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
    /**
     * 
     * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
     * @memberof GetContactCampaignStats
     */
    softBounces?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
    /**
     * 
     * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
     * @memberof GetContactCampaignStats
     */
    complaints?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
    /**
     * 
     * @type {GetContactCampaignStatsUnsubscriptions}
     * @memberof GetContactCampaignStats
     */
    unsubscriptions?: GetContactCampaignStatsUnsubscriptions;
    /**
     * 
     * @type {Array<GetContactCampaignStatsOpenedInner>}
     * @memberof GetContactCampaignStats
     */
    opened?: Array<GetContactCampaignStatsOpenedInner>;
    /**
     * 
     * @type {Array<GetContactCampaignStatsClickedInner>}
     * @memberof GetContactCampaignStats
     */
    clicked?: Array<GetContactCampaignStatsClickedInner>;
    /**
     * 
     * @type {Array<GetContactCampaignStatsTransacAttributesInner>}
     * @memberof GetContactCampaignStats
     */
    transacAttributes?: Array<GetContactCampaignStatsTransacAttributesInner>;
}

/**
 * Check if a given object implements the GetContactCampaignStats interface.
 */
export function instanceOfGetContactCampaignStats(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function GetContactCampaignStatsFromJSON(json: any): GetContactCampaignStats {
    return GetContactCampaignStatsFromJSONTyped(json, false);
}

export function GetContactCampaignStatsFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetContactCampaignStats {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'messagesSent': !exists(json, 'messagesSent') ? undefined : ((json['messagesSent'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON)),
        'hardBounces': !exists(json, 'hardBounces') ? undefined : ((json['hardBounces'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON)),
        'softBounces': !exists(json, 'softBounces') ? undefined : ((json['softBounces'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON)),
        'complaints': !exists(json, 'complaints') ? undefined : ((json['complaints'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON)),
        'unsubscriptions': !exists(json, 'unsubscriptions') ? undefined : GetContactCampaignStatsUnsubscriptionsFromJSON(json['unsubscriptions']),
        'opened': !exists(json, 'opened') ? undefined : ((json['opened'] as Array<any>).map(GetContactCampaignStatsOpenedInnerFromJSON)),
        'clicked': !exists(json, 'clicked') ? undefined : ((json['clicked'] as Array<any>).map(GetContactCampaignStatsClickedInnerFromJSON)),
        'transacAttributes': !exists(json, 'transacAttributes') ? undefined : ((json['transacAttributes'] as Array<any>).map(GetContactCampaignStatsTransacAttributesInnerFromJSON)),
    };
}

export function GetContactCampaignStatsToJSON(value?: GetContactCampaignStats | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'messagesSent': value.messagesSent === undefined ? undefined : ((value.messagesSent as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON)),
        'hardBounces': value.hardBounces === undefined ? undefined : ((value.hardBounces as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON)),
        'softBounces': value.softBounces === undefined ? undefined : ((value.softBounces as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON)),
        'complaints': value.complaints === undefined ? undefined : ((value.complaints as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON)),
        'unsubscriptions': GetContactCampaignStatsUnsubscriptionsToJSON(value.unsubscriptions),
        'opened': value.opened === undefined ? undefined : ((value.opened as Array<any>).map(GetContactCampaignStatsOpenedInnerToJSON)),
        'clicked': value.clicked === undefined ? undefined : ((value.clicked as Array<any>).map(GetContactCampaignStatsClickedInnerToJSON)),
        'transacAttributes': value.transacAttributes === undefined ? undefined : ((value.transacAttributes as Array<any>).map(GetContactCampaignStatsTransacAttributesInnerToJSON)),
    };
}
