/**
 * Code to simplify using the combination of Lambda and Express
 * (especially when using promises to generate results)
 */
import {NextFunction, Request, Response} from 'express';
import {Logger} from "../../common/logger";
import {HttpErrorWrapper} from "./http-error-wrapper";

export type promiseRouteFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export class LambdaExpressRatchet {

    // Using 'any' here since apiGateway is only present in the AWS adapted one
    public static extractEvent(request:any) : any{
         
        return (request && request.apiGateway)?request.apiGateway.event:null;
    }

    public static extractRequestContext(request:Request) : any {
        let evt = LambdaExpressRatchet.extractEvent(request);
        return (evt)?evt.requestContext:null;
    }

    public static extractAuthorizer(request:Request) : any {
        let rc = LambdaExpressRatchet.extractRequestContext(request);
        return (rc) ? rc.authorizer : null;
    }

    public static pathParam(request:any, paramName: string) : string
    {
        let evt : any = LambdaExpressRatchet.extractEvent(request);
        return (evt && evt.pathParameters)?evt.pathParameters[paramName]:null;
    }

    public static queryStringParameters(request:any) : any{
        let evt : any = LambdaExpressRatchet.extractEvent(request);
        return (evt && evt.queryStringParameters)?evt.queryStringParameters:{};
    }

    public static promiseResponseAdapter(fn: promiseRouteFunction, req: Request, response: Response, next: NextFunction=null) {
        Logger.silly("About to run PromiseResponseAdapter");
        fn(req, response, next).then(ok => {
            Logger.debug("PromiseResponseAdapter : success : "+JSON.stringify(ok));
            if (ok && ok.httpStatusCode && ok.data)
            {
                response.status(ok.httpStatusCode).json(ok.data);
            }
            else {
                response.status(200).json(ok);
            }
        }).
        catch
        (err =>{
            Logger.info("PromiseResponseAdapter : fail : "+String(err));
            let code = (err && err.httpStatusCode)?err.httpStatusCode:500;
            let messages = (err && err.message)?[err.message]:[String(err)];
            messages = (err.messageList && err.messageList.length>0)?err.messageList:messages;
            response.status(code).json({errors: messages});
        }) ;
    }

    public static makeError(message:string, httpStatusCode:number=500) : HttpErrorWrapper
    {
        let rval : HttpErrorWrapper = new HttpErrorWrapper(message);
        rval.httpStatusCode=httpStatusCode;
        return rval;
    }

    public static makeListError(messages:string[], httpStatusCode:number=500) : HttpErrorWrapper
    {
        let rval : HttpErrorWrapper = new HttpErrorWrapper('Multi-Message-Error');
        rval.httpStatusCode=httpStatusCode;
        rval.messageList=messages;
        return rval;
    }

}