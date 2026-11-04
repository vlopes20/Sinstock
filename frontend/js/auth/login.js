document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');
  const button = form.querySelector('[type="submit"]');
  const password = document.getElementById('senha');
  const email = document.getElementById('usuario');
  document
    .getElementById('togglePassword')
    .addEventListener('click', (event) => {
      password.type = password.type === 'password' ? 'text' : 'password';
      event.currentTarget.setAttribute(
        'aria-label',
        password.type === 'password' ? 'Mostrar senha' : 'Ocultar senha',
      );
    });
  if (new URLSearchParams(location.search).get('reason') === 'expired')
    message.textContent = 'Sua sessão expirou. Entre novamente.';
  let pending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    pending = true;
    button.disabled = true;
    button.textContent = 'Entrando…';
    message.textContent = '';
    message.classList.remove('text-red-600');
    try {
      SinstockSession.clear();
      const result = await SinstockAPI.request('/auth/login', {
        method: 'POST',
        auth: false,
        body: {
          email: email.value.trim().toLowerCase(),
          senha: password.value,
        },
      });
      if (result.mfaRequired) {
        if (!result.preAuthToken)
          throw new Error(
            'Não foi possível iniciar a autenticação em duas etapas.',
          );
        sessionStorage.setItem('sinstock.preAuth', result.preAuthToken);
        location.assign(SinstockConfig.url('pages/codigo.html'));
      } else {
        SinstockSession.accept(result);
        location.assign(SinstockConfig.url('pages/dashboard.html'));
      }
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('text-red-600');
    } finally {
      pending = false;
      button.disabled = false;
      button.textContent = 'Entrar';
    }
  });
});
