import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
  required?: boolean;
}

export default function EmailTextField(props: Props) {
  return (
    <_TextField>
      <input
        name={props.name}
        placeholder={props.placeholder}
        type="email"
        required={props.required}
        class="w-full p-3.5 outline-none bg-transparent"
      />
    </_TextField>
  );
}
