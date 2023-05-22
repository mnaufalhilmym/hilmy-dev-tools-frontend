import { Link } from "@solidjs/router";
import AppsIcon from "../icon/AppsIcon";
import ModalApps from "./ModalApps";
import ModalAccount from "./ModalAccount";
import { Show, createSignal } from "solid-js";
import Apprepo from "../../types/apprepo.type";
import getBgProfilePicture from "../../helpers/getBgProfilePicture";
import LoadingSkeleton from "../loading/LoadingSkeleton";
import SitePath from "../../data/sitePath";

interface Props {
  apprepos?: Apprepo[];
  email?: string;
}

export default function Header(props: Props) {
  const [headerModalShown, setHeaderModalShown] = createSignal<
    "account" | "apps"
  >();

  function toggleModalAccount() {
    if (headerModalShown() === "account") {
      setHeaderModalShown();
    } else {
      setHeaderModalShown("account");
    }
  }

  function toggleModalApps() {
    if (headerModalShown() === "apps") {
      setHeaderModalShown();
    } else {
      setHeaderModalShown("apps");
    }
  }

  return (
    <div class="fixed z-50 top-0 w-full">
      <div class="py-3 px-3.5 flex justify-between items-center">
        <Link href={SitePath.homePath}>
          <h1 class="px-1.5 font-bold text-xl">
            {import.meta.env.VITE_SITE_NAME}
          </h1>
        </Link>
        <div class="flex gap-x-2 items-center">
          <button
            type="button"
            onclick={toggleModalApps}
            class="flex p-2 hover:bg-black/5 active:bg-black/10 rounded-full transition duration-200"
            classList={{
              "!bg-black/10": headerModalShown() === "apps",
            }}
          >
            <AppsIcon />
          </button>
          <button
            type="button"
            onclick={toggleModalAccount}
            class="p-1 hover:bg-black/5 active:bg-black/10 rounded-full transition duration-200"
            classList={{
              "!bg-black/10": headerModalShown() === "account",
            }}
          >
            <div
              class="w-8 h-8 mx-auto flex items-center justify-center text-white rounded-full overflow-hidden"
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
          </button>
        </div>
      </div>

      <ModalApps
        isShown={headerModalShown() === "apps"}
        apprepos={props.apprepos}
        onClickApp={toggleModalApps}
      />
      <ModalAccount
        isShown={headerModalShown() === "account"}
        email={props.email}
        onClickManage={toggleModalAccount}
      />
    </div>
  );
}
