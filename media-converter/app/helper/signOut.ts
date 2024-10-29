import GqlClient from "../api/gqlClient";
import { deleteCookie } from "./cookie";

export default function signOut() {
  deleteCookie("token");
  GqlClient.update();
  window.location.reload();
}
