// Copyright (c) 2019 SafetyCulture Pty Ltd. All Rights Reserved.

const injectContent = `
window.__GRPCWEB_DEVTOOLS__ = function (clients, UnaryCall) {
  if (clients.constructor !== Array) {
    return
  }
  const postType = "__GRPCWEB_DEVTOOLS__";
  const interceptor = {
    interceptUnary: (next, method, input, options) => {
      const callPromise = new Promise(resolve => {
        resolve(next(method, input, options));
      });
      return new UnaryCall(
        method,
        options.meta ?? {},
        input,
        callPromise.then(c => c.headers).catch(err => {}),
        callPromise.then(c => {
          console.log('Resolving', c.status);
          window.postMessage({
            type: postType,
            method: method.service.typeName+'.'+method.name,
            methodType: "unary",
            request: input,
            response: c.response,
            error: undefined,
          }, "*")
          return c.response;
        }).catch(err => {
          window.postMessage({
            type: postType,
            method: method.service.typeName+'.'+method.name,
            methodType: "unary",
            request: input,
            response: undefined,
            error: err.message,
          }, "*")
        }),
        callPromise.then(c => c.status).catch(err => {}),
        callPromise.then(c => c.trailers).catch(err => {})
      );
    },
  };

  clients.forEach(client => {
    const interceptors = (client._transport.defaultOptions.interceptors || [])
    if (interceptors.includes(interceptor)) {
      return;
    }
    client._transport.defaultOptions.interceptors = [...interceptors, interceptor];
  })
}
`;

let s = document.createElement("script");
s.type = "text/javascript";
const scriptNode = document.createTextNode(injectContent);
s.appendChild(scriptNode);
(document.head || document.documentElement).appendChild(s);
s.parentNode.removeChild(s);

var port;

function setupPortIfNeeded() {
  if (!port && chrome && chrome.runtime) {
    port = chrome.runtime.connect(null, { name: "content" });
    port.postMessage({ action: "init" });
    port.onDisconnect.addListener(() => {
      port = null;
      window.removeEventListener("message", handleMessageEvent, false);
    });
  }
}

function sendGRPCNetworkCall(data) {
  setupPortIfNeeded();
  if (port) {
    port.postMessage({
      action: "gRPCNetworkCall",
      target: "panel",
      data,
    });
  }
}

function handleMessageEvent(event) {
  if (event.source != window) return;
  if (event.data.type && event.data.type == "__GRPCWEB_DEVTOOLS__") {
    sendGRPCNetworkCall(event.data);
  }
}

window.addEventListener("message", handleMessageEvent, false);
