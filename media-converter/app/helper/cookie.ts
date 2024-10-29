export function readCookie(key: string) {
  return document.cookie
    .split(";")
    .find((row) => row.startsWith(key))
    ?.split("=")?.[1];
}

export function saveCookie(cookie: {
  key: string;
  value?: string;
  expires?: string;
}) {
  document.cookie = `${cookie.key}=${cookie.value};expires=${cookie.expires};${process.env.NODE_ENV === "development" ? "" : `domain=${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}`
    };path=/;Secure`;
}

export function deleteCookie(key: string) {
  saveCookie({ key, expires: "Thu, 01 Jan 1970 00:00:00 GMT" });
}
