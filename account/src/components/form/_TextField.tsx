import { JSXElement } from "solid-js";

interface Props {
  children: JSXElement;
}

export default function _TextField(props: Props) {
  return (
    <div class="flex border-2 focus-within:border-teal-500 rounded transition-colors duration-200">
      {props.children}
    </div>
  );
}
