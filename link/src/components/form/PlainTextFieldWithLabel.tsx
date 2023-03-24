import { JSXElement } from "solid-js";
import PlainTextField from "./PlainTextField";

interface Props {
  label: JSXElement;
  name: string;
  placeholder: string;
  type: string;
  required?: boolean;
}

export default function PlainTextFieldWithLabel(props: Props) {
  return (
    <div>
      {props.label}
      <div class="mt-2">
        <PlainTextField
          name={props.name}
          placeholder={props.placeholder}
          type={props.type}
          required={props.required}
        />
      </div>
    </div>
  );
}
