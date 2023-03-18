import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
}

export default function EmailTextField(props: Props) {
  return (
    <_TextField>
      <input
        name={props.name}
        placeholder={props.placeholder}
        type="email"
        class="w-full outline-none"
      />
    </_TextField>
  );
}
