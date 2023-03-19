import { JSX, JSXElement } from "solid-js";

interface Props {
  type: "button" | "reset" | "submit";
  onclick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  children: JSXElement;
}

export default function ConfirmButton(props: Props) {
  return (
    <button
      type={props.type}
      onclick={props.onclick}
      class="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 hover:drop-shadow text-white rounded transition duration-200"
    >
      {props.children}
    </button>
  );
}
