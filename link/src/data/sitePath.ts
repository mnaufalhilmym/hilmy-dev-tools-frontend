export default class SitePath {
  private static _rootPath = import.meta.env.VITE_SITE_ROOT_PATH;

  static homePath = `${this._rootPath ? this._rootPath : "/"}`;
}
