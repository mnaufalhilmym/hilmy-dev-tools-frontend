import { Accessor, createSignal, Setter } from "solid-js";

export default class SiteHead {
  private static __defaultTitle = import.meta.env.VITE_SITE_NAME;

  private static _getTitle: Accessor<string>;
  private static _setTitle: Setter<string>;

  static init() {
    [this._getTitle, this._setTitle] = createSignal(this.__defaultTitle);
  }

  static get title(): any {
    return this._getTitle;
  }

  static set title(title: string | undefined) {
    if (title) {
      this._setTitle(`${title} | ${this.__defaultTitle}`);
    } else {
      this._setTitle(this.__defaultTitle);
    }
  }
}
