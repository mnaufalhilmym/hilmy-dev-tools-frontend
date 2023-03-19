import { JSX, JSXElement } from "solid-js";

interface Props {
  type: "button" | "reset" | "submit";
  onclick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  children: JSXElement;
}

export default function DangerButton(props: Props) {
  return (
    <button
      type={props.type}
      onclick={props.onclick}
      class="px-4 py-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 hover:drop-shadow text-white rounded transition duration-200"
    >
      {props.children}
    </button>
  );
}
