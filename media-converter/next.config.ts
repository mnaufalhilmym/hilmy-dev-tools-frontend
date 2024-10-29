import type { NextConfig } from "next";

async function headers() {
  return [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "require-corp",
        },
      ],
    }
  ]
}

const nextConfig: NextConfig = {
  /* config options here */
  headers,
  output: "standalone"
};

export default nextConfig;
