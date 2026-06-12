/** Script đồng bộ class dark theo system preference trước hydration. */
export const COLOR_SCHEME_INIT_SCRIPT = `(() => {
  const root = document.documentElement;
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => root.classList.toggle("dark", query.matches);

  apply();
  query.addEventListener?.("change", apply);
})();`;
