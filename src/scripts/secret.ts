const SECRET_KEY = 'cu:secret-unlocked';

function redirectHome(): void {
  location.replace('/');
}

export async function mountSecret(): Promise<void> {
  try {
    if (localStorage.getItem(SECRET_KEY) !== '1') {
      redirectHome();
      return;
    }
  } catch {
    redirectHome();
    return;
  }

  const root = document.querySelector<HTMLElement>('[data-secret-root]');
  if (!root) return;

  // Dynamic import so the letter is not in the initial HTML document.
  const { secretLetter } = await import('../content/secret-letter');

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = secretLetter.title;

  const dek = document.createElement('p');
  dek.className = 'page-dek meta';
  dek.textContent = secretLetter.dek;

  root.replaceChildren(title, dek);

  for (const text of secretLetter.paragraphs) {
    const p = document.createElement('p');
    p.textContent = text;
    root.appendChild(p);
  }

  const back = document.createElement('p');
  const a = document.createElement('a');
  a.href = '/';
  a.textContent = '← Back home';
  back.appendChild(a);
  root.appendChild(back);

  root.removeAttribute('aria-busy');
  document.documentElement.dataset.secret = 'open';
}
