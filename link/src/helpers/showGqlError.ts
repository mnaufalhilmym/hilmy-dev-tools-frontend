import { ApolloError } from "@apollo/client/core";
import toast from "solid-toast";

export default function showGqlError(e: any) {
  if (import.meta.env.DEV) {
    console.error(e);
  }
  let error: string;
  if (e instanceof ApolloError) {
    error = e.message
      .split(",")[1]
      .split('"')
      .slice(1, -1)
      .join(" ")
      .replaceAll("\\", "");
  } else {
    error = e as string;
  }
  toast.error(error);
}
