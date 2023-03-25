import { gql } from "@apollo/client/core";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../../api/gqlClient";
import LoadingSpinner from "../../components/loading/LoadingSpinner";
import PlainTextField from "../../components/form/PlainTextField";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";
import showGqlError from "../../helpers/showGqlError";
import ConfirmButton from "../../components/button/ConfirmButton";
import toast from "solid-toast";

export default function SignUpVerifyScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams<{ email?: string }>();
  const [isLoadingVerifySignUp, setIsLoadingVerifySignUp] = createSignal(false);

  createRenderEffect(() => {
    if (!params.email) {
      navigate(SitePath.signUpPath, { replace: true });
      return;
    }

    SiteHead.title = "Sign up verification";
  });

  function back() {
    navigate(SitePath.signUpPath, { replace: true });
  }

  async function verifySignUp(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingVerifySignUp()) return;

    const target = event.target as typeof event.target & {
      code: { value: string };
    };

    try {
      setIsLoadingVerifySignUp(true);

      const result = await GqlClient.client.mutate<{
        verifySignUp: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation VerifySignUp($email: String!, $verifyCode: String!) {
            verifySignUp(email: $email, verifyCode: $verifyCode) {
              isSuccess
            }
          }
        `,
        variables: {
          email: params.email!.toLowerCase(),
          verifyCode: target.code.value,
        },
      });

      if (!result.data?.verifySignUp.isSuccess) throw result.errors;

      toast.success("Account verified");
      navigate(SitePath.signInPath, { replace: true });
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingVerifySignUp(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div>
          <h1 class="text-2xl text-center">Verify your email</h1>
        </div>
        <form onsubmit={verifySignUp} class="mt-6">
          <div>
            <div>
              <span>
                A verification code is sent to {params.email!.toLowerCase()}.
              </span>
            </div>
            <div class="mt-2">
              <div>
                <PlainTextField
                  name="code"
                  placeholder="Verification code"
                  required
                />
              </div>
            </div>
          </div>
          <div class="mt-10 -ml-1.5 flex items-center justify-between">
            <button
              type="button"
              onclick={back}
              class="px-1.5 py-1.5 text-teal-500 hover:text-teal-600 hover:bg-teal-50 active:bg-teal-100 rounded transition-colors duration-200"
            >
              Back
            </button>
            <ConfirmButton type="submit">
              <Show
                when={!isLoadingVerifySignUp()}
                fallback={
                  <div class="p-0.5">
                    <LoadingSpinner />
                  </div>
                }
              >
                Verify
              </Show>
            </ConfirmButton>
          </div>
        </form>
      </div>
    </div>
  );
}
