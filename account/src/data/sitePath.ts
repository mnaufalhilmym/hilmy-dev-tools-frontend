export default class SitePath {
  private static _rootPath = import.meta.env.VITE_SITE_ROOT_PATH;

  static homePath = `${this._rootPath ? this._rootPath : "/"}`;
  static signInPath = `${this._rootPath}/signin`;
  static requestResetPasswordPath = `${this.signInPath}/reset-password`;
  static verifyRequestResetPasswordPath = `${this.requestResetPasswordPath}/verify`;
  static resetPasswordPath = `${this.requestResetPasswordPath}/new`;
  static signUpPath = `${this._rootPath}/signup`;
  static verifySignUpPath = `${this.signUpPath}/verify`;
  static emailPath = `${this._rootPath}/email`;
  static verifyEmailPath = `${this.emailPath}/verify`;
  static passwordPath = `${this._rootPath}/password`;
}
