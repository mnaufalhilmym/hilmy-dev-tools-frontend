import Link from "next/link";
import Apprepo from "../../types/apprepo.type";
import styles from "./ModalApps.module.css";

interface Props {
  isShown: boolean;
  apprepos?: Apprepo[];
  onClickApp: () => void;
}

export default function ModalApps(props: Props) {
  return props.isShown ? (
    <div className="absolute right-0 sm:right-16 px-2 sm:px-0">
      <div className="w-full max-w-xs bg-white drop-shadow-lg rounded-lg border overflow-hidden">
        <div
          className={`max-h-96 py-2 px-3 overflow-y-auto ${styles["custom-scrollbar"]}`}
        >
          <div className="grid grid-cols-3">
            {props.apprepos &&
              props.apprepos.map((app, idx) => (
                <div key={idx} className="w-24 p-2 aspect-square">
                  <Link
                    href={app.link}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={props.onClickApp}
                    className="group w-full h-full p-2 flex flex-col hover:bg-teal-100/50 active:bg-teal-100/80 rounded-lg"
                  >
                    <div className="min-h-0 min-w-0 flex-1 w-fit mx-auto flex items-center justify-center">
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-full h-full"
                      />
                    </div>
                    <span className="block text-center truncate group-hover:whitespace-normal text-sm leading-3 break-all">
                      {app.name}
                    </span>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
