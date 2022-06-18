window.__GRPC_DEVTOOLS__ = function (clients, UnaryCall) {
  if (clients.constructor !== Array) {
    return;
  }
  const postType = "__GRPC_DEVTOOLS__";
  const interceptor = {
    interceptUnary: (next, method, input, options) => {
      const callPromise = new Promise((resolve) => {
        resolve(next(method, input, options));
      });
      return new UnaryCall(
        method,
        options.meta ?? {},
        input,
        callPromise.then((c) => c.headers).catch((err) => {}),
        callPromise
          .then((c) => {
            window.postMessage(
              {
                type: postType,
                method: method.service.typeName + "." + method.name,
                methodType: "unary",
                request: input,
                response: c.response,
                error: undefined,
              },
              "*"
            );
            return c.response;
          })
          .catch((err) => {
            window.postMessage(
              {
                type: postType,
                method: method.service.typeName + "." + method.name,
                methodType: "unary",
                request: input,
                response: undefined,
                error: err.message,
              },
              "*"
            );
          }),
        callPromise.then((c) => c.status).catch((err) => {}),
        callPromise.then((c) => c.trailers).catch((err) => {})
      );
    },
  };

  clients.forEach((client) => {
    const interceptors = client._transport.defaultOptions.interceptors || [];
    if (interceptors.includes(interceptor)) {
      return;
    }
    client._transport.defaultOptions.interceptors = [
      ...interceptors,
      interceptor,
    ];
  });
};
