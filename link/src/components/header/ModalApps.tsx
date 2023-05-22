import { Link } from "@solidjs/router";
import { For, Show } from "solid-js";
import Apprepo from "../../types/apprepo.type";
import styles from "./ModalApps.module.css";

interface Props {
  isShown: boolean;
  apprepos?: Apprepo[];
  onClickApp: () => void;
}

export default function ModalApps(props: Props) {
  return (
    <Show when={props.isShown}>
      <div class="absolute right-0 sm:right-16 px-2 sm:px-0">
        <div class="w-full max-w-xs bg-white drop-shadow-lg rounded-lg border overflow-hidden">
          <div
            class={`max-h-96 py-2 px-3 overflow-y-auto ${styles["custom-scrollbar"]}`}
          >
            <div class="grid grid-cols-3">
              <For each={props.apprepos}>
                {(app) => (
                  <div class="w-24 p-2 aspect-square">
                    <Link
                      href={app.link}
                      rel="noopener noreferrer"
                      target="_blank"
                      onclick={props.onClickApp}
                      class="w-full h-full p-2 flex flex-col hover:bg-teal-100/50 active:bg-teal-100/80 rounded-lg"
                    >
                      <div class="min-h-0 min-w-0 flex-1 w-fit mx-auto flex items-center justify-center">
                        <img src={app.icon} alt={app.name} />
                      </div>
                      <span class="flex-none block text-center truncate">
                        {app.name}
                      </span>
                    </Link>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
