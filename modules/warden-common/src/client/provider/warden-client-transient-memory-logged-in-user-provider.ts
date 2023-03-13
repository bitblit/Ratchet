import { WardenLoggedInUserProvider } from './warden-logged-in-user-provider';
import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper';

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
}
