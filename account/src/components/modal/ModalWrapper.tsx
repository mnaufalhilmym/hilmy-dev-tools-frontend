import {
  Accessor,
  createRenderEffect,
  createSignal,
  JSXElement,
  Setter,
} from "solid-js";

export class Modal {
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

export function ModalWrapper() {
  createRenderEffect(() => {
    Modal.init();
  });

  function closeModal() {
    Modal.isShow = false;
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
    if (!Modal.isShow()) {
      Modal.content = undefined;
    }
  }

  return (
    <div
      onclick={closeModal}
      class="fixed w-screen h-screen top-0 right-0 bottom-0 left-0 p-10 flex items-center bg-black/10 opacity-0 transition-all duration-200"
      classList={{
        invisible: !Modal.isShow(),
        "opacity-100": Modal.isShow(),
      }}
      ontransitionend={onTransitionEnd}
    >
      <div
        onclick={stopPropagation}
        class="mx-auto p-8 bg-white border rounded-xl"
      >
        {Modal.content()}
      </div>
    </div>
  );
}
