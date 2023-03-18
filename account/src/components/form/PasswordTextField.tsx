import { createSignal, Match, Show, Switch } from "solid-js";
import VisibilityIcon from "../icon/VisibilityIcon";
import VisibilityOffIcon from "../icon/VisibilityOffIcon";
import _TextField from "./_TextField";

interface Props {
  name: string;
  placeholder: string;
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
        class="w-full outline-none"
      />
      <button type="button" onclick={togglePasswordVisibility}>
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
