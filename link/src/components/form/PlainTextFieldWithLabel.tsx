import { JSXElement } from "solid-js";
import PlainTextField from "./PlainTextField";

interface Props {
  label: JSXElement;
  name: string;
  title?: string;
  placeholder: string;
  type: string;
  required?: boolean;
  pattern?: string;
}

export default function PlainTextFieldWithLabel(props: Props) {
  return (
    <div>
      {props.label}
      <div class="mt-2">
        <PlainTextField
          name={props.name}
          title={props.title}
          placeholder={props.placeholder}
          type={props.type}
          required={props.required}
          pattern={props.pattern}
        />
      </div>
    </div>
  );
}
