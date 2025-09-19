/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@react-three/fiber', 'three'],
    },
    images: {
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
    },
    // Enable strict mode for better development experience
    reactStrictMode: true,
    // Optimize for production
    swcMinify: true,
    // Enable compression
    compress: true,
    // Remove powered by header for security
    poweredByHeader: false,

    // Optimize bundle splitting
    webpack: (config, { dev, isServer }) => {
        // Optimize for production builds
        if (!dev && !isServer) {
            // Split vendor chunks more efficiently
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks.cacheGroups,
                    // Separate Three.js and React Three Fiber into their own chunk
                    three: {
                        name: 'three',
                        test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
                        chunks: 'all',
                        priority: 30,
                        reuseExistingChunk: true,
                    },
                    // Separate React into its own chunk
                    react: {
                        name: 'react',
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        chunks: 'all',
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                },
            };
        }

        // Bundle analyzer (only when ANALYZE=true)
        if (process.env.ANALYZE === 'true' && !isServer) {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: false,
                    reportFilename: '../bundle-analyzer-report.html',
                })
            );
        }

        return config;
    },

    // Configure headers for better performance and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                ],
            },
            {
                source: '/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
