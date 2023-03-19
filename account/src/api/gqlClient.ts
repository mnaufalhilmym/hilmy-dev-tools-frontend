import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { getTokenFromCookie } from "../helpers/cookie";

export default class GqlClient {
  private static _client: ApolloClient<NormalizedCacheObject>;

  static init() {
    this.update();
  }

  static update() {
    const token = getTokenFromCookie();

    this._client = new ApolloClient({
      uri: import.meta.env.VITE_GQL_ENDPOINT,
      cache: new InMemoryCache(),
      headers: !!token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  }

  static get client() {
    return this._client;
  }
}
