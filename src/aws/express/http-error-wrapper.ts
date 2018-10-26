export class HttpErrorWrapper extends Error {
    httpStatusCode: number;
    messageList: string[]; // In case more than one error should be contained, so we cannot use message
}