/**
 * Code to simplify using the combination of Lambda and Express
 * (especially when using promises to generate results)
 */
import {NextFunction, Request, Response} from 'express';
import {Logger} from '../../common/logger';
import {HttpErrorWrapper} from './http-error-wrapper';
import {APIGatewayEvent, APIGatewayEventRequestContext, AuthResponseContext} from 'aws-lambda';

export type promiseRouteFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export class LambdaExpressRatchet {

    // Using 'any' here since apiGateway is only present in the AWS adapted one
    public static extractEvent(request: any): APIGatewayEvent {

        return (request && request.apiGateway) ? request.apiGateway.event : null;
    }

    public static extractStage(request: Request): string {
        let rc: APIGatewayEventRequestContext = LambdaExpressRatchet.extractRequestContext(request);
        return (rc) ? rc.stage : null;
    }

    public static extractRequestContext(request: Request): APIGatewayEventRequestContext {
        let evt: APIGatewayEvent = LambdaExpressRatchet.extractEvent(request);

        return (evt) ? evt.requestContext : null;
    }

    public static ipAddressChain(request: Request): string[] {
        const headerVal: string = LambdaExpressRatchet.header(request, 'X-Forwarded-For');
        let headerList: string[] = (headerVal) ? String(headerVal).split(',') : [];
        headerList = headerList.map(s => s.trim());
        return headerList;
    }

    public static ipAddress(request: Request): string {
        const list: string[] = LambdaExpressRatchet.ipAddressChain(request);
        return (list && list.length > 0) ? list[0] : null;
    }

    public static extractAuthorizer(request: Request): AuthResponseContext {
        let rc: APIGatewayEventRequestContext = LambdaExpressRatchet.extractRequestContext(request);
        return (rc) ? rc.authorizer : null;
    }

    public static header(request: any, headerName: string): any {
        let evt: APIGatewayEvent = LambdaExpressRatchet.extractEvent(request);
        return (evt && evt.headers) ? evt.headers[headerName] : null;
    }

    public static pathParam(request: any, paramName: string): string {
        let evt: APIGatewayEvent = LambdaExpressRatchet.extractEvent(request);
        return (evt && evt.pathParameters) ? evt.pathParameters[paramName] : null;
    }

    public static queryStringParameters(request: any): any {
        let evt: APIGatewayEvent = LambdaExpressRatchet.extractEvent(request);
        return (evt && evt.queryStringParameters) ? evt.queryStringParameters : {};
    }

    public static promiseResponseAdapter(fn: promiseRouteFunction, req: Request, response: Response, next: NextFunction = null) {
        Logger.silly('About to run PromiseResponseAdapter');
        fn(req, response, next).then(ok => {
            Logger.debug('PromiseResponseAdapter : success : ' + JSON.stringify(ok));
            if (ok) {
                let status = (ok.httpStatusCode) ? ok.httpStatusCode : 200;
                let body = (ok.data) ? ok.data : ok;

                response.status(status);

                if (ok.contentType) {
                    response.contentType(ok.contentType).end(body);
                }
                else {
                    response.json(body);
                }
            }
            else {
                response.status(500).json({errors: ['empty body supplied']});
            }

        }).catch
        (err => {
            let code: number = 500;
            let messages = ['Failure'];
            try {
                Logger.info('PromiseResponseAdapter : fail : ' + String(err));
                code = (err && err.httpStatusCode) ? err.httpStatusCode : 500;
                messages = (err && err.message) ? [String(err.message)] : [String(err)];
                messages = (err.messageList && err.messageList.length > 0) ? err.messageList.map(m => String(m)) : messages;
            }
            catch (err2) {
                Logger.warn('Secondary failure : ' + err2);
                code = 500;
                messages = ['Secondary failure ' + err2];
            }
            response.status(code).json({errors: messages});
        });
    }

    public static makeError(message: string, httpStatusCode: number = 500): HttpErrorWrapper {
        let rval: HttpErrorWrapper = new HttpErrorWrapper(message);
        rval.httpStatusCode = httpStatusCode;
        return rval;
    }

    public static makeListError(messages: string[], httpStatusCode: number = 500): HttpErrorWrapper {
        let rval: HttpErrorWrapper = new HttpErrorWrapper('Multi-Message-Error');
        rval.httpStatusCode = httpStatusCode;
        rval.messageList = messages;
        return rval;
    }

}