import { mapSchema, MapperKind, getDirective } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { UnauthorizedError } from "../../../http/error/unauthorized-error.ts";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import {BatchClient, SubmitJobCommandInput, SubmitJobCommandOutput, SubmitJobResponse} from '@aws-sdk/client-batch';
import { AwsBatchRatchet } from "@bitblit/ratchet-aws/batch/aws-batch-ratchet";
import { BackgroundManagerLike } from "../../../background/manager/background-manager-like.ts";
import { DateTime } from "luxon";
import { Base64Ratchet } from "@bitblit/ratchet-common/lang/base64-ratchet";
import { ContextUtil } from "../../../util/context-util.ts";

type ResolverFn = (parent: any, args: any, ctx: any, info: any) => any;

export class EpsilonBackgroundProcessorGqlBridge {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static BRIDGE_TYPES =
    `
      type EpsilonBackgroundProcessStatusRequest {
        guid: String!
        createdEpochMS: Int!
        traceId: String
        traceDepth: Int
      }

      type EpsilonBackgroundProcessStatus {
        request: EpsilonBackgroundProcessStatusRequest
        running: Boolean
        runtimeMS: Int
        resultJson: String
        error: String
      }
    
      input EpsilonBackgroundProcessStartRequest {
        processName: String!
        processDataJson: String
        startMode: EpsilonBackgroundProcessStartMode!
      }
      
      enum EpsilonBackgroundProcessStartMode {
        RunImmediate
        LongRunning
        EnqueueOnly
        EnqueueAndStart
      }
    `;

  public static BRIDGE_MUTATIONS =
    `
      startBackgroundProcess(request: EpsilonBackgroundProcessStartRequest!): String @authenticated
    `;

  public static BRIDGE_QUERIES =
    `
      readBackgroundProcessStatus(guid: String!): EpsilonBackgroundProcessStatus @authenticated
    `;

  public static createStartBackgroundProcessResolver(awsBatchRatchet:AwsBatchRatchet, backgroundManager: BackgroundManagerLike): ResolverFn {
    const rval: ResolverFn = async (root, { request }, _context) => {
      //const requestCast: ParaTradeBackgroundProcessStartRequest = request;
      Logger.info('epsilonStartBackgroundProcess : %j', request);
      let rval: string = null;
      const data: any = StringRatchet.trimToNull(request.processDataJson) ? JSON.parse(request.processDataJson) : {};
      if (request.startMode === 'LongRunning') {
        Logger.info('Running in AWS Batch');
        Logger.info('Scheduling for batch : %j', data);

        //const resp: SubmitJobCommandOutput = await this.startAwsBatchProcessor.scheduleBackgroundTaskV2(requestCast.processName, data);
        const resp: SubmitJobCommandOutput = await EpsilonBackgroundProcessorGqlBridge.scheduleBackgroundTaskV1(
          awsBatchRatchet,
          request.processName,
          data,
        );
        Logger.info('Result of submission was %s', resp);
      } else {
        if (request.startMode === 'RunImmediate') {
          Logger.info('Running immediate');
          rval = await backgroundManager
            .fireImmediateProcessRequestByParts(request.processName, data);
        } else {
          const fireStartMessage: boolean = request.startMode === 'EnqueueAndStart';
          Logger.info('Enqueueing, fire start = %s', fireStartMessage);

          rval = await backgroundManager
            .addEntryToQueueByParts(
              request.processName,
              data,
              request.startMode === 'EnqueueAndStart',
            );
        }
      }
      Logger.info('Returning : %s', rval);
      return rval;
    }
    return rval;
  }

  private static async scheduleBackgroundTaskV1(
    awsBatch: AwsBatchRatchet,
    taskName: string,
    data: any = {},
  ): Promise<SubmitJobCommandOutput> {
    const jobName: string = `${awsBatch.defaultJobDefinition}-${taskName}_${DateTime.utc().toFormat('yyyy-MM-dd-HH-mm')}`;
    const options: SubmitJobCommandInput = {
      jobName: jobName,
      jobDefinition: awsBatch.defaultJobDefinition,
      jobQueue: awsBatch.defaultQueueName,
      parameters: {
        taskName: taskName,
        taskDataBase64: Base64Ratchet.encodeStringToBase64String(JSON.stringify(data || {})),
        taskMetaDataBase64: Base64Ratchet.encodeStringToBase64String('{}'),
        traceId: ContextUtil.currentTraceId(),
        traceDepth: StringRatchet.safeString(ContextUtil.currentTraceDepth() + 1),
      },
    };
    Logger.info('scheduleBackgroundTaskV3a : options: %j', options);
    const rval: SubmitJobCommandOutput = await awsBatch.scheduleJob(options);
    return rval;
  }


}