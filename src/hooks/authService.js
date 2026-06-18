export const logout =
  async () => {

    localStorage.clear();

    return true;
  };