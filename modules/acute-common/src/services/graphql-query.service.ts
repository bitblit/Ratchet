import { Injectable } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { GraphqlRatchet } from "@bitblit/ratchet-graphql/graphql/graphql-ratchet";
import { BlockUiComponent } from "../components/dialogs/block-ui/block-ui.component";
import { AuthorizationStyle } from "@bitblit/ratchet-graphql/graphql/authorization-style";
import { ErrorHandlingApproach } from "@bitblit/ratchet-common/lang/error-handling-approach";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";

@Injectable({ providedIn: 'root' })
export class GraphqlQueryService {
  constructor(
    private graphqlRatchet: GraphqlRatchet,
    private dialogService: DialogService,
    private messageService: MessageService,
  ) {}

  public async executeQuery<T>(
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru
  ): Promise<T | null> {
    let rval: T | null = null;
    this.messageService.add({ severity: 'info', summary: 'Running query', detail: queryName, life: 3000 });

    Logger.info('eq: %j -: %s --: %s ---: %j', queryName, variables);

    try {
      rval = await this.graphqlRatchet.executeQuery<T>(queryName, variables, authStyle);
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    } finally {
      this.messageService.clear();
    }
    return rval;
  }

  public async executeQueryWithBlock<T>(
    blockMessage: string,
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru
  ): Promise<T | null> {
    let rval: T | null = null;
    this.messageService.add({ severity: 'info', summary: 'Running query', detail: queryName, life: 3000 });

    Logger.info('eqb: %j -: %s --: %s ---: %j', blockMessage, queryName, variables);

    try {
      rval = await BlockUiComponent.runPromiseWithUiBlock<T>(
        this.dialogService,
        this.graphqlRatchet.executeQuery<T>(queryName, variables, authStyle),
        blockMessage,
      );
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    } finally {
      this.messageService.clear();
    }

    return rval;
  }

  public async executeMutate<T>(
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru
  ): Promise<T | null> {
    let rval: T | null = null;
    this.messageService.add({ severity: 'info', summary: 'Running query', detail: queryName, life: 3000 });

    Logger.info('eq: %j -: %s --: %s ---: %j', queryName, variables);

    try {
      rval = await this.graphqlRatchet.executeMutate<T>(queryName, variables, authStyle);
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    } finally {
      this.messageService.clear();
    }

    return rval;
  }

  public async executeMutateWithBlock<T>(
    blockMessage: string,
    queryName: string,
    variables: any,
    authStyle: AuthorizationStyle = AuthorizationStyle.TokenRequired,
    errorHandling: ErrorHandlingApproach = ErrorHandlingApproach.LogAndPassThru
  ): Promise<T | null> {
    let rval: T | null = null;
    this.messageService.add({ severity: 'info', summary: 'Running query', detail: queryName, life: 3000 });

    try {
      rval = await BlockUiComponent.runPromiseWithUiBlock<T>(
        this.dialogService,
        this.graphqlRatchet.executeMutate<T>(queryName, variables, authStyle),
        blockMessage,
      );
    } catch (err) {
      ErrorRatchet.handleErrorByApproach(err, errorHandling, LoggerLevelName.error, 'GraphQL Error : %s');
    } finally {
      this.messageService.clear();
    }

    return rval;
  }
}
