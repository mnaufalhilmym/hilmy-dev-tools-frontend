import SitePath from "@/app/data/sitePath";
import Apprepo from "@/app/types/apprepo.type";
import Link from "next/link";
import { useState } from "react";
import AppsIcon from "../icon/AppsIcon";
import getBgProfilePicture from "@/app/helper/getBgProfilePicture";
import LoadingSkeleton from "../loading/LoadingSkeleton";
import ModalApps from "./ModalApps";
import ModalAccount from "./ModalAccount";

interface Props {
  apprepos?: Apprepo[];
  email?: string;
}

export default function Header(props: Props) {
  const [headerModalShown, setHeaderModalShown] = useState<
    "account" | "apps"
  >();

  function toggleModalAccount() {
    if (headerModalShown === "account") {
      setHeaderModalShown(undefined);
    } else {
      setHeaderModalShown("account");
    }
  }
  function toggleModalApps() {
    if (headerModalShown === "apps") {
      setHeaderModalShown(undefined);
    } else {
      setHeaderModalShown("apps");
    }
  }

  return (
    <div className="fixed z-50 top-0 w-full">
      <div className="py-3 px-3.5 flex justify-between items-center">
        <Link href={SitePath.homePath}>
          <h1 className="px-1.5 font-bold text-xl">
            {process.env.NEXT_PUBLIC_SITE_NAME}
          </h1>
        </Link>
        <div className="flex gap-x-2 items-center">
          <button
            type="button"
            onClick={toggleModalApps}
            className={`flex p-2 hover:bg-black/5 active:bg-black/10 rounded-full transition duration-200 ${
              headerModalShown === "apps" ? "!bg-black/10" : ""
            }`}
          >
            <AppsIcon />
          </button>
          <button
            type="button"
            onClick={toggleModalAccount}
            className={`p-1 hover:bg-black/5 active:bg-black/10 rounded-full transition duration-200 ${
              headerModalShown === "account" ? "!bg-black/10" : ""
            }`}
          >
            <div
              className="w-8 h-8 mx-auto flex items-center justify-center text-white rounded-full overflow-hidden"
              style={{
                backgroundColor: props.email
                  ? getBgProfilePicture(props.email[0].toUpperCase())
                  : "transparent",
              }}
            >
              {props.email ? (
                props.email![0].toUpperCase()
              ) : (
                <LoadingSkeleton width="100%" height="100%" />
              )}
            </div>
          </button>
        </div>
      </div>

      <ModalApps
        isShown={headerModalShown === "apps"}
        apprepos={props.apprepos}
        onClickApp={toggleModalApps}
      />
      <ModalAccount
        isShown={headerModalShown === "account"}
        email={props.email}
        onClickManage={toggleModalAccount}
      />
    </div>
  );
}
