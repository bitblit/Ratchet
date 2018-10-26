/** Classes implementing this interface return a timestamp of their last success **/
export interface LastSuccessProvider {
    lastSuccess(): number;
}