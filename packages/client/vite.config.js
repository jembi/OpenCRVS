/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

process.env.VITE_APP_COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env')

  const noTreeshakingForEvalPlugin = () => {
    return {
      name: 'no-treeshaking-for-eval',
      transform(code) {
        if (code.match(/eval\(/)) return { moduleSideEffects: 'no-treeshake' }
      }
    }
  }

  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/%(.*?)%/g, function (_, p1) {
          return env[p1]
        })
      }
    }
  }
  return {
    /*
     * https://github.com/storybookjs/storybook/issues/18920
     * the issue occurs because of util.js which is a
     * transitive depedency of storybook. I think it might
     * be a good idea to separate components and storybook
     * in that case because possibly storybook is getting
     * included in components bundle
     */
    define: { 'process.env': {} },
    // This changes the output dir from dist to build
    build: {
      outDir: 'build',
      rollupOptions: {
        plugins: [noTreeshakingForEvalPlugin()]
      },
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    resolve: {
      alias: {
        crypto: 'crypto-js'
      }
    },
    plugins: [htmlPlugin(), react(), tsconfigPaths()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      testTimeout: 60000,
      hookTimeout: 60000,
      globals: true,
      coverage: {
        reporter: ['text', 'json', 'html']
      }
    }
  }
})
