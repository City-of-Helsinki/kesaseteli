const webpack = require('webpack');
const path = require('path');
const withPlugins = require('next-compose-plugins');
const { withSentryConfig } = require('@sentry/nextjs');
const withTranspileModules = require('next-transpile-modules');
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
const pc = require('picocolors');
const packageJson = require('./package.json');
const { parsed: env } = require('dotenv').config({
  path: '.env.kesaseteli',
});

const trueEnv = ['true', '1', 'yes'];

const NEXTJS_IGNORE_ESLINT = trueEnv.includes(process.env?.NEXTJS_IGNORE_ESLINT ?? 'false');
const NEXTJS_IGNORE_TYPECHECK = trueEnv.includes(process.env?.NEXTJS_IGNORE_TYPECHECK ?? 'false');
const NEXTJS_DISABLE_SENTRY = trueEnv.includes(process.env?.NEXTJS_DISABLE_SENTRY ?? 'false');
const NEXTJS_SENTRY_UPLOAD_DRY_RUN = trueEnv.includes(process.env?.NEXTJS_SENTRY_UPLOAD_DRY_RUN ?? 'false');
const NEXTJS_SENTRY_DEBUG = trueEnv.includes(process.env?.NEXTJS_SENTRY_DEBUG ?? 'false');
const NEXTJS_SENTRY_TRACING = trueEnv.includes(process.env?.NEXTJS_SENTRY_TRACING ?? 'false');

// Get the app context ...
let appName;
if (process.cwd().indexOf('/app/') === 0) {
  // ... from docker system
  appName = process.cwd().split('/app/').pop();
} else if (process.cwd().includes('/frontend/')) {
  // ... from local system
  appName = process.cwd().split('/frontend/').pop();
}

/**
 * A way to allow CI optimization when the build done there is not used
 * to deliver an image or deploy the files.
 * @link https://nextjs.org/docs/advanced-features/source-maps
 */
const disableSourceMaps = trueEnv.includes(process.env?.NEXT_DISABLE_SOURCEMAPS ?? 'false');

if (disableSourceMaps) {
  console.warn(`${pc.yellow('notice')}- Sourcemaps generation have been disabled through NEXT_DISABLE_SOURCEMAPS`);
}

if (NEXTJS_SENTRY_DEBUG) {
  console.warn(`${pc.yellow('notice')}- Build won't use sentry treeshaking (NEXTJS_SENTRY_DEBUG)`);
}

const nextConfig = (override) => ({
  productionBrowserSourceMaps: !disableSourceMaps,
  poweredByHeader: false,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    externalDir: true,
  },
  output: 'standalone',
  typescript: {
    /** Do not run TypeScript during production builds (`next build`). */
    ignoreBuildErrors: NEXTJS_IGNORE_TYPECHECK,
  },
  eslint: {
    ignoreDuringBuilds: NEXTJS_IGNORE_ESLINT,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };

    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\/(__tests__|test)\// }));

    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/
    config.plugins.push(
      new webpack.DefinePlugin({
        __SENTRY_DEBUG__: NEXTJS_SENTRY_DEBUG,
        __SENTRY_TRACING__: NEXTJS_SENTRY_TRACING,
      }),
    );

    config.module.rules.push({
      test: /\.test.tsx$/,
      loader: 'ignore-loader',
    });

    if (appName && appName === 'benefit/applicant') {
      config.module.rules.push({
        test: /pdfjs-dist\/build\/pdf\.worker\.js$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/chunks/[name].[hash][ext]',
        },
      });
    }

    return config;
  },
  env: {
    APP_NAME: packageJson.name,
    APP_VERSION: packageJson.version,
    BUILD_TIME: new Date().toISOString(),
    ...env,
  },
  serverRuntimeConfig: {
    // to bypass https://github.com/zeit/next.js/issues/8251
    PROJECT_ROOT: __dirname,
  },
  ...override,
});

let config = nextConfig;

if (!NEXTJS_DISABLE_SENTRY) {
  console.warn(`${pc.yellow('notice')}- Sentry is enabled (NEXTJS_DISABLE_SENTRY)`);
  // @ts-ignore because sentry does not match nextjs current definitions
  config = withSentryConfig(config, {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
    // silent: isProd, // Suppresses all logs
    dryRun: NEXTJS_SENTRY_UPLOAD_DRY_RUN,
  });
} else {
  console.warn(`${pc.yellow('notice')}- Sentry is disabled (NEXTJS_DISABLE_SENTRY)`);
}

const plugins = [[withTranspileModules, { transpileModules: ['@frontend'] }]];

module.exports = async (phase) => withPlugins(plugins, config(phase))(phase, { undefined });
