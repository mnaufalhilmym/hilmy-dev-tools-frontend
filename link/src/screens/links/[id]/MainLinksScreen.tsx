import { gql } from "@apollo/client/core";
import { createWindowSize } from "@solid-primitives/resize-observer";
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
import LinkIcon from "../../../components/icon/LinkIcon";
import SaveIcon from "../../../components/icon/SaveIcon";
import SuBdirectoryArrowRightIcon from "../../../components/icon/SubdirectoryArrowRightIcon";
import VisibilityIcon from "../../../components/icon/VisibilityIcon";
import LoadingSkeleton from "../../../components/loading/LoadingSkeleton";
import { CenterModal } from "../../../components/modal/CenterModal";
import SiteHead from "../../../data/siteHead";
import SitePath from "../../../data/sitePath";
import getGqlErrorMsg from "../../../helpers/getGqlErrorMsg";
import showGqlError from "../../../helpers/showGqlError";
import LinkT from "../../../types/link.type";
import styles from "./MainLinkScreen.module.css";

export default function MainLinksScreen() {
  const size = createWindowSize();
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [links, setLinks] = createSignal<LinkT[]>([]);
  const [selectedLink, setSelectedLink] = createSignal<LinkT>();
  const [isEditing, setIsEditing] = createSignal<"title" | "short_url">();
  const [textEdit, setTextEdit] = createSignal<string>();
  const [isLoadingGetLinks, setIsLoadingGetLinks] = createSignal(false);
  const [isLoadingExecute, setIsLoadingExecute] = createSignal(false);

  const CenterModalLayer1 = new CenterModal({
    cancelCallback: () => {
      navigate(SitePath.linksPath);
      setIsEditing();
    },
  });
  const CenterModalLayer2 = new CenterModal();

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
    SiteHead.title = "Manage link";

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

  function showModalDetailLink() {
    CenterModalLayer1.content = ModalDetailLink();
    CenterModalLayer1.isShow = true;
  }

  createRenderEffect(() => {
    if (selectedLink()?.id && size.width < 640) {
      showModalDetailLink();
    } else if (size.width >= 640) {
      CenterModalLayer1.isShow = false;
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

  function showModalDeleteLink() {
    CenterModalLayer2.content = ModalDeleteLink();
    CenterModalLayer2.isShow = true;
  }

  return (
    <>
      <div class="w-full h-full flex flex-col">
        <div class="px-4 pt-1">
          <span class="text-2xl">Links</span>
        </div>
        <div class="relative h-full mt-4 border-t">
          <div class="absolute h-full w-full flex">
            <div
              class={`flex-1 h-full sm:max-w-[18rem] overflow-y-auto border-r ${styles["custom-scrollbar"]}`}
            >
              <SidebarLink />
            </div>

            <div class="hidden sm:block min-w-0 flex-[2]">
              <div
                class={`h-full sm:p-4 overflow-y-auto ${styles["custom-scrollbar"]}`}
              >
                <DetailLink />
              </div>
            </div>
          </div>
        </div>
      </div>

      {CenterModalLayer1.render()}
      {CenterModalLayer2.render()}
    </>
  );

  function SidebarLink() {
    return (
      <For each={links()} fallback={<LinksFallback />}>
        {(link) => (
          <Link
            href={`${SitePath.linksPath}/${link.id}`}
            class="block p-2"
            classList={{ "sm:bg-teal-100": params.id === link.id }}
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
    );
  }

  function DetailLink() {
    return (
      <Show when={selectedLink()?.id} fallback={<DetailLinkFallback />}>
        <div class="p-4 border rounded-lg">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
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
                  class="w-full px-2 py-[1px] outline-none border border-teal-500 rounded"
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
                  onclick={showModalDeleteLink}
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
          <div class="mt-4 sm:mt-2 flex items-center gap-x-1 text-sm">
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
            <span> click{selectedLink()!.visits !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div class="mt-4 p-4 border rounded-lg">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
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
                <div class="px-2 py-[1px] flex items-center border border-teal-500 rounded">
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
          <div class="mt-4 sm:mt-2 flex items-center gap-x-1 text-sm">
            <span class="hidden sm:block flex pt-[1px]">
              <SuBdirectoryArrowRightIcon />
            </span>
            <Link href={selectedLink()!.longUrl} class="truncate">
              {selectedLink()!.longUrl}
            </Link>
          </div>
        </div>
      </Show>
    );
  }

  function LinksFallback() {
    return (
      <>
        <Show when={isLoadingGetLinks()}>
          <For each={[1, 2, 3]}>
            {(i) => (
              <div class="block p-2">
                <div class="flex">
                  <LoadingSkeleton height="1rem" width="5rem" />
                </div>
                <div class="my-0.5">
                  <LoadingSkeleton height="1.5rem" width="100%" />
                </div>
                <div class="flex gap-x-2 justify-between text-sm">
                  <div class="flex-1">
                    <LoadingSkeleton height="1.25rem" width="70%" />
                  </div>
                  <div class="flex-none flex items-center gap-x-1 text-black/50">
                    <LoadingSkeleton height="1.25rem" width="2rem" />
                  </div>
                </div>
              </div>
            )}
          </For>
        </Show>

        <Show when={!isLoadingGetLinks()}>
          <div class="h-full p-6 flex items-center">
            <div class="mx-auto">
              <div class="w-fit mx-auto text-6xl">
                <LinkIcon />
              </div>
              <div>
                <span class="block font-bold text-center">
                  Create your first link
                </span>
              </div>
              <div class="mt-3">
                <span class="block text-center">
                  Click the{" "}
                  <Link href={SitePath.homePath} class="text-teal-500">
                    + Create
                  </Link>{" "}
                  button in the sidebar to get started.
                </span>
              </div>
            </div>
          </div>
        </Show>
      </>
    );
  }

  function DetailLinkFallback() {
    return (
      <Show when={links().length > 0}>
        <div class="w-full h-full flex items-center">
          <div class="mx-auto">
            <div class="w-fit mx-auto text-6xl">
              <LinkIcon />
            </div>
            <div>
              <span class="block font-bold text-center">No selected link</span>
            </div>
            <div class="mt-3">
              <span class="block text-center">
                Select a link to show the detail
              </span>
            </div>
          </div>
        </div>
      </Show>
    );
  }

  function ModalDetailLink() {
    return <DetailLink />;
  }

  function ModalDeleteLink() {
    function cancel() {
      CenterModalLayer2.isShow = false;
    }

    async function delLink() {
      CenterModalLayer2.isShow = false;
      await deleteLink();
    }

    return (
      <div>
        <div>
          <span>
            Are you sure you want to delete {/* @once */ selectedLink()?.title}?
          </span>
        </div>
        <div class="mt-4 flex justify-between">
          <button
            type="button"
            onclick={cancel}
            class="px-4 py-1.5 hover:bg-black/5 active:bg-black/10 hover:drop-shadow rounded transition duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={delLink}
            class="px-4 py-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 hover:drop-shadow text-white rounded transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
}
