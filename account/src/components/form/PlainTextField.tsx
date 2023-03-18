import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
}

export default function PlainTextField(props: Props) {
  return (
    <_TextField>
      <input
        name={props.name}
        placeholder={props.placeholder}
        type="text"
        class="w-full outline-none"
      />
    </_TextField>
  );
}
