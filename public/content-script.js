let s = document.createElement("script");
s.type = "text/javascript";
s.src = chrome.runtime.getURL("/grpc-request-interceptor.js");
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
  if (event.data.type && event.data.type == "__GRPC_DEVTOOLS__") {
    sendGRPCNetworkCall(event.data);
  }
}

window.addEventListener("message", handleMessageEvent, false);
