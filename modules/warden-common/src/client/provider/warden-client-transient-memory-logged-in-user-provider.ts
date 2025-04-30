import { WardenLoggedInUserProvider } from './warden-logged-in-user-provider.js';
import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper.js';
import { BehaviorSubject } from "rxjs";

export class WardenClientTransientMemoryLoggedInUserProvider<T> implements WardenLoggedInUserProvider<T> {
  private wrapper: WardenLoggedInUserWrapper<T>;

  public fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper<T> {
    return this.wrapper;
  }

  public logOutUser(): void {
    this.wrapper = null;
  }

  public setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper<T>) {
    this.wrapper = wrapper;
  }

  public loginChangedSubject(): BehaviorSubject<WardenLoggedInUserWrapper<any>> {
    return new BehaviorSubject<WardenLoggedInUserWrapper<any>>(this.wrapper);
  }
}
