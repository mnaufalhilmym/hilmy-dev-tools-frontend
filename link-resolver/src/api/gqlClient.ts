import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";

export default class GqlClient {
  private static _client: ApolloClient<NormalizedCacheObject>;

  static init() {
    this.update();
  }

  static update() {
    this._client = new ApolloClient({
      uri: import.meta.env.VITE_GQL_ENDPOINT,
      cache: new InMemoryCache(),
    });
  }

  static get client() {
    return this._client;
  }
}
