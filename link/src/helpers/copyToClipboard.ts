export default async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}
