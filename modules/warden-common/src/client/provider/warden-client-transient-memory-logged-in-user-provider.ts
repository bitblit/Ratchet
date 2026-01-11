import { WardenLoggedInUserProvider } from "./warden-logged-in-user-provider.js";
import { WardenLoggedInUserWrapper } from "./warden-logged-in-user-wrapper.js";

export class WardenClientTransientMemoryLoggedInUserProvider<T> implements WardenLoggedInUserProvider {
  private wrapper: WardenLoggedInUserWrapper;

  public fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper {
    return this.wrapper;
  }

  public logOutUser(): void {
    this.wrapper = null;
  }

  public setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper) {
    this.wrapper = wrapper;
  }

}
