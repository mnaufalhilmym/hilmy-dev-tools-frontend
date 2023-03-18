export default class SitePath {
  private static _rootPath = import.meta.env.VITE_SITE_ROOT_PATH;

  static homePath = `${this._rootPath}/`;
  static signInPath = `${this._rootPath}/signin`;
  static resetPasswordPath = `${this.signInPath}/reset-password`;
  static signUpPath = `${this._rootPath}/signup`;
  static verifySignUpPath = `${this.signUpPath}/verify`;
}
