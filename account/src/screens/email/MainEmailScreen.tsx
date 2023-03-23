import { gql } from "@apollo/client/core";
import { Link, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import GqlClient from "../../api/gqlClient";
import ConfirmButton from "../../components/button/ConfirmButton";
import EmailTextField from "../../components/form/EmailTextField";
import ArrowBackIcon from "../../components/icon/ArrowBackIcon";
import LoadingSpinner from "../../components/loading/LoadingSpinner";
import SitePath from "../../data/sitePath";
import showGqlError from "../../helpers/showGqlError";

export default function MainEmailScreen() {
  const navigate = useNavigate();
  const [isLoadingChangeEmail, setIsLoadingChangeEmail] = createSignal(false);

  async function changeEmail(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingChangeEmail()) return;

    const target = event.target as typeof event.target & {
      email: { value: string };
    };

    try {
      setIsLoadingChangeEmail(true);

      const result = await GqlClient.client.mutate<{
        changeEmail: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation ChangeEmail($newEmail: String!) {
            changeEmail(newEmail: $newEmail) {
              isSuccess
            }
          }
        `,
        variables: {
          newEmail: target.email.value.toLowerCase(),
        },
      });

      if (!result.data?.changeEmail.isSuccess) throw result.errors;

      navigate(
        `${SitePath.verifyEmailPath}?email=${target.email.value.toLowerCase()}`
      );
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingChangeEmail(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div class="flex items-center gap-x-2">
          <Link href={SitePath.homePath} class="flex">
            <ArrowBackIcon />
          </Link>
          <div>
            <h1 class="text-2xl text-center">Email</h1>
          </div>
        </div>
        <form onsubmit={changeEmail} class="mt-8">
          <div>
            <div>
              <div>
                <EmailTextField name="email" placeholder="New email" required />
              </div>
            </div>
          </div>
          <div class="mt-10 ">
            <div class="w-fit ml-auto">
              <ConfirmButton type="submit">
                <Show
                  when={!isLoadingChangeEmail()}
                  fallback={
                    <div class="p-0.5">
                      <LoadingSpinner />
                    </div>
                  }
                >
                  Change email
                </Show>
              </ConfirmButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
