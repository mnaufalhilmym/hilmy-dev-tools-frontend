import { gql } from "@apollo/client/core";
import { Link, useNavigate } from "@solidjs/router";
import { createRenderEffect, createSignal } from "solid-js";
import GqlClient from "../../api/gqlClient";
import ConfirmButton from "../../components/button/ConfirmButton";
import EmailTextField from "../../components/form/EmailTextField";
import PasswordTextField from "../../components/form/PasswordTextField";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";
import { deleteCookie, saveCookie } from "../../helpers/cookie";
import showGqlError from "../../helpers/showGqlError";

export default function SignInScreen() {
  const navigate = useNavigate();
  const [isLoadingSignIn, setIsLoadingSignIn] = createSignal(false);

  createRenderEffect(() => {
    SiteHead.title = "Sign in";
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

      const result = await GqlClient.client.mutate<{
        signIn: { token: string };
      }>({
        mutation: gql`
          mutation SignIn($email: String!, $password: String!) {
            signIn(email: $email, password: $password) {
              token
            }
          }
        `,
        variables: {
          email: target.email.value.toLowerCase(),
          password: target.password.value,
        },
      });

      if (!result.data?.signIn.token) throw result.errors;

      let redirect = sessionStorage.getItem("redirect");
      if (!!redirect) {
        sessionStorage.removeItem("redirect");
        if (redirect.includes("?")) {
          redirect += "&";
        } else {
          redirect += "?";
        }
        redirect += `token=${result.data.signIn.token}`;
        window.location.replace(redirect);
      } else {
        saveCookie({ key: "token", value: result.data.signIn.token });
        GqlClient.update();
        navigate(SitePath.homePath, { replace: true });
      }
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingSignIn(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div class="min-w-[24rem]">
          <div>
            <h1 class="text-2xl text-center">Sign in</h1>
          </div>
          <form onsubmit={signIn} class="mt-8">
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
              <div class="mt-4">
                <Link
                  href={SitePath.requestResetPasswordPath}
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
              <ConfirmButton type="submit">Sign in</ConfirmButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
