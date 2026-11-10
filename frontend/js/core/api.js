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
    {
      method = 'GET',
      body,
      auth = true,
      token,
      signal,
      responseType = 'json',
    } = {},
  ) {
    const credential =
      token ?? (auth ? sessionStorage.getItem('sinstock.access') : null);
    const multipart = body instanceof FormData;
    const headers = {
      Accept: responseType === 'blob' ? '*/*' : 'application/json',
    };
    if (body !== undefined && !multipart)
      headers['Content-Type'] = 'application/json';
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
        body:
          body === undefined
            ? undefined
            : multipart
              ? body
              : JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
      });
      if (response.ok && responseType === 'blob')
        return {
          blob: await response.blob(),
          contentDisposition: response.headers.get('Content-Disposition'),
        };
      if (response.status === 401 && auth && !token)
        window.dispatchEvent(new Event('sinstock:unauthorized'));
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
  async function subscribe(
    endpoint,
    receive,
    { signal, onState = () => {} } = {},
  ) {
    while (!signal?.aborted) {
      try {
        const response = await fetch(SinstockConfig.apiBaseUrl + endpoint, {
          headers: {
            Accept: 'text/event-stream',
            Authorization:
              'Bearer ' + sessionStorage.getItem('sinstock.access'),
          },
          signal,
          cache: 'no-store',
          credentials: 'omit',
        });
        if (response.status === 401) {
          window.dispatchEvent(new Event('sinstock:unauthorized'));
          return;
        }
        if (response.status === 403) {
          onState('Acesso às atualizações não autorizado.');
          return;
        }
        if (!response.ok || !response.body) throw new Error('Disconnected');
        onState('Conectado: atualizações automáticas.');
        const reader = response.body.getReader(),
          decoder = new TextDecoder();
        let buffer = '';
        try {
          while (!signal?.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder
              .decode(value, { stream: true })
              .replace(/\r\n/g, '\n');
            let boundary;
            while ((boundary = buffer.indexOf('\n\n')) >= 0) {
              const frame = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);
              const data = frame
                .split('\n')
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trim())
                .join('\n');
              if (data) receive(JSON.parse(data));
            }
          }
        } finally {
          await reader.cancel().catch(() => {});
          reader.releaseLock();
        }
      } catch {
        if (signal?.aborted) return;
      }
      if (signal?.aborted) return;
      onState('Reconectando atualizações...');
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', stop);
          resolve();
        }, 3000);
        function stop() {
          clearTimeout(timer);
          resolve();
        }
        signal?.addEventListener('abort', stop, { once: true });
      });
    }
  }
  window.SinstockAPI = { request, subscribe, ApiError };
})();
