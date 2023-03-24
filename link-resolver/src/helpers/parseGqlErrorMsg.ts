export default function parseGqlErrorMsg(e: string) {
  switch (e) {
    case "Record not found":
      return "The short link has not been registered";
    default:
      return e;
  }
}
