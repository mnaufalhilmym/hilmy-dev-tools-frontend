"use client";

import dynamic from "next/dynamic";

interface Props {
  children?: JSX.Element;
}

function NoSSRWrapper(props: Props) {
  return props.children;
}

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
});
