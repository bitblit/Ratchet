/**
 * tbd
 * @interface RatchetTemplateRenderer
 */
export interface RatchetTemplateRenderer {
    renderTemplate(templateName:string, context:any, layoutName?: string): Promise<string>
    renderTemplateDirect(templateValue:string, context:any, layoutName?: string): Promise<string>
}
