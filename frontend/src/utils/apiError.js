export const getApiErrorMessage = (
  error,
  fallback = 'Something went wrong.'
) => {
  // No server response
  if (!error?.response) {
    return 'Unable to connect to the server.';
  }

  const data = error.response.data;

  // DRF common format:
  // { detail: "..." }
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  // Sometimes backend may return:
  // { message: "..." }
  if (typeof data?.message === 'string') {
    return data.message;
  }

  // Serializer field errors:
  // {
  //   email: ["Invalid email"],
  //   password: ["Too short"]
  // }
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data)
  ) {
    for (const value of Object.values(data)) {
      if (
        Array.isArray(value) &&
        value.length > 0
      ) {
        return String(value[0]);
      }

      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return fallback;
};