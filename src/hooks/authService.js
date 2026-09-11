export const logout = async () => {
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("cartUpdated"));
  return true;
};