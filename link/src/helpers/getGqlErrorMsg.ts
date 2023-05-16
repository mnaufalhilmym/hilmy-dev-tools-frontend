import { ApolloError } from "@apollo/client";

export default function getGqlErrorMsg(e: ApolloError) {
  return (
    e?.message
      .split(",")[1]
      ?.split('"')
      .slice(1, -1)
      .join(" ")
      .replaceAll("\\", "") ??
    e?.message ??
    e
  );
}
