/** @type {import('next').NextConfig} */
require('dotenv').config();

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate", 
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    config.module.rules.push(
      {
        test: /\.d\.ts$/,
        loader: 'ignore-loader'
      },
      {
        test: /\.map$/,
        loader: 'ignore-loader'
      },
      {
        test: /\.d\.ts\.map$/,
        loader: 'ignore-loader'
      }
    );

    config.module.rules.push({
      test: /node_modules\/@metamask\/sdk\/.*\.(d\.ts|map)$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'cdn-stg.rocketlaunch.fun',
  //       pathname: '**'
  //     }
  //   ],
  //   // domains: ['cdn-stg.rocketlaunch.fun', 'pump.mypinata.cloud', 'ipfs.io','s2.coinmarketcap.com']
  // }

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-stg.rocketlaunch.fun',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pump.mypinata.cloud',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
        pathname: '**',
      },
    ],
  },
  turbopack: {}
};

module.exports = nextConfig;
