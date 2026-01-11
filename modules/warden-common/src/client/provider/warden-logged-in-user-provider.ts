import { WardenLoggedInUserWrapper } from "./warden-logged-in-user-wrapper.js";

export interface WardenLoggedInUserProvider {
  fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper;
  setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper);
  logOutUser(): void;
}
