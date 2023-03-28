import { Accessor, createSignal, JSXElement, Setter } from "solid-js";
import styles from "./CenterModal.module.css";

interface Config {
  cancelCallback?: () => void;
}

export class CenterModal {
  private _getIsShow: Accessor<boolean>;
  private _setIsShow: Setter<boolean>;
  private _getContent: Accessor<JSXElement>;
  private _setContent: Setter<JSXElement>;
  private _config: Config | undefined;

  constructor(config?: Config) {
    this._config = config;
    [this._getIsShow, this._setIsShow] = createSignal(false);
    [this._getContent, this._setContent] = createSignal();
  }

  get isShow(): any {
    return this._getIsShow;
  }

  set isShow(state: boolean) {
    this._setIsShow(state);
  }

  get content(): any {
    return this._getContent;
  }

  set content(content: JSXElement | undefined) {
    this._setContent(content);
  }

  render() {
    const closeModal = () => {
      this.isShow = false;
      this._config?.cancelCallback?.();
    };

    function stopPropagation(
      e: MouseEvent & {
        currentTarget: HTMLDivElement;
        target: Element;
      }
    ) {
      e.stopPropagation();
    }

    const onTransitionEnd = () => {
      if (!this.isShow()) {
        this.content = undefined;
      }
    };

    return (
      <div
        onclick={closeModal}
        class="fixed z-50 w-screen h-screen top-0 right-0 bottom-0 left-0 p-4 sm:p-10 flex items-center bg-black/30 opacity-0 transition-all duration-200"
        classList={{
          invisible: !this.isShow(),
          "opacity-100": this.isShow(),
        }}
        ontransitionend={onTransitionEnd}
      >
        <div
          onclick={stopPropagation}
          class="max-w-full max-h-full mx-auto bg-white border rounded-xl drop-shadow-lg overflow-hidden"
        >
          <div class={`p-6 sm:p-8 overflow-auto ${styles["custom-scrollbar"]}`}>
            {this._getContent()}
          </div>
        </div>
      </div>
    );
  }
}
