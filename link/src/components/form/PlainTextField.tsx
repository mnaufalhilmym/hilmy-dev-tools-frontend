import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
  type: string;
  required?: boolean;
}

export default function PlainTextField(props: Props) {
  return (
    <_TextField>
      <input
        name={props.name}
        placeholder={props.placeholder}
        type={props.type}
        required={props.required}
        class="w-full py-2.5 px-3 outline-none bg-transparent placeholder:text-black/30"
      />
    </_TextField>
  );
}
