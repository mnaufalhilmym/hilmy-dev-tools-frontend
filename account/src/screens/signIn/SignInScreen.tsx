import { gql } from "@apollo/client/core";
import { Link } from "@solidjs/router";
import { createRenderEffect, createSignal } from "solid-js";
import GqlClient from "../../api/gqlClient";
import EmailTextField from "../../components/form/EmailTextField";
import PasswordTextField from "../../components/form/PasswordTextField";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";

export default function SignInScreen() {
  const gqlClient = GqlClient.get();
  const [isLoadingSignIn, setIsLoadingSignIn] = createSignal(false);

  createRenderEffect(() => {
    SiteHead.setTitle("Sign In");
  });

  async function signIn(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingSignIn()) return;

    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };

    try {
      setIsLoadingSignIn(true);

      const result = await gqlClient.mutate<{ signIn: { token: string } }>({
        mutation: gql`
          mutation SignIn($email: String!, $password: String!) {
            signIn(email: $email, password: $password) {
              token
            }
          }
        `,
        variables: {
          email: target.email.value,
          password: target.password.value,
        },
      });

      if (!result.data?.signIn.token) throw result.errors;

      console.log(result.data.signIn.token);
    } catch (e) {
    } finally {
      setIsLoadingSignIn(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="mx-auto p-10 border-2 rounded-lg">
        <form onsubmit={signIn} class="min-w-[24rem]">
          <div>
            <h1 class="text-2xl text-center">Sign In</h1>
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
            <div class="mt-4">
              <Link
                href={SitePath.resetPasswordPath}
                class="-ml-1 px-1 py-0.5 active:bg-teal-100 text-teal-500 active:text-teal-600 rounded"
              >
                Reset password
              </Link>
            </div>
          </div>
          <div class="mt-10 -ml-1.5 flex items-center justify-between">
            <Link
              href={SitePath.signUpPath}
              class="px-1.5 py-1.5 text-teal-500 hover:text-teal-600 hover:bg-teal-50 active:bg-teal-100 rounded transition-colors duration-200"
            >
              Create account
            </Link>
            <button
              type="submit"
              class="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 hover:drop-shadow text-white rounded transition duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
