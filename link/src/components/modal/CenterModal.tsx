import {
  Accessor,
  createRenderEffect,
  createSignal,
  JSXElement,
  Setter,
} from "solid-js";

export class CenterModal {
  private static _getIsShow: Accessor<boolean>;
  private static _setIsShow: Setter<boolean>;
  private static _getContent: Accessor<JSXElement>;
  private static _setContent: Setter<JSXElement>;

  static init() {
    [this._getIsShow, this._setIsShow] = createSignal(false);
    [this._getContent, this._setContent] = createSignal();
  }

  static get isShow(): any {
    return this._getIsShow;
  }

  static set isShow(state: boolean) {
    this._setIsShow(state);
  }

  static get content(): any {
    return this._getContent;
  }

  static set content(content: JSXElement | undefined) {
    this._setContent(content);
  }
}

export function CenterModalWrapper() {
  createRenderEffect(() => {
    CenterModal.init();
  });

  function closeModal() {
    CenterModal.isShow = false;
  }

  function stopPropagation(
    e: MouseEvent & {
      currentTarget: HTMLDivElement;
      target: Element;
    }
  ) {
    e.stopPropagation();
  }

  function onTransitionEnd() {
    if (!CenterModal.isShow()) {
      CenterModal.content = undefined;
    }
  }

  return (
    <div
      onclick={closeModal}
      class="fixed w-screen h-screen top-0 right-0 bottom-0 left-0 p-10 flex items-center bg-black/30 opacity-0 transition-all duration-200"
      classList={{
        invisible: !CenterModal.isShow(),
        "opacity-100": CenterModal.isShow(),
      }}
      ontransitionend={onTransitionEnd}
    >
      <div
        onclick={stopPropagation}
        class="mx-auto p-8 bg-white border rounded-xl drop-shadow-lg"
      >
        {CenterModal.content()}
      </div>
    </div>
  );
}
