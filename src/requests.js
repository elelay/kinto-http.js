import { omit, createFormData } from "./utils";


const requestDefaults = {
  safe: false,
  // check if we should set default content type here
  headers: {},
  permissions: undefined,
  data: undefined,
  patch: false,
};

/**
 * @private
 */
function safeHeader(safe, last_modified) {
  if (!safe) {
    return {};
  }
  if (last_modified) {
    return {"If-Match": `"${last_modified}"`};
  }
  return {"If-None-Match": "*"};
}

/**
 * @private
 */
export function createRequest(path, {data, permissions}, options={}) {
  const { headers, safe } = {
    ...requestDefaults,
    ...options,
  };
  return {
    method: data && data.id ? "PUT" : "POST",
    path,
    headers: {...headers, ...safeHeader(safe)},
    body: {
      data,
      permissions
    }
  };
}

/**
 * @private
 */
export function updateRequest(path, {data, permissions}, options={}) {
  const {
    headers,
    safe,
    patch,
  } = {...requestDefaults, ...options};
  const { last_modified } = { ...data, ...options };

  if (Object.keys(omit(data, "id", "last_modified")).length === 0) {
    data = undefined;
  }

  return {
    method: patch ? "PATCH" : "PUT",
    path,
    headers: {
      ...headers,
      ...safeHeader(safe, last_modified)
    },
    body: {
      data,
      permissions
    }
  };
}

/**
 * @private
 */
export function deleteRequest(path, options={}) {
  const {headers, safe, last_modified} = {
    ...requestDefaults,
    ...options
  };
  if (safe && !last_modified) {
    throw new Error("Safe concurrency check requires a last_modified value.");
  }
  return {
    method: "DELETE",
    path,
    headers: {...headers, ...safeHeader(safe, last_modified)}
  };
}

/**
 * @private
 */
export function addAttachmentRequest(path, dataURI, {data, permissions}={}, options={}) {
  const {headers, safe} = {...requestDefaults, ...options};
  const {last_modified} = {...data, ...options };
  if (safe && !last_modified) {
    throw new Error("Safe concurrency check requires a last_modified value.");
  }

  const body = {data, permissions};
  const formData = createFormData(dataURI, body, options);

  return {
    method: "POST",
    path,
    headers: {
      ...headers,
      ...safeHeader(safe, last_modified),
    },
    body: formData
  };
}
