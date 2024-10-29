import LoadingSkeleton from "../loading/LoadingSkeleton";
import Link from "next/link";
import Logout from "../icon/Logout";
import ManageAccounts from "../icon/ManageAccounts";
import getBgProfilePicture from "@/app/helper/getBgProfilePicture";
import signOut from "@/app/helper/signOut";

interface Props {
  isShown: boolean;
  email?: string;
  onClickManage: () => void;
}

export default function ModalAccount(props: Props) {
  return props.isShown ? (
    <div className="absolute right-0 min-w-0 max-w-full px-4">
      <div className="min-w-0 w-full max-w-sm bg-white drop-shadow-lg rounded-3xl border border-teal-200 overflow-hidden">
        <div className="p-2 bg-teal-100/40">
          <div className="p-4 bg-white rounded-2xl">
            <div className="flex items-center gap-x-3.5">
              <div
                className="flex-none w-16 h-16 mx-auto flex items-center justify-center text-4xl text-white rounded-full overflow-hidden"
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
              <div className="min-w-0 flex-1">
                {props.email ? (
                  <span className="mx-auto block font-bold truncate">
                    {props.email}
                  </span>
                ) : (
                  <div className="mx-auto rounded overflow-hidden">
                    <LoadingSkeleton width="100%" height="24px" />
                  </div>
                )}
              </div>
            </div>
            <div className="ml-20 my-2 flex flex-wrap gap-2">
              <Link
                href={process.env.NEXT_PUBLIC_SITE_ACCOUNT_URL ?? "/"}
                rel="noopener noreferrer"
                target="_black"
                onClick={props.onClickManage}
                className="py-1.5 px-4 flex gap-x-2 items-center font-bold text-sm border border-black hover:bg-black/5 active:bg-black/10 rounded-lg"
              >
                <ManageAccounts />
                <span>Manage</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="py-1.5 px-4 flex gap-x-2 items-center font-bold text-sm border border-black hover:bg-black/5 active:bg-black/10 rounded-lg"
              >
                <Logout />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
