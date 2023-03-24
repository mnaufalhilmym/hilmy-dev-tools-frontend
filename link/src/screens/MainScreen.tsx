import { gql } from "@apollo/client/core";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../api/gqlClient";
import ConfirmButton from "../components/button/ConfirmButton";
import PlainTextFieldWithLabel from "../components/form/PlainTextFieldWithLabel";
import PlainTextFieldWithLabelAndPrefix from "../components/form/PlainTextFieldWithLabelAndPrefix";
import LoadingSpinner from "../components/loading/LoadingSpinner";
import SiteHead from "../data/siteHead";
import randomString from "../helpers/randomString";
import showGqlError from "../helpers/showGqlError";

export default function MainScreen() {
  const [isLoadingCreateLink, setIsLoadingCreateLink] = createSignal(false);
  const [isShortUrlFilled, setIsShortUrlFilled] = createSignal(false);

  createRenderEffect(() => {
    SiteHead.title = "Create Link";
  });

  async function isShortUrlAvailable(shortUrl: string) {
    try {
      const result = await GqlClient.client.query<{
        linkByShortUrl: { longUrl: string };
      }>({
        query: gql`
          query LinkByShortUrl($shortUrl: String!) {
            linkByShortUrl(shortUrl: $shortUrl) {
              longUrl
            }
          }
        `,
        variables: {
          shortUrl,
        },
        fetchPolicy: "no-cache",
      });

      if (!result.data.linkByShortUrl) throw result.errors;

      return false;
    } catch (e) {
      return true;
    }
  }

  async function createShortUrl(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingCreateLink()) return;

    const target = event.target as typeof event.target & {
      long_url: { value: string };
      title: { value: string };
      short_url: { value: string };
    };

    const isUseRandomUrl = target.short_url.value.length === 0;

    let shortUrl = isUseRandomUrl ? randomString(4) : target.short_url.value;

    try {
      setIsLoadingCreateLink(true);

      if (isUseRandomUrl) {
        for (let isShortUrlUnique = false; !isShortUrlUnique; ) {
          isShortUrlUnique = await isShortUrlAvailable(shortUrl);
          if (!isShortUrlUnique) {
            shortUrl += randomString(1);
          }
        }
      }

      const result = await GqlClient.client.mutate<{
        createLink: { shortUrl: string; createdAt: string };
      }>({
        mutation: gql`
          mutation CreateLink(
            $title: String!
            $shortUrl: String!
            $longUrl: String!
          ) {
            createLink(title: $title, shortUrl: $shortUrl, longUrl: $longUrl) {
              shortUrl
              createdAt
            }
          }
        `,
        variables: {
          title: target.title.value ? target.title.value : shortUrl,
          shortUrl,
          longUrl: target.long_url.value,
        },
      });

      if (!result.data?.createLink.createdAt) throw result.errors;

      target.long_url.value = "";
      target.title.value = "";
      target.short_url.value = "";

      await navigator.clipboard.writeText(
        `${import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/${
          result.data.createLink.shortUrl
        }`
      );
      toast.success("Short link successfully created and copied to clipboard.");
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingCreateLink(false);
    }
  }

  function onInputShortUrl(
    e: InputEvent & {
      currentTarget: HTMLInputElement;
      target: Element;
    }
  ) {
    if (e.currentTarget.value && !isShortUrlFilled()) {
      setIsShortUrlFilled(true);
    } else if (!e.currentTarget.value && isShortUrlFilled()) {
      setIsShortUrlFilled(false);
    }
  }

  return (
    <div class="px-4 py-1">
      <div>
        <span class="text-2xl">Simplify your links</span>
      </div>
      <form onsubmit={createShortUrl} class="mt-8 max-w-2xl">
        <div>
          <div>
            <PlainTextFieldWithLabel
              label="Destination"
              name="long_url"
              placeholder="http://www.my_long_url.com"
              type="url"
              required
            />
          </div>
          <div class="mt-6">
            <PlainTextFieldWithLabel
              label={
                <>
                  <span>Title</span>
                  <span class="text-black/30"> (optional)</span>
                </>
              }
              name="title"
              placeholder="A catchy title"
              type="text"
            />
          </div>
          <div class="mt-6">
            <PlainTextFieldWithLabelAndPrefix
              label={
                <>
                  <span>Short link</span>
                  <span class="text-black/30"> (optional)</span>
                </>
              }
              prefix={
                <span classList={{ "text-black/30": !isShortUrlFilled() }}>
                  {import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/
                </span>
              }
              name="short_url"
              placeholder="memorable_words"
              type="text"
              oninput={onInputShortUrl}
            />
          </div>
        </div>
        <div class="mt-6">
          <div class="w-fit ml-auto">
            <ConfirmButton type="submit">
              <Show
                when={!isLoadingCreateLink()}
                fallback={
                  <div class="p-0.5">
                    <LoadingSpinner />
                  </div>
                }
              >
                Create
              </Show>
            </ConfirmButton>
          </div>
        </div>
      </form>
    </div>
  );
}
