import { gql } from "@apollo/client/core";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../../../api/gqlClient";
import ConfirmButton from "../../../components/button/ConfirmButton";
import PlainTextField from "../../../components/form/PlainTextField";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import SiteHead from "../../../data/siteHead";
import SitePath from "../../../data/sitePath";
import showGqlError from "../../../helpers/showGqlError";

export default function VerifyRequestResetPasswordScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams<{ email?: string }>();
  const [isLoadingVerifyResetPassword, setIsLoadingVerifyResetPassword] =
    createSignal(false);

  createRenderEffect(() => {
    if (!params.email) {
      navigate(SitePath.requestResetPasswordPath, { replace: true });
      return;
    }

    SiteHead.title = "Reset Password Verification";
  });

  function back() {
    navigate(SitePath.requestResetPasswordPath, { replace: true });
  }

  async function verifyResetPassword(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingVerifyResetPassword()) return;

    const target = event.target as typeof event.target & {
      code: { value: string };
    };

    try {
      setIsLoadingVerifyResetPassword(true);

      const result = await GqlClient.client.mutate<{
        verifyRequestResetPassword: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation VerifyRequestResetPassword(
            $email: String!
            $verifyCode: String!
          ) {
            verifyRequestResetPassword(email: $email, verifyCode: $verifyCode) {
              isSuccess
            }
          }
        `,
        variables: {
          email: params.email!.toLowerCase(),
          verifyCode: target.code.value,
        },
      });

      if (!result.data?.verifyRequestResetPassword.isSuccess)
        throw result.errors;

      navigate(
        `${
          SitePath.resetPasswordPath
        }?email=${params.email!.toLowerCase()}&code=${target.code.value}`
      );
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingVerifyResetPassword(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div>
          <h1 class="text-2xl text-center">Reset password verification</h1>
        </div>
        <form onsubmit={verifyResetPassword} class="mt-6">
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
                when={!isLoadingVerifyResetPassword()}
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
