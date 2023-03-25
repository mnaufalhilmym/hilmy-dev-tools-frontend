import { gql } from "@apollo/client/core";
import { Component, createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "./api/gqlClient";
import getGqlErrorMsg from "./helpers/getGqlErrorMsg";
import parseGqlErrorMsg from "./helpers/parseGqlErrorMsg";
import ErrorWrapper from "./screens/error/ErrorWrapper";
import LoadingScreen from "./screens/LoadingScreen";

const App: Component = () => {
  const [error, setError] = createSignal<string>();

  createRenderEffect(() => {
    const shortUrl = window.location.pathname.slice(1);
    if (!shortUrl) {
      window.location.replace(import.meta.env.VITE_SITE_LINK_URL);
      return;
    }

    GqlClient.init();

    (async () => {
      try {
        const result = await GqlClient.client.query<{
          visitLink: { longUrl: string };
        }>({
          query: gql`
            query VisitLink($shortUrl: String!) {
              visitLink(shortUrl: $shortUrl) {
                longUrl
              }
            }
          `,
          variables: {
            shortUrl,
          },
        });

        if (!result.data.visitLink.longUrl) throw result.errors;

        window.location.replace(result.data.visitLink.longUrl);
      } catch (e) {
        setError(parseGqlErrorMsg(getGqlErrorMsg(e as any)));
        if (import.meta.env.DEV) {
          console.error(e);
        }
      }
    })();
  });
  return (
    <Show when={!error()} fallback={<ErrorWrapper error={error()} />}>
      <LoadingScreen />
    </Show>
  );
};

export default App;
