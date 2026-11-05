document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('form');
  if (!form) return;
  const message = document.createElement('p');
  message.id = 'formMessage';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.className = 'mt-4 text-sm text-gray-700';
  form.append(message);
  const submit = form.querySelector('[type="submit"]');
  let pending = false;
  // Tokens are carried in the fragment, then removed from browser history.
  const resetToken = new URLSearchParams(location.hash.slice(1)).get('token');
  if (form.id === 'resetPasswordForm') {
    history.replaceState(null, '', location.pathname);
    if (!resetToken || !/^[a-f0-9]{64}$/.test(resetToken)) {
      submit.disabled = true;
      message.textContent =
        'Abra o link recebido por e-mail para redefinir sua senha.';
    }
  }
  if (form.id === 'cadastroForm') {
    submit.disabled = true;
    if (!(await SinstockSession.ready)) return;
    try {
      const profiles = await SinstockAPI.request('/perfis');
      const select = document.getElementById('perfil_id');
      profiles.forEach((profile) => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.nome;
        select.append(option);
      });
      submit.disabled = false;
    } catch (err) {
      message.textContent = err.message;
    }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || submit.disabled || !form.reportValidity()) return;
    pending = true;
    submit.disabled = true;
    message.classList.remove('text-red-600');
    message.textContent = 'Aguarde…';
    try {
      if (form.id === 'forgotForm') {
        await SinstockAPI.request('/auth/forgot-password', {
          method: 'POST',
          auth: false,
          body: { email: form.email.value.trim().toLowerCase() },
        });
        location.assign(SinstockConfig.url('pages/autenticacao.html'));
      } else if (form.id === 'resetPasswordForm') {
        const senha = document.getElementById('novaSenha').value;
        if (senha !== document.getElementById('confirmarSenha').value)
          throw new Error('As senhas não coincidem.');
        const result = await SinstockAPI.request('/auth/reset-password', {
          method: 'POST',
          auth: false,
          body: { token: resetToken, senha },
        });
        SinstockSession.clear();
        form.reset();
        message.textContent = result.message;
        submit.hidden = true;
        const link = document.createElement('a');
        link.href = SinstockConfig.url('index.html');
        link.textContent = 'Entrar com a nova senha';
        link.className = 'block mt-4 text-orange-600 underline';
        form.append(link);
      } else if (form.id === 'cadastroForm') {
        await SinstockAPI.request('/users', {
          method: 'POST',
          body: {
            nome: form.nome.value.trim(),
            email: form.email.value.trim().toLowerCase(),
            senha: form.senha.value,
            perfil_id: Number(document.getElementById('perfil_id').value),
            telefone:
              document.getElementById('telefone').value.trim() || undefined,
          },
        });
        form.reset();
        message.textContent =
          'Usuário cadastrado. Ele já pode entrar com o e-mail e a senha informados.';
      }
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('text-red-600');
    } finally {
      pending = false;
      submit.disabled = false;
    }
  });
});
