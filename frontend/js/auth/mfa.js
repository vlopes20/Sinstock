document.addEventListener('DOMContentLoaded', () => {
  let token = sessionStorage.getItem('sinstock.preAuth');
  if (!token) {
    location.replace(SinstockConfig.url('index.html'));
    return;
  }
  const inputs = [...document.querySelectorAll('.otp-input')];
  const form = document.getElementById('codeForm');
  const error = document.getElementById('codeError');
  const submit = form.querySelector('[type="submit"]');
  const emailMethod = sessionStorage.getItem('sinstock.mfaMethod') === 'EMAIL';
  const instruction = document.querySelector('.auth-content p, main p');
  if (instruction)
    instruction.textContent = emailMethod
      ? 'Digite o código de seis dígitos enviado ao seu e-mail. Ele vale por cinco minutos.'
      : 'Digite o código de seis dígitos do seu aplicativo autenticador.';
  if (emailMethod) {
    const resend = document.createElement('button');
    resend.type = 'button';
    resend.textContent = 'Reenviar código';
    resend.className = 'mt-4 text-sm underline';
    form.append(resend);
    resend.onclick = async () => {
      resend.disabled = true;
      error.textContent = '';
      try {
        const result = await SinstockAPI.request('/auth/2fa/email/resend', {
          method: 'POST',
          auth: false,
          token,
        });
        token = result.preAuthToken;
        sessionStorage.setItem('sinstock.preAuth', token);
        error.textContent =
          'Novo código enviado. Confira sua caixa de entrada e o spam.';
      } catch (err) {
        error.textContent = err.message;
      } finally {
        resend.disabled = false;
      }
    };
  }
  let pending = false;
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(-1);
      if (input.value && index < 5) inputs[index + 1].focus();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && index)
        inputs[index - 1].focus();
    });
    input.addEventListener('paste', (event) => {
      const code = event.clipboardData.getData('text').trim();
      if (!/^\d{6}$/.test(code)) return;
      event.preventDefault();
      inputs.forEach((field, i) => {
        field.value = code[i];
      });
      inputs[5].focus();
    });
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    const codigo = inputs.map((input) => input.value).join('');
    if (!/^\d{6}$/.test(codigo)) {
      error.textContent = 'Informe os seis dígitos.';
      return;
    }
    pending = true;
    submit.disabled = true;
    error.textContent = '';
    try {
      const result = await SinstockAPI.request('/auth/2fa/authenticate', {
        method: 'POST',
        auth: false,
        token,
        body: { codigo },
      });
      SinstockSession.accept(result);
      location.assign(SinstockConfig.url('pages/dashboard.html'));
    } catch (err) {
      error.textContent = `${err.message} Se a autenticação expirou, volte ao login.`;
    } finally {
      pending = false;
      submit.disabled = false;
    }
  });
});
