const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

export const authLink = {
  type: params.get("type"),
  error: params.get("error_description"),
};
