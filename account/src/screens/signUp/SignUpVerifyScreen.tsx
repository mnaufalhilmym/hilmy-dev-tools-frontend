import { gql } from "@apollo/client/core";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../../api/gqlClient";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PlainTextField from "../../components/form/PlainTextField";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";

export default function SignUpVerifyScreen() {
  const gqlClient = GqlClient.get();
  const navigate = useNavigate();
  const [params, _] = useSearchParams<{ email?: string }>();
  const [isLoadingVerifySignUp, setIsLoadingVerifySignUp] = createSignal(false);

  createRenderEffect(() => {
    if (!params.email) {
      navigate(SitePath.signUpPath, { replace: true });
      return;
    }

    SiteHead.setTitle("Sign Up Verification");
  });

  function back() {
    history.back();
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

      const result = await gqlClient.mutate<{
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
          email: params.email,
          verifyCode: target.code.value,
        },
      });

      if (!result.data?.verifySignUp.isSuccess) throw result.errors;

      navigate(SitePath.signInPath, { replace: true });
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e);
      }
      toast.error(e?.toString());
    } finally {
      setIsLoadingVerifySignUp(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="mx-auto p-10 border-2 rounded-lg">
        <form onsubmit={verifySignUp} class="min-w-[24rem]">
          <div>
            <h1 class="text-2xl text-center">Verify your email</h1>
          </div>
          <div class="mt-6">
            <div>
              <p>A verification code is sent to {params.email}.</p>
            </div>
            <div class="mt-2">
              <div>
                <PlainTextField name="code" placeholder="Verification code" />
              </div>
            </div>
          </div>
          <div class="mt-10 -ml-1.5 flex items-center justify-between">
            <button
              onclick={back}
              class="px-1.5 py-1.5 text-teal-500 hover:text-teal-600 hover:bg-teal-50 active:bg-teal-100 rounded transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 hover:drop-shadow text-white rounded transition duration-200"
            >
              <Show
                when={!isLoadingVerifySignUp()}
                fallback={<LoadingSpinner />}
              >
                Verify
              </Show>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
