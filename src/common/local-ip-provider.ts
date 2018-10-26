/** Classes implementing this interface can provide the current local ip address (as a string) **/
export interface LocalIpProvider {
    currentLocalIpAddress(): string;
}
