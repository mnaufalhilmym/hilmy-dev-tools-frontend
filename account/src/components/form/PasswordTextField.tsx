import { createSignal, Show } from "solid-js";
import VisibilityIcon from "../icon/VisibilityIcon";
import VisibilityOffIcon from "../icon/VisibilityOffIcon";
import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
  required?: boolean;
}

export default function PasswordTextField(props: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prev) => !prev);
  }

  return (
    <_TextField>
      <input
        name={props.name}
        placeholder={props.placeholder}
        type={isPasswordVisible() ? "text" : "password"}
        minlength="8"
        required={props.required}
        class="w-full pl-3.5 py-3.5 outline-none bg-transparent"
      />
      <button type="button" onclick={togglePasswordVisibility} class="mx-3.5">
        <Show
          when={isPasswordVisible()}
          fallback={
            <div title="Show password" class="flex">
              <VisibilityIcon />
            </div>
          }
        >
          <div title="Hide password" class="flex">
            <VisibilityOffIcon />
          </div>
        </Show>
      </button>
    </_TextField>
  );
}
