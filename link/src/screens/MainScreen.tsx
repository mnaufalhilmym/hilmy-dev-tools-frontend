import { gql } from "@apollo/client/core";
import moment from "moment";
import { createRenderEffect, createSignal, For, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../api/gqlClient";
import ConfirmButton from "../components/button/ConfirmButton";
import PlainTextFieldWithLabel from "../components/form/PlainTextFieldWithLabel";
import PlainTextFieldWithLabelAndPrefix from "../components/form/PlainTextFieldWithLabelAndPrefix";
import SuBdirectoryArrowRightIcon from "../components/icon/SubdirectoryArrowRightIcon";
import LoadingSpinner from "../components/loading/LoadingSpinner";
import SiteHead from "../data/siteHead";
import copyToClipboard from "../helpers/copyToClipboard";
import randomString from "../helpers/randomString";
import showGqlError from "../helpers/showGqlError";
import LinkT from "../types/link.type";

export default function MainScreen() {
  const [isLoadingCreateLink, setIsLoadingCreateLink] = createSignal(false);
  const [isShortUrlFilled, setIsShortUrlFilled] = createSignal(false);
  const [recentlyCreatedLinks, setRecentlyCreatedLinks] = createSignal<LinkT[]>(
    []
  );

  createRenderEffect(() => {
    SiteHead.title = "Create link";
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
    } catch {
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
        createLink: LinkT;
      }>({
        mutation: gql`
          mutation CreateLink(
            $title: String!
            $shortUrl: String!
            $longUrl: String!
          ) {
            createLink(title: $title, shortUrl: $shortUrl, longUrl: $longUrl) {
              id
              title
              shortUrl
              longUrl
              visits
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
      if (target.short_url.value) {
        setIsShortUrlFilled(false);
      }
      target.short_url.value = "";

      let isCopySuccess = false;
      try {
        await copyToClipboard(
          `${import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/${
            result.data.createLink.shortUrl
          }`
        );
        isCopySuccess = true;
      } catch {}

      toast.success(
        `Short link successfully created${
          isCopySuccess ? " and copied to clipboard" : ""
        }.`
      );

      setRecentlyCreatedLinks(() => {
        let newLinks: LinkT[] = [];
        if (recentlyCreatedLinks().length < 3) {
          newLinks = [...recentlyCreatedLinks(), result.data!.createLink];
        } else {
          newLinks = [
            recentlyCreatedLinks()[1],
            recentlyCreatedLinks()[2],
            result.data!.createLink,
          ];
        }
        return newLinks;
      });
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingCreateLink(false);
    }
  }

  async function copyClickedLinkToClipboard(shortUrl: string) {
    try {
      await copyToClipboard(
        `${import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/${shortUrl}`
      );
      toast.success("Short link successfully copied to clipboard.");
    } catch (e) {
      toast.error("Failed to copy the short link.");
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
    <div class="min-h-full px-4 flex gap-x-4">
      <div class="flex-[2] max-w-2xl pb-8">
        <div class="pt-4 sm:pt-1">
          <span class="text-2xl">Simplify your links</span>
        </div>
        <form onsubmit={createShortUrl} class="mt-8">
          <div>
            <div>
              <PlainTextFieldWithLabel
                label="Destination"
                name="long_url"
                title="A valid URL"
                placeholder="http://www.my_long_url.com"
                type="url"
                required
                pattern={`^(?!.*(${
                  import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN
                }|${window.location.host})).*$`}
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
                title="A valid URL path with at least 3 letters"
                placeholder="memorable_words"
                type="text"
                pattern="^[a-zA-Z0-9-_]{3,}$"
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

      <div class="hidden sm:block flex-1 max-w-[33%]">
        <Show when={recentlyCreatedLinks().length > 0}>
          <div class="h-full pl-4 pb-8 border-l">
            <div class="pt-4 sm:pt-1">
              <span class="text-2xl">Recently created links</span>
            </div>
            <div class="mt-8 space-y-6">
              <For each={recentlyCreatedLinks()}>
                {(link) => (
                  <button
                    type="button"
                    onclick={() => copyClickedLinkToClipboard(link.shortUrl)}
                    class="block w-full text-left"
                  >
                    <div class="flex">
                      <span class="text-xs text-black/70 truncate">
                        {moment
                          .utc(link.createdAt)
                          .local()
                          .format("MMM DD, YYYY")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div class="my-0.5">
                      <span class="truncate">{link.title}</span>
                    </div>
                    <div class="text-sm">
                      <div class="flex text-teal-500">
                        <span>{`${
                          import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN
                        }/`}</span>
                        <span class="truncate">{link.shortUrl}</span>
                      </div>
                      <div class="flex gap-x-1">
                        <span class="flex pt-[1.5px]">
                          <SuBdirectoryArrowRightIcon />
                        </span>
                        <span class="truncate">{link.longUrl}</span>
                      </div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
