import { gql } from "@apollo/client/core";
import { Link, useNavigate } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../../api/gqlClient";
import LoadingSpinner from "../../components/loading/LoadingSpinner";
import EmailTextField from "../../components/form/EmailTextField";
import PasswordTextField from "../../components/form/PasswordTextField";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";
import showGqlError from "../../helpers/showGqlError";
import ConfirmButton from "../../components/button/ConfirmButton";

export default function SignUpScreen() {
  const navigate = useNavigate();
  const [isLoadingSignUp, setIsLoadingSignUp] = createSignal(false);

  createRenderEffect(() => {
    SiteHead.title = "Sign up";
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

      const result = await GqlClient.client.mutate<{
        signUp: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation SignUp($email: String!, $password: String!) {
            signUp(email: $email, password: $password) {
              isSuccess
            }
          }
        `,
        variables: {
          email: target.email.value.toLowerCase(),
          password: target.password.value,
        },
      });

      if (!result.data?.signUp.isSuccess) throw result.errors;

      navigate(
        `${SitePath.verifySignUpPath}?email=${target.email.value.toLowerCase()}`
      );
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingSignUp(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div>
          <h1 class="text-2xl text-center">Sign up</h1>
        </div>
        <form onsubmit={signUp} class="mt-8">
          <div>
            <div>
              <div>
                <EmailTextField name="email" placeholder="Email" required />
              </div>
              <div class="mt-2">
                <PasswordTextField
                  name="password"
                  placeholder="Password"
                  required
                />
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
            <ConfirmButton type="submit">
              <Show
                when={!isLoadingSignUp()}
                fallback={
                  <div class="p-0.5">
                    <LoadingSpinner />
                  </div>
                }
              >
                Sign up
              </Show>
            </ConfirmButton>
          </div>
        </form>
      </div>
    </div>
  );
}
