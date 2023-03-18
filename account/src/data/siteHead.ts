import { Accessor, createSignal, Setter } from "solid-js";

export default class SiteHead {
  private static __defaultTitle = "Account";

  static getTitle: Accessor<string>;
  private static _setTitle: Setter<string>;

  static init() {
    [this.getTitle, this._setTitle] = createSignal(this.__defaultTitle);
  }

  static setTitle(title?: string) {
    if (title) {
      this._setTitle(`${title} - ${this.__defaultTitle}`);
    } else {
      this._setTitle(this.__defaultTitle);
    }
  }
}
