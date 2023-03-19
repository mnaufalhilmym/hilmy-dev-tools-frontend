import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
  required?: boolean;
}

export default function PlainTextField(props: Props) {
  return (
    <_TextField>
      <input
        name={props.name}
        placeholder={props.placeholder}
        type="text"
        required={props.required}
        class="w-full p-3.5 outline-none bg-transparent"
      />
    </_TextField>
  );
}
