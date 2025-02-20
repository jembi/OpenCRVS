# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e

get_abs_filename() {
  echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

write=false
outdated=false

for i in "$@"; do
  case $i in
    --outdated)
      outdated=true
      shift
      ;;
    --write)
      write=true
      shift
      ;;
    -*|--*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      ;;
  esac
done


if [ -z "$COUNTRY_CONFIG_PATH" ] ; then
  echo 'The Environment variable COUNTRY_CONFIG_PATH must be set in your Terminal, '
  echo 'so we can check that your country configuration has all necessary translations.'
  echo 'If you cd into your country configuration repo and run the command pwd, then this will display for you.'
  echo 'Then run export COUNTRY_CONFIG_PATH=<your country config path> in this window and try to commit again please..'
  exit 1
elif [[ ! -d "${COUNTRY_CONFIG_PATH}" ]]; then
  echo "COUNTRY_CONFIG_PATH does not look like a real directory path."
  echo "Country config path you tried using: $(get_abs_filename $COUNTRY_CONFIG_PATH)"
  exit 1
fi

if $outdated; then
  yarn run ts-node -- --compiler-options='{"module": "commonjs", "moduleResolution": "node"}' -r tsconfig-paths/register src/extract-translations.ts -- $COUNTRY_CONFIG_PATH --outdated
  exit 0
fi

if $write; then
  yarn run ts-node -- --compiler-options='{"module": "commonjs", "moduleResolution": "node"}' -r tsconfig-paths/register src/extract-translations.ts -- $COUNTRY_CONFIG_PATH --write
  exit 0
fi

if [ $CI = true ]; then
  yarn run ts-node -- --compiler-options='{"module": "commonjs", "moduleResolution": "node"}' -r tsconfig-paths/register src/extract-translations.ts -- $COUNTRY_CONFIG_PATH --ci
  exit 0
fi
yarn run ts-node -- --compiler-options='{"module": "commonjs", "moduleResolution": "node"}' -r tsconfig-paths/register src/extract-translations.ts -- $COUNTRY_CONFIG_PATH
