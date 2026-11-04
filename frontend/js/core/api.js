(() => {
  'use strict';
  class ApiError extends Error {
    constructor(message, status = 0) {
      super(message);
      this.status = status;
    }
  }
  async function request(
    endpoint,
    { method = 'GET', body, auth = true, token, signal } = {},
  ) {
    const credential =
      token ?? (auth ? sessionStorage.getItem('sinstock.access') : null);
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (credential) headers.Authorization = `Bearer ${credential}`;
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(cancel, 15000);
    try {
      const response = await fetch(SinstockConfig.apiBaseUrl + endpoint, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
      });
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new ApiError(
          'O servidor retornou uma resposta inesperada.',
          response.status,
        );
      }
      if (!response.ok) {
        if (response.status === 401 && auth && !token)
          window.dispatchEvent(new Event('sinstock:unauthorized'));
        const message = Array.isArray(data?.message)
          ? data.message.join(' ')
          : data?.message;
        throw new ApiError(
          response.status === 429
            ? 'Muitas tentativas. Aguarde um minuto e tente novamente.'
            : message || 'Não foi possível concluir a solicitação.',
          response.status,
        );
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.name === 'AbortError'
          ? 'A solicitação demorou demais. Tente novamente.'
          : 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      );
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  }
  window.SinstockAPI = { request, ApiError };
})();
