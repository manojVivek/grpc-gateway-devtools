# gRPC-Gateway Dev Tools

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)


![gRPC-Gateway Dev Tools](screenshots/store_light_dark.png)
Now supports dark mode.

## Installation

### Chrome

Via the [Chrome Web Store](https://chrome.google.com/webstore/detail/grpc-web-developer-tools/kanmilmfkjnoladbbamlclhccicldjaj) (recommended)

or

  1. build it with `make build`
  1. open the **Extension Management** page by navigating to `chrome://extensions`.
  1. enable **Developer Mode** by clicking the toggle switch next to "Developer mode".
  1. Click the **LOAD UNPACKED** button and select the extension `./build` directory.

### Firefox

Via [Firefox Browser Add-Ons](https://addons.mozilla.org/en-US/firefox/addon/grpc-web-developer-tools/) (recommended)

or

  1. build and package with `make package`
  1. enter `about:debugging` in the URL bar of Firefox
  1. click **This Firefox** > **Load Temporary Add-on...**
  1. select the `grpc-web-devtools.zip` extention file

## Usage

```javascript
import {UnaryCall} from '@protobuf-ts/runtime-rpc';

const enableDevTools = window.__GRPC_DEVTOOLS__ || (() => {});
const client = new EchoServiceClient('http://myapi.com');
enableDevTools([
  client,
], UnaryCall);
```
> NOTE: Requires that your generated client(s) use `@protobuf-ts`.