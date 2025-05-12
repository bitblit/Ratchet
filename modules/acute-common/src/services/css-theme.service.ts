import { Injectable } from '@angular/core';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";

/**
 * For changing themes.
 *
 * Steps:
 *
 * In root css setup all the variables youll use like:
 * // Default variable set
 * :root {
 *   --twBackgroundColor: #121212;
 *   --twTextColor: #E0E0E0;
 *   --twStatusLineBackgroundColor: #1E1E1E;
 *   --twOffsetBackgroundColor: #1E1E1E;
 *   --twStatusLineTextColor: #E0E0E0;
 *   --twInputTextColor: #90caf9;
 *   --twMainFont: Georgia, serif;
 *
 *   --twPlayingWidth: 80vw;
 *   --twMainTextSize: 1em;
 *   --twSubTextSize: .8em;
 *   --twStatusLineTextSize: 1.2em;
 *   --twMainHeaderSize: 4em;
 *   --twSubHeaderSize: 2em;
 * }
 *
 * Use the variables in your css
 *
 * Then use this to modify them
 *
 *
 *
 */

@Injectable({providedIn: 'root'})
export class CssThemeService<ThemeObject> {

  public setCssVariable(name: string, value: string, scope: HTMLElement = document.documentElement, prefix: string='--'): void {
    scope.style.setProperty(prefix+name, value);
  }

  public getCssVariable(name: string, scope: HTMLElement = document.documentElement, prefix: string='--'): string | null {
    return StringRatchet.trimToNull(getComputedStyle(scope).getPropertyValue(prefix+name));
  }


  public applyTheme(rec: ThemeObject): void {
    Object.keys(rec).forEach(k => {
      this.setCssVariable('--'+k, rec[k]);
    })
  }

  public setNumericVariable(name: string, value: number, suffix: string, scope: HTMLElement = document.documentElement, prefix: string='--'): void {
      this.setCssVariable(name, value+suffix, scope, prefix);
  }

  public setNumericVariableBetweenBounds(name: string, value: number, minInclusive: number, maxExclusive: number, suffix: string, scope: HTMLElement = document.documentElement, prefix: string='--'): boolean {
    if (value>=minInclusive && value<maxExclusive) {
      this.setCssVariable(name, value+suffix, scope, prefix);
      return true;
    } else {
      Logger.info('Ignoring out of bounds value %d', value);
      return false;
    }
  }

  public modifyNumericVariableBetweenBounds(name: string, delta: number, min: number, max: number, suffix: string, scope: HTMLElement = document.documentElement, prefix: string='--'): boolean {
    const curValString: string | null = this.getCssVariable(name, scope, prefix);
    if (curValString) {
      const curVal: number = parseInt(curValString.substring(0, curValString.length-suffix.length));
      const newVal: number = curVal + delta;
      return this.setNumericVariableBetweenBounds(name, newVal, min, max, suffix, scope, prefix);
    } else {
      Logger.info('No current value for %s', name);
      return false;
    }

  }


}
