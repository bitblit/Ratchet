/**
 * tbd
 * @interface RatchetTemplateRenderer
 */
export interface RatchetTemplateRenderer {
    renderTemplate(templateName:string, context:any): Promise<string>
    renderTemplateDirect(templateValue:string, context:any): Promise<string>
}
