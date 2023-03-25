import SentimentVeryDissatisfied from "../../components/icon/SentimentVeryDissatisfied";

export default function NotFoundScreen() {
  return (
    <div class="max-w-screen-sm mx-auto py-28 px-8 flex flex-col sm:flex-row gap-4 items-center">
      <div>
        <span class="flex text-9xl">
          <SentimentVeryDissatisfied />
        </span>
      </div>
      <div>
        <div>
          <span class="block font-bold text-2xl">Oops!</span>
        </div>
        <div>
          <span class="block mt-2 text-xl">Not found</span>
        </div>
        <div class="mt-2">
          <span>
            This is a 404 error, which means you've clicked on a bad link or
            entered an invalid URL. Please check the URL, or return back to{" "}
            <a
              href={import.meta.env.VITE_SITE_LINK_URL}
              class="text-teal-500 underline"
            >
              link
            </a>
            . P.S. Link are case sensitive.
          </span>
        </div>
      </div>
    </div>
  );
}
