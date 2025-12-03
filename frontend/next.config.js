// next.config.js
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Prevent bundling of modules not needed for the web build
            config.resolve.fallback = {
                ...config.resolve.fallback,
                '@react-native-async-storage/async-storage': false,
                'pino-pretty': false,
            };
            // Alias to empty shim files to satisfy imports
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                '@react-native-async-storage/async-storage': path.resolve(__dirname, 'shims/async-storage.js'),
                'pino-pretty': path.resolve(__dirname, 'shims/pino-pretty.js'),
            };
        }
        return config;
    },
};
module.exports = nextConfig;
