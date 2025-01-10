import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "nr8rtll1pb.ufs.sh", // Add this hostname
        port: "",
      },
    ],
  },
};

export default nextConfig;
