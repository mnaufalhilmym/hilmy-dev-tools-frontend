import { JSXElement } from "solid-js";
import _TextField from "./_TextField";

interface Props {
  label: JSXElement;
  prefix: JSXElement;
  name: string;
  placeholder: string;
  type: string;
  required?: boolean;
  oninput?: (
    event: InputEvent & {
      currentTarget: HTMLInputElement;
      target: Element;
    }
  ) => void;
}

export default function PlainTextFieldWithLabelAndPrefix(props: Props) {
  return (
    <div>
      {props.label}
      <div class="mt-2 pl-3 flex items-center border-2 focus-within:border-teal-500 rounded transition-colors duration-200">
        {props.prefix}
        <input
          name={props.name}
          placeholder={props.placeholder}
          type={props.type}
          required={props.required}
          oninput={props.oninput}
          class="w-full py-2.5 pr-3 outline-none bg-transparent placeholder:text-black/30"
        />
      </div>
    </div>
  );
}
