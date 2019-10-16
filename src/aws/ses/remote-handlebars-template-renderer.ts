import 'reflect-metadata';
import * as handlebars from 'handlebars';
import Template = Handlebars.Template;
import * as fetch from 'portable-fetch';
import {StringRatchet} from '../../common/string-ratchet';
import {Logger} from '../../common/logger';
import {RatchetTemplateRenderer} from './ratchet-template-renderer';

/**
 */

export class RemoteHandlebarsTemplateRenderer implements RatchetTemplateRenderer{
    private cache: Map<string,HandlebarsTemplateDelegate>;

    constructor(private prefix: string='', private suffix: string ='', private maxCacheTemplates: number = 10) {
        if (this.maxCacheTemplates>0) {
            this.cache = new Map<string,HandlebarsTemplateDelegate>();
        }
    }

    public async renderTemplate(templateName:string, context:any): Promise<string> {
        return this.renderRemoteTemplate(templateName, context);
    }


    public async renderRemoteTemplate(templateName:string, inContext:any): Promise<string> {
        const template: HandlebarsTemplateDelegate = await this.fetchTemplate(templateName);
        const context: any = inContext || {};
        const result: string = (!!template)?template(context):null;
        return result;
    }

    public async renderTemplateDirect(templateText:string, context:any): Promise<string> {
        const template: Template = handlebars.compile(templateText);
        const result: string = template(context);
        return result;
    }

    private async fetchTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        let rval: HandlebarsTemplateDelegate = null;
        try {
            if (!!this.cache && this.cache.has(templateName)) {
                Logger.silly('Cache hit for template : %s', templateName);
                rval = this.cache.get(templateName);
            } else {
                Logger.debug('Cache miss for template : %s', templateName);
                const templateText: string = await this.fetchTemplateText(templateName);
                if (!!templateText) {
                    rval = handlebars.compile(templateText);
                    if (!!this.cache && !!rval) {
                        this.cache.set(templateName, rval);
                        if (this.cache.size>this.maxCacheTemplates) {
                            this.cache.delete(Array.from(this.cache.keys())[0]);
                        }
                    }
                }
            }
        } catch (err) {
            Logger.warn('Could not fetch and compile template : %s : %s', templateName, err, err);
            rval = null;
        }
        return rval;
    }

    private async fetchTemplateText(templateName: string): Promise<string> {
        let rval: string = null;
        const url: string = StringRatchet.trimToEmpty(this.prefix) + templateName + StringRatchet.trimToEmpty(this.suffix);
        try {
            const resp: Response = await fetch(url);
            rval = await resp.text();
        } catch (err) {
            Logger.warn('Could not fetch url : %s : %s', url, err, err);
            rval = null;
        }
        return rval;
    }


}
