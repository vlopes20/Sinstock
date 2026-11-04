(() => {
  'use strict';
  const protectedPage =
    document.documentElement.hasAttribute('data-auth-required');
  let profile = null;
  const clear = () => {
    ['sinstock.access', 'sinstock.preAuth'].forEach((key) =>
      sessionStorage.removeItem(key),
    );
    ['access_token', 'token', 'usuario'].forEach((key) =>
      localStorage.removeItem(key),
    );
    profile = null;
  };
  function login(reason = '') {
    clear();
    location.replace(
      SinstockConfig.url('index.html') +
        (reason ? `?reason=${encodeURIComponent(reason)}` : ''),
    );
  }
  function accept(data) {
    if (typeof data?.access_token !== 'string' || !data.access_token)
      throw new Error('Resposta de autenticação inválida.');
    clear();
    sessionStorage.setItem('sinstock.access', data.access_token);
    profile = data.usuario || null;
  }
  function renderUser(user) {
    document
      .querySelectorAll('[data-admin-only]')
      .forEach((node) => node.classList.toggle('hidden', user.perfil_id !== 1));
    document
      .querySelectorAll('.user > span:not(.user-arrow)')
      .forEach((node) => {
        node.textContent = user.nome;
      });
    document.querySelectorAll('.avatar').forEach((node) => {
      const initials = user.nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((name) => name[0])
        .join('')
        .toUpperCase();
      const span = document.createElement('span');
      span.textContent = initials;
      span.setAttribute('aria-label', user.nome);
      node.replaceChildren(span);
      node.classList.add('flex', 'items-center', 'justify-center');
    });
    const userMenu = document.querySelector('.user');
    if (userMenu) {
      let logout = document.getElementById('sessionLogout');
      if (!logout) {
        logout = document.createElement('button');
        logout.id = 'sessionLogout';
        logout.type = 'button';
        logout.textContent = 'Sair';
        logout.className =
          'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700';
        logout.addEventListener('click', () => SinstockSession.logout());
        userMenu.after(logout);
      }
    }
  }
  async function verify() {
    if (!sessionStorage.getItem('sinstock.access')) {
      login();
      return null;
    }
    try {
      profile = await SinstockAPI.request('/auth/me');
      if (!profile?.ativo) {
        login('expired');
        return null;
      }
      if (
        document.documentElement.dataset.authRequired === 'admin' &&
        profile.perfil_id !== 1
      ) {
        throw new Error('Apenas administradores podem cadastrar usuários.');
      }
      renderUser(profile);
      document.documentElement.classList.remove('invisible');
      return profile;
    } catch (error) {
      if (error.status === 401) return null;
      const panel = document.createElement('main');
      panel.className = 'mx-auto max-w-lg p-8 text-center';
      const message = document.createElement('p');
      message.textContent = error.message;
      const retry = document.createElement('button');
      retry.textContent = 'Tentar novamente';
      retry.className = 'm-4 rounded-lg bg-orange-600 px-4 py-2 text-white';
      retry.addEventListener('click', () => location.reload());
      const back = document.createElement('a');
      back.href = SinstockConfig.url('index.html');
      back.textContent = 'Voltar ao login';
      panel.append(message, retry, back);
      document.body.replaceChildren(panel);
      document.documentElement.classList.remove('invisible');
      return null;
    }
  }
  window.addEventListener('sinstock:unauthorized', () => login('expired'));
  const ready = new Promise((resolve) =>
    document.addEventListener(
      'DOMContentLoaded',
      async () => resolve(protectedPage ? await verify() : null),
      { once: true },
    ),
  );
  if (protectedPage && !sessionStorage.getItem('sinstock.access')) login();
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && protectedPage) {
      document.documentElement.classList.add('invisible');
      verify();
    }
  });
  window.SinstockSession = {
    ready,
    accept,
    clear,
    get user() {
      return profile;
    },
    async logout() {
      try {
        await SinstockAPI.request('/auth/logout', { method: 'POST' });
      } catch {
        /* Always remove the local session, even while offline. */
      } finally {
        login();
      }
    },
  };
})();
