# Starlight

Monorepo for _Starlight_, consisting of an [Express][expr] API and [Vite][vite]
SPA for [Zigbee2MQTT][z2m] - written in [TypeScript][ts].

Starlight is intended to replace the frontend of Zigbee2MQTT, and provide a REST
API; to abstract away the MQTT message protocol, and for alternative clients
(such as a TUI application).

## Contributing

Any changes should be made against a separate branch, and a pull request opened.
Please remember to [install the pre-commit hooks][precommit] so these run before
you commit changes.

### License

This repository is licensed under the GNU Affero General Public License, version
3 (or at your option, **any later version**).

`SPDX-License-Identifier: AGPL-3.0-or-later`

[z2m]: https://www.zigbee2mqtt.io/
[expr]: https://expressjs.com/
[vite]: https://vitejs.dev/
[ts]: https://www.typescriptlang.org/
[precommit]: https://pre-commit.com/#install
