import {Injectable} from '@angular/core';

// Taken from https://juristr.com/blog/2016/09/ng2-get-window-ref/
// Here to make transition to Angular Universal later easier

/* This interface is optional, showing how you can add strong typings for custom globals.
// Just use "Window" as the type if you don't have custom global stuff
export interface ICustomWindow extends Window {
  __custom_global_stuff: string;
} */

function getWindow(): any {
  if (typeof window !== 'undefined') {
    return window;
  } else {
    throw new Error('Cannot find window object - running in SSR?');
  }
}

@Injectable({providedIn: 'root'})
export class WindowRefService {
  public nativeWindow(): Window {
    return getWindow();
  }
}
