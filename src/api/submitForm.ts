import {
  RequestError,
  RequestRejector,
} from "@thepalaceproject/web-opds-client/lib/DataFetcher";

export const submitForm = (
  url: string,
  {
    data = null,
    csrfToken = undefined,
    returnType = undefined,
    method = "POST",
    defaultErrorMessage = "Failed to save changes",
  } = {}
) => {
  let err: RequestError;
  return new Promise((resolve, reject: RequestRejector) => {
    const headers = new Headers();
    if (csrfToken) {
      headers.append("X-CSRF-Token", csrfToken);
    }
    fetch(url, {
      method: method,
      headers: headers,
      body: data,
      credentials: "same-origin",
    })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          if (response.json && returnType === "JSON") {
            response.json().then((data) => {
              resolve(response);
            });
          } else if (response.text) {
            response.text().then((text) => {
              resolve(response);
            });
          } else {
            resolve(response);
          }
        } else {
          response
            .json()
            .then((data) => {
              err = {
                status: response.status,
                response: data.detail,
                url: url,
              };
              reject(err);
            })
            .catch((parseError) => {
              err = {
                status: response.status,
                response: defaultErrorMessage,
                url: url,
              };
              reject(err);
            });
        }
      })
      .catch((err) => {
        err = {
          status: null,
          response: err.message,
          url: url,
        };
        reject(err);
      });
  });
};
