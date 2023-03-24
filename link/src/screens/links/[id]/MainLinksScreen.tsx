import { gql } from "@apollo/client/core";
import { Link, useNavigate, useParams } from "@solidjs/router";
import moment from "moment";
import { createRenderEffect, createSignal, For, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../../../api/gqlClient";
import CalendarMonth from "../../../components/icon/CalendarMonthIcon";
import CancelIcon from "../../../components/icon/CancelIcon";
import ContentCopyIcon from "../../../components/icon/ContentCopyIcon";
import DeleteIcon from "../../../components/icon/DeleteIcon";
import EditIcon from "../../../components/icon/EditIcon";
import SaveIcon from "../../../components/icon/SaveIcon";
import SuBdirectoryArrowRightIcon from "../../../components/icon/SubdirectoryArrowRightIcon";
import VisibilityIcon from "../../../components/icon/VisibilityIcon";
import SiteHead from "../../../data/siteHead";
import SitePath from "../../../data/sitePath";
import getGqlErrorMsg from "../../../helpers/getGqlErrorMsg";
import showGqlError from "../../../helpers/showGqlError";
import LinkT from "../../../types/link.type";
import styles from "./MainLinkScreen.module.css";

export default function MainLinksScreen() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [links, setLinks] = createSignal<LinkT[]>([]);
  const [selectedLink, setSelectedLink] = createSignal<LinkT>();
  const [isEditing, setIsEditing] = createSignal<"title" | "short_url">();
  const [textEdit, setTextEdit] = createSignal<string>();
  const [isLoadingGetLinks, setIsLoadingGetLinks] = createSignal(false);
  const [isLoadingExecute, setIsLoadingExecute] = createSignal(false);

  async function getLinks() {
    try {
      setIsLoadingGetLinks(true);

      const result = await GqlClient.client.query<{
        links: LinkT[];
      }>({
        query: gql`
          query Links {
            links {
              id
              title
              shortUrl
              longUrl
              visits
              createdAt
            }
          }
        `,
        fetchPolicy: "no-cache",
      });

      if (!result.data.links) throw result.errors;

      setLinks(result.data.links);
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingGetLinks(false);
    }
  }

  createRenderEffect(() => {
    SiteHead.title = "Manage Link";

    getLinks();
  });

  createRenderEffect(() => {
    if (params.id) {
      if (links().length > 0) {
        setSelectedLink(links().find((link) => link.id === params.id));
      }
    } else {
      setSelectedLink();
    }
  });

  async function copyShortUrl() {
    await navigator.clipboard.writeText(
      `${import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/${
        selectedLink()?.shortUrl
      }`
    );
    toast.success("Short link successfully copied to clipboard.");
  }

  function editMode(mode?: "title" | "short_url") {
    let content: string | undefined;
    if (mode === "title") {
      content = selectedLink()?.title;
    } else if (mode === "short_url") {
      content = selectedLink()?.shortUrl;
    }
    setTextEdit(content);
    setIsEditing(mode);
  }

  async function saveEditedShortLink() {
    const linkId = selectedLink()?.id;
    const content = textEdit();
    const mode = isEditing();
    if (!linkId || !mode || !content) return;

    if (isLoadingExecute()) return;
    setIsLoadingExecute(true);

    try {
      await toast.promise(
        (async () => {
          const result = await GqlClient.client.mutate<{
            updateLink: { title: string; shortUrl: string };
          }>({
            mutation: gql`
              mutation UpdateLink(
                $id: UUID!
                $title: String
                $shortUrl: String
              ) {
                updateLink(id: $id, title: $title, shortUrl: $shortUrl) {
                  title
                  shortUrl
                }
              }
            `,
            variables: {
              id: linkId,
              title: mode === "title" ? content : undefined,
              shortUrl: mode === "short_url" ? content : undefined,
            },
          });

          if (
            !result.data?.updateLink.title ||
            !result.data.updateLink.shortUrl
          )
            throw result.errors;

          setLinks((links) =>
            links.map((link) => {
              if (link.id === linkId) {
                const _link = { ...link };
                _link.title = result.data!.updateLink.title;
                _link.shortUrl = result.data!.updateLink.shortUrl;
                return _link;
              }
              return link;
            })
          );
        })(),
        {
          loading: "Updating link title...",
          success: (val) => <span>Successfully updated the link title</span>,
          error: (e) => <span>{getGqlErrorMsg(e)}</span>,
        }
      );

      setIsEditing();
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e);
      }
    } finally {
      setIsLoadingExecute(false);
    }
  }

  async function deleteLink() {
    const linkId = selectedLink()?.id;
    if (!linkId) return;

    if (isLoadingExecute()) return;
    setIsLoadingExecute(true);

    try {
      await toast.promise(
        (async () => {
          const result = await GqlClient.client.mutate<{
            deleteLink: { isSuccess: boolean };
          }>({
            mutation: gql`
              mutation DeleteLink($id: UUID!) {
                deleteLink(id: $id) {
                  isSuccess
                }
              }
            `,
            variables: {
              id: linkId,
            },
          });

          if (!result.data?.deleteLink.isSuccess) throw result.errors;

          setLinks((links) => links.filter((link) => link.id !== linkId));

          navigate(SitePath.linksPath);
        })(),
        {
          loading: "Deleting link...",
          success: (val) => <span>Successfully removed the link</span>,
          error: (e) => <span>{getGqlErrorMsg(e)}</span>,
        }
      );
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e);
      }
    } finally {
      setIsLoadingExecute(false);
    }
  }

  return (
    <div class="w-full h-full flex flex-col">
      <div class="px-4 pt-1">
        <span class="text-2xl">Links</span>
      </div>
      <div class="relative h-full mt-4 border-t">
        <div class="absolute h-full w-full flex">
          <div
            class={`flex-none h-full w-72 overflow-y-auto border-r ${styles["custom-scrollbar"]}`}
          >
            <For each={links()}>
              {(link) => (
                <Link
                  href={`${SitePath.linksPath}/${link.id}`}
                  class="block p-2"
                  classList={{ "bg-teal-100": params.id === link.id }}
                >
                  <div class="flex">
                    <span class="text-xs text-black/70">
                      {moment
                        .utc(link.createdAt)
                        .local()
                        .format("MMM DD, YYYY")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div class="my-0.5">
                    <span class="block truncate">{link.title}</span>
                  </div>
                  <div class="flex gap-x-2 justify-between text-sm">
                    <div class="flex-1 text-teal-500 truncate">
                      <span>{`${
                        import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN
                      }/`}</span>
                      <span class="font-bold">{link.shortUrl}</span>
                    </div>
                    <div class="flex-none flex items-center gap-x-1 text-black/50">
                      <span>{link.visits}</span>
                      <span class="flex text-base pt-[2px]">
                        <VisibilityIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </For>
          </div>
          <Show when={selectedLink()?.id}>
            <div
              class={`flex-1 h-full p-4 overflow-y-auto ${styles["custom-scrollbar"]}`}
            >
              <div class="p-4 border rounded-lg">
                <div class="flex items-center justify-between gap-x-2.5">
                  <div class="min-w-0 flex-1">
                    <Show when={isEditing() !== "title"}>
                      <span class="block font-bold text-xl truncate">
                        {selectedLink()!.title}
                      </span>
                    </Show>
                    <Show when={isEditing() === "title"}>
                      <input
                        value={textEdit()}
                        oninput={(e) => setTextEdit(e.currentTarget.value)}
                        class="w-full px-2 py-0.5 outline-none border border-teal-500 rounded"
                      />
                    </Show>
                  </div>
                  <Show when={isEditing() !== "title"}>
                    <div class="flex gap-x-1">
                      <button
                        type="button"
                        onclick={() => editMode("title")}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-teal-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <EditIcon />
                        </span>
                        <span class="text-sm">Edit</span>
                      </button>
                      <button
                        type="button"
                        onclick={deleteLink}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-red-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <DeleteIcon />
                        </span>
                        <span class="text-sm">Delete</span>
                      </button>
                    </div>
                  </Show>
                  <Show when={isEditing() === "title"}>
                    <div class="flex gap-x-1">
                      <button
                        type="button"
                        onclick={saveEditedShortLink}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-teal-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <SaveIcon />
                        </span>
                        <span class="text-sm">Save</span>
                      </button>
                      <button
                        type="button"
                        onclick={() => editMode()}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-red-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <CancelIcon />
                        </span>
                        <span class="text-sm">Cancel</span>
                      </button>
                    </div>
                  </Show>
                </div>
                <div class="mt-2 flex items-center gap-x-1 text-sm">
                  <CalendarMonth />
                  <span>
                    {moment
                      .utc(selectedLink()!.createdAt)
                      .local()
                      .format("MMMM DD, YYYY hh:mm A Z")}
                  </span>
                </div>
                <div class="mt-2 flex items-center gap-x-1 text-sm">
                  <span class="flex pt-[1px]">
                    <VisibilityIcon />
                  </span>
                  <span>{selectedLink()!.visits}</span>
                  <span> clicks</span>
                </div>
              </div>
              <div class="mt-4 p-4 border rounded-lg">
                <div class="flex items-center justify-between gap-x-2.5">
                  <div class="min-w-0 flex-1">
                    <Show when={isEditing() !== "short_url"}>
                      <Link
                        href={selectedLink()!.longUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                        class="block font-bold text-xl text-teal-500 truncate"
                      >
                        {import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/
                        {selectedLink()!.shortUrl}
                      </Link>
                    </Show>
                    <Show when={isEditing() === "short_url"}>
                      <div class="px-2 py-0.5 flex items-center border border-teal-500 rounded">
                        <span>
                          {import.meta.env.VITE_SITE_SHORT_URL_RESOLVER_DOMAIN}/
                        </span>
                        <input
                          value={textEdit()}
                          oninput={(e) => setTextEdit(e.currentTarget.value)}
                          class="w-full outline-none"
                        />
                      </div>
                    </Show>
                  </div>
                  <Show when={isEditing() !== "short_url"}>
                    <div class="flex gap-x-1">
                      <button
                        type="button"
                        onclick={copyShortUrl}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-teal-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <ContentCopyIcon />
                        </span>
                        <span class="text-sm">Copy</span>
                      </button>
                      <button
                        type="button"
                        onclick={() => editMode("short_url")}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-teal-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <EditIcon />
                        </span>
                        <span class="text-sm">Edit</span>
                      </button>
                    </div>
                  </Show>
                  <Show when={isEditing() === "short_url"}>
                    <div class="flex gap-x-1">
                      <button
                        type="button"
                        onclick={saveEditedShortLink}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-teal-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <SaveIcon />
                        </span>
                        <span class="text-sm">Save</span>
                      </button>
                      <button
                        type="button"
                        onclick={() => editMode()}
                        class="px-1.5 py-1 flex items-center gap-x-0.5 hover:bg-red-100 rounded-lg"
                      >
                        <span class="flex text-2xl">
                          <CancelIcon />
                        </span>
                        <span class="text-sm">Cancel</span>
                      </button>
                    </div>
                  </Show>
                </div>
                <div class="mt-2 flex items-center gap-x-1 text-sm">
                  <span class="flex pb-0.5">
                    <SuBdirectoryArrowRightIcon />
                  </span>
                  <Link href={selectedLink()!.longUrl}>
                    {selectedLink()!.longUrl}
                  </Link>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
