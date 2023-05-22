import { Show } from "solid-js";
import Logout from "../icon/Logout";
import { Link } from "@solidjs/router";
import ManageAccounts from "../icon/ManageAccounts";
import getBgProfilePicture from "../../helpers/getBgProfilePicture";
import LoadingSkeleton from "../loading/LoadingSkeleton";
import signOut from "../../helpers/signOut";

interface Props {
  isShown: boolean;
  email?: string;
  onClickManage: () => void;
}

export default function ModalAccount(props: Props) {
  return (
    <Show when={props.isShown}>
      <div class="absolute right-0 min-w-0 max-w-full px-4">
        <div class="min-w-0 w-full max-w-sm bg-white drop-shadow-lg rounded-3xl border border-teal-200 overflow-hidden">
          <div class="p-2 bg-teal-100/40">
            <div class="p-4 bg-white rounded-2xl">
              <div class="flex items-center gap-x-3.5">
                <div
                  class="flex-none w-16 h-16 mx-auto flex items-center justify-center text-4xl text-white rounded-full overflow-hidden"
                  style={{
                    "background-color": props.email
                      ? getBgProfilePicture(props.email[0].toUpperCase())
                      : "transparent",
                  }}
                >
                  <Show
                    when={props.email}
                    fallback={<LoadingSkeleton width="100%" height="100%" />}
                  >
                    {props.email![0].toUpperCase()}
                  </Show>
                </div>
                <div class="min-w-0 flex-1">
                  <Show
                    when={props.email}
                    fallback={
                      <div class="mx-auto rounded overflow-hidden">
                        <LoadingSkeleton width="100%" height="24px" />
                      </div>
                    }
                  >
                    <span class="mx-auto block font-bold truncate">
                      {props.email}
                    </span>
                  </Show>
                </div>
              </div>
              <div class="ml-20 my-2 flex flex-wrap gap-2">
                <Link
                  href={import.meta.env.VITE_SITE_ACCOUNT_URL}
                  rel="noopener noreferrer"
                  target="_black"
                  onclick={props.onClickManage}
                  class="py-1.5 px-4 flex gap-x-2 items-center font-bold text-sm border border-black hover:bg-black/5 active:bg-black/10 rounded-lg"
                >
                  <ManageAccounts />
                  <span>Manage</span>
                </Link>
                <button
                  type="button"
                  onclick={signOut}
                  class="py-1.5 px-4 flex gap-x-2 items-center font-bold text-sm border border-black hover:bg-black/5 active:bg-black/10 rounded-lg"
                >
                  <Logout />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
