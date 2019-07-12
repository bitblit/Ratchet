/**
 * tbd
 * @interface EmailAttachment
 */
export interface EmailAttachment {
    /**
     * @type {string}
     * @memberof EmailAttachment
     */
    filename?: string;
    /**
     *
     * @type {string}
     * @memberof EmailAttachment
     */
    contentType?: string;
    /**
     *
     * @type {string}
     * @memberof EmailAttachment
     */
    base64Data?: string;
}