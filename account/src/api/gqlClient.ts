import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";

export default class GqlClient {
  private static _client: ApolloClient<NormalizedCacheObject>;

  static async init() {
    await this.update();
  }

  static async update() {
    const token = document.cookie
      .split(";")
      .find((row) => row.trim().startsWith("token"))
      ?.split("=")?.[1];

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

  static get() {
    return this._client;
  }
}
