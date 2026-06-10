(() => {
  const root = document.documentElement;
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => root.classList.toggle("dark", query.matches);

  apply();
  query.addEventListener?.("change", apply);
})();
