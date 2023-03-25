import NotFoundScreen from "./NotFoundScreen";

interface Props {
  error?: any;
}

export default function ErrorWrapper(props: Props) {
  return (
    <div>
      <div class="fixed z-50 top-0 w-full">
        <div class="py-3 px-3.5 flex justify-between items-center">
          <a href={import.meta.env.VITE_SITE_LINK_URL}>
            <h1 class="px-1.5 font-bold text-xl">
              {import.meta.env.VITE_SITE_NAME}
            </h1>
          </a>
          <div>
            <a
              href={import.meta.env.VITE_SITE_ACCOUNT_URL}
              class="px-4 py-1.5 hover:bg-black/5 active:bg-black/10 border border-black/20 hover:drop-shadow rounded transition duration-200"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>

      <div class="pt-16">
        <NotFoundScreen />
      </div>
    </div>
  );
}
