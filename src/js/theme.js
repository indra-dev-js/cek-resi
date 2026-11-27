const root = document.documentElement;

function getInitialTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme) {
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
  localStorage.setItem('theme', theme);

  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap',
    );
    button.setAttribute(
      'title',
      theme === 'dark' ? 'Tema terang' : 'Tema gelap',
    );
  });
}

applyTheme(getInitialTheme());

document.querySelectorAll('[data-theme-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
});
