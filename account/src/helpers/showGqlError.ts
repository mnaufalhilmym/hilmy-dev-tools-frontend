import { ApolloError } from "@apollo/client/core";
import toast from "solid-toast";
import getGqlErrorMsg from "./getGqlErrorMsg";

export default function showGqlError(e: any) {
  if (import.meta.env.DEV) {
    console.error(e);
  }
  let error: string;
  if (e instanceof ApolloError) {
    error = getGqlErrorMsg(e);
  } else {
    error = e as string;
  }
  toast.error(error);
}
