export default function getLastScreenPath(fullPath: string) {
  return "/" + fullPath.split("/").at(-1);
}
