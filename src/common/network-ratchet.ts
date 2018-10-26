/*
    Functions for simplifying some networking tasks
*/

import {Logger} from './logger';
import {ParsedUrl} from './parsed-url';

export class NetworkRatchet {
    private static LOCAL_IP: string = null;

    public static findLocalIp(useCache: boolean = true): Promise<string> {
        Logger.info('Attempting to find local IP (V 2)');
        if (NetworkRatchet.LOCAL_IP && useCache) {
            return Promise.resolve(NetworkRatchet.LOCAL_IP);
        }
        else {
            if (typeof window !== 'undefined') {
                return new Promise<string>(function (resolve, reject) {
                    try {
                        // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
                        let RTCPeerConnection = window['RTCPeerConnection'] || window['webkitRTCPeerConnection'] || window['mozRTCPeerConnection'];

                        if (RTCPeerConnection) {
                            let rtc = new RTCPeerConnection({iceServers: []});

                            let addrs = Object.create(null);
                            addrs['0.0.0.0'] = false;

                            if (1 || window['mozRTCPeerConnection']) {      // FF [and now Chrome!] needs a channel/stream to proceed
                                rtc.createDataChannel('', {reliable: false});
                            }

                            rtc.onicecandidate = function (evt) {
                                // convert the candidate to SDP so we can run it through our general parser
                                // see https://twitter.com/lancestout/status/525796175425720320 for details
                                if (evt.candidate) {
                                    NetworkRatchet.grepSDP('a=' + evt.candidate.candidate, addrs, resolve);
                                }
                            };

                            rtc.createOffer(function (offerDesc) {
                                NetworkRatchet.grepSDP(offerDesc.sdp, addrs, resolve);
                                rtc.setLocalDescription(offerDesc);
                            }, function (e) {
                                Logger.warn('Offer failed : %s', e);
                                resolve(NetworkRatchet.updateLocalIP('FIND_UNSUPPORTED'));
                            });

                        }
                        else {
                            Logger.warn('IP Address find not supported on this device');
                            resolve(NetworkRatchet.updateLocalIP('FIND_UNSUPPORTED'));
                        }
                    }
                    catch (err) {
                        Logger.warn('Error finding local ip address : %s', err);
                        resolve(NetworkRatchet.updateLocalIP('ERROR'));
                    }
                })
            }
            else {
                Logger.warn('Window not found, cannot calculate local ip');
                return Promise.resolve(NetworkRatchet.updateLocalIP('NO_WINDOW'));
            }
        }
    }

    // Break a url into a structure that is similar to what window.location returns
    public static parseUrl(href: string): ParsedUrl {
        var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
        var rval: ParsedUrl = match && {
            href: href,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        } as ParsedUrl;
        return rval;
    }

    // Just a helper function to make the build pattern here easier
    private static updateLocalIP(newIp: string): string {
        NetworkRatchet.LOCAL_IP = newIp;
        return NetworkRatchet.LOCAL_IP;
    }

    private static grepSDP(sdp, addrs, resolve): void {
        let hosts = [];
        sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
            if (~line.indexOf('a=candidate')) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                    addr = parts[4],
                    type = parts[7];
                if (type === 'host') {
                    NetworkRatchet.updateAddressList(addr, addrs, resolve);
                }
            } else if (~line.indexOf('c=')) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                var parts = line.split(' '),
                    addr = parts[2];
                NetworkRatchet.updateAddressList(addr, addrs, resolve);
            }
        });
    }

    private static updateAddressList(newAddr, addrs, resolve): void {
        if (newAddr in addrs) return;
        else addrs[newAddr] = true;
        let displayAddrs = Object.keys(addrs).filter(function (k) {
            return addrs[k];
        });
        if (displayAddrs && displayAddrs.length == 1) {
            resolve(NetworkRatchet.updateLocalIP(displayAddrs[0]));
        }
        else {
            let multi = displayAddrs.sort().join(',');
            Logger.warn('Multiple addresses found, returning sorted join : %s', multi);
            resolve(NetworkRatchet.updateLocalIP(multi));
        }
    }


    /*
    So, this code is actually nicer, but some browsers (e.g., the version of Chromium inside a 6.2.149.7 Brightsign)
    don't support the promise version, so instead we have the ugly hack above.  Leaving this in here for brighter
    days in the future.

    https://ourcodeworld.com/articles/read/257/how-to-get-the-client-ip-address-with-javascript-only
    public static findLocalIp(useCache: boolean = true) : Promise<string>{
        Logger.info("Attempting to find local IP (V 1)");
        if (NetworkRatchet.LOCAL_IP && useCache) {
            return Promise.resolve(NetworkRatchet.LOCAL_IP);
        }
        else {
            if (typeof window !== "undefined") {
                return new Promise<string>(function(resolve,reject){
                    //compatibility for firefox and chrome
                    // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
                    var myPeerConnection = window['RTCPeerConnection'] || window['mozRTCPeerConnection'] || window['webkitRTCPeerConnection'];
                    var pc = new myPeerConnection({
                            iceServers: []
                        }),
                        noop = function() {},
                        localIPs = {},
                        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
                        key;

                    //create a bogus data channel
                    pc.createDataChannel("");

                    // create offer and set local description
                    pc.createOffer({iceRestart:false}).then(function(sdp) {
                        sdp.sdp.split('\n').forEach(function(line) {
                            if (line.indexOf('candidate') < 0) return;
                            line.match(ipRegex).forEach((ip)=>{
                                if (!localIPs[ip]){
                                    NetworkRatchet.LOCAL_IP = ip;
                                    resolve(ip);
                                }
                                localIPs[ip] = true;
                            });
                        });

                        pc.setLocalDescription(sdp, noop, noop);
                    }).catch(function(reason) {
                        // An error occurred, so handle the failure to connect
                        Logger.warn("Failed to create peer connection offer : %s",reason);
                    });

                    //listen for candidate events
                    pc.onicecandidate = function(ice) {
                        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
                        ice.candidate.candidate.match(ipRegex).forEach((ip)=>{
                            if (!localIPs[ip]){
                                NetworkRatchet.LOCAL_IP = ip;
                                resolve(ip);
                            }
                            localIPs[ip] = true;
                        });
                    };
                })
            }
            else
            {
                Logger.warn("Window not found, cannot calculate local ip");
                NetworkRatchet.LOCAL_IP = "NO_WINDOW";
                return Promise.resolve(NetworkRatchet.LOCAL_IP);
            }
        }
    }
    */


}
