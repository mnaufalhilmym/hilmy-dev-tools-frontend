import { gql } from "@apollo/client/core";
import { Link, useNavigate } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../../api/gqlClient";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmailTextField from "../../components/form/EmailTextField";
import PasswordTextField from "../../components/form/PasswordTextField";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";

export default function SignUpScreen() {
  const gqlClient = GqlClient.get();
  const navigate = useNavigate();
  const [isLoadingSignUp, setIsLoadingSignUp] = createSignal(false);

  createRenderEffect(() => {
    SiteHead.setTitle("Sign Up");
  });

  async function signUp(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingSignUp()) return;

    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };

    try {
      setIsLoadingSignUp(true);

      const result = await gqlClient.mutate<{ signUp: { isSuccess: boolean } }>(
        {
          mutation: gql`
            mutation SignUp($email: String!, $password: String!) {
              signUp(email: $email, password: $password) {
                isSuccess
              }
            }
          `,
          variables: {
            email: target.email.value,
            password: target.password.value,
          },
        }
      );

      if (!result.data?.signUp.isSuccess) throw result.errors;

      navigate(`${SitePath.verifySignUpPath}?email=${target.email.value}`);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e);
      }
      toast.error(e?.toString());
    } finally {
      setIsLoadingSignUp(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="mx-auto p-10 border-2 rounded-lg">
        <form onsubmit={signUp} class="min-w-[24rem]">
          <div>
            <h1 class="text-2xl text-center">Sign Up</h1>
          </div>
          <div class="mt-8">
            <div>
              <div>
                <EmailTextField name="email" placeholder="Email" />
              </div>
              <div class="mt-2">
                <PasswordTextField name="password" placeholder="Password" />
              </div>
            </div>
          </div>
          <div class="mt-10 -ml-1.5 flex items-center justify-between">
            <Link
              href={SitePath.signInPath}
              class="px-1.5 py-1.5 text-teal-500 hover:text-teal-600 hover:bg-teal-50 active:bg-teal-100 rounded transition-colors duration-200"
            >
              Sign in instead
            </Link>
            <button
              type="submit"
              class="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 hover:drop-shadow text-white rounded transition duration-200"
            >
              <Show when={!isLoadingSignUp()} fallback={<LoadingSpinner />}>
                Sign up
              </Show>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
