"use client";

import App from "./App";
import Header from "./components/header/Header";
import { useEffect, useState } from "react";
import Account from "./types/account.type";
import Apprepo from "./types/apprepo.type";
import showGqlError from "./helper/showGqlError";
import GqlClient from "./api/gqlClient";
import { gql } from "@apollo/client";
import { readCookie, saveCookie } from "./helper/cookie";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function AppWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [gqlLoaded, setGqlLoaded] = useState(false);
  const [accountAndApps, setAccountAndApps] = useState<{
    account: Account;
    apprepos: Apprepo[];
  }>();
  const [isLoaded, setIsLoaded] = useState(false);

  async function getAccountAndApps() {
    try {
      const result = await GqlClient.client.query<{
        account: Account;
        apprepos: Apprepo[];
      }>({
        query: gql`
          query AccountAndApprepos {
            account {
              email
            }
            apprepos {
              name
              icon
              link
            }
          }
        `,
        fetchPolicy: "cache-first",
      });

      if (!result.data.account.email || !result.data.apprepos)
        throw result.errors;

      setAccountAndApps(result.data);
    } catch (e) {
      showGqlError(e);
    }
  }

  useEffect(() => {
    GqlClient.init();
    setGqlLoaded(true);
  }, []);

  useEffect(() => {
    if (!gqlLoaded) return;

    let token = searchParams.get("token") ?? undefined;
    if (token) {
      router.replace(pathname);
      saveCookie({ key: "token", value: token });
      GqlClient.update();
      return;
    } else {
      token = readCookie("token");
    }

    if (!token) {
      if (process.env.NEXT_PUBLIC_SITE_ACCOUNT_URL) {
        window.location.replace(
          `${process.env.NEXT_PUBLIC_SITE_ACCOUNT_URL}?redirect=${window.location.href}`
        );
      } else {
        throw new Error("NEXT_PUBLIC_SITE_ACCOUNT_URL not found.");
      }
    } else {
      setIsLoaded(true);
    }
  }, [gqlLoaded, pathname, router, searchParams]);

  useEffect(() => {
    if (isLoaded) {
      getAccountAndApps();
    }
  }, [isLoaded]);

  return (
    <>
      <Header
        apprepos={accountAndApps?.apprepos}
        email={accountAndApps?.account.email}
      />
      <App />
    </>
  );
}
