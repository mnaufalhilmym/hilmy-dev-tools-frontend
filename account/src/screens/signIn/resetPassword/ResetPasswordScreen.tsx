import { createRenderEffect } from "solid-js";
import SiteHead from "../../../data/siteHead";

export default function ResetPasswordScreen() {
  createRenderEffect(() => {
    SiteHead.setTitle("Reset Password");
  });

  return <div>Reset Password Screen</div>;
}
