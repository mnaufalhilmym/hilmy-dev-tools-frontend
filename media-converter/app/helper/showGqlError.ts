import { ApolloError } from "@apollo/client/core";
import toast from "react-hot-toast";
import getGqlErrorMsg from "./getGqlErrorMsg";

export default function showGqlError(e: unknown) {
  if (process.env.NODE_ENV === "development") {
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
