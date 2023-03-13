import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper';

export interface WardenLoggedInUserProvider<T> {
  fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper<T>;
  setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper<T>);
  logOutUser(): void;
}
