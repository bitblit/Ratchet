export enum WardenExpiringTokenNoAccountBehavior {
  Send = 'Send' , // Just go ahead and send it - this is default to allow dynamic account creation
  SendAndLog = 'SendAndLog', // Send the token but log it specially
  LogAndDoNotSend = 'LogAndDoNotSend' // Logs the attempt but doesn't send a token (Note the client side still gets a normal response)
}