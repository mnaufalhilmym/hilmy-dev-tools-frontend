import { JSX, JSXElement } from "solid-js";

interface Props {
  type: "button" | "reset" | "submit";
  onclick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  children: JSXElement;
}

export default function PlainButton(props: Props) {
  return (
    <button
      type={props.type}
      onclick={props.onclick}
      class="px-4 py-1.5 hover:bg-black/5 active:bg-black/10 hover:drop-shadow rounded transition duration-200"
    >
      {props.children}
    </button>
  );
}
