export default class SitePath {
  private static _rootPath = process.env.NEXT_PUBLIC_SITE_ROOT_PATH;

  static homePath = `${this._rootPath ? this._rootPath : "/"}`;
}
