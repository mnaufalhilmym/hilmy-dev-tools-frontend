import { Suspense } from "react";
import AppWrapper from "./AppWrapper";
import NoSSRWrapper from "./NoSSRWrapper";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <>
      <NoSSRWrapper>
        <Suspense>
          <AppWrapper />
        </Suspense>
      </NoSSRWrapper>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
