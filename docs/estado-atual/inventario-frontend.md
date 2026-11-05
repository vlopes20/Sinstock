# Inventário do frontend

Catálogo estático de páginas, funções nomeadas e listeners em 05/11/2026. Callbacks anônimos são localizados pelo listener e linha no JSON complementar.

| Página | Proteção | Abas | Scripts próprios |
|---|---|---|---|
| [frontend/index.html](../../frontend/index.html) | public | — | `./js/core/config.js`, `./js/core/api.js`, `./js/auth/session.js`, `./js/auth/login.js` |
| [frontend/pages/ajuda.html](../../frontend/pages/ajuda.html) | user | helpCenter, tickets, contact | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/pages/ajuda.js`, `../js/shared/layout.js` |
| [frontend/pages/autenticacao.html](../../frontend/pages/autenticacao.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js` |
| [frontend/pages/cadastro.html](../../frontend/pages/cadastro.html) | admin | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/forms.js` |
| [frontend/pages/codigo.html](../../frontend/pages/codigo.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/mfa.js` |
| [frontend/pages/configuracoes.html](../../frontend/pages/configuracoes.html) | user | generalSettings, usersSettings, stockSettings, securitySettings, systemSettings | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/pages/configuracoes.js`, `../js/shared/layout.js` |
| [frontend/pages/dashboard.html](../../frontend/pages/dashboard.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/shared/layout.js`, `../js/pages/dashboard.js` |
| [frontend/pages/esquecisenha.html](../../frontend/pages/esquecisenha.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/forms.js` |
| [frontend/pages/estoque.html](../../frontend/pages/estoque.html) | user | inventory, movements, receipts | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/shared/scanner.js`, `../js/shared/catalogs.js`, `../js/pages/estoque.js`, `../js/shared/layout.js` |
| [frontend/pages/fornecedores.html](../../frontend/pages/fornecedores.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/shared/catalogs.js`, `../js/pages/fornecedores.js`, `../js/shared/layout.js` |
| [frontend/pages/login.html](../../frontend/pages/login.html) | public | — |  |
| [frontend/pages/pedidos.html](../../frontend/pages/pedidos.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/scanner.js`, `../js/shared/layout.js`, `../js/shared/catalogs.js`, `../js/services/commerce.js`, `../js/pages/pedidos.js`, `../js/shared/ui.js`, `../js/shared/connected.js` |
| [frontend/pages/produtos.html](../../frontend/pages/produtos.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/shared/scanner.js`, `../js/shared/catalogs.js`, `../js/pages/produtos.js`, `../js/shared/layout.js` |
| [frontend/pages/redefinirsenha.html](../../frontend/pages/redefinirsenha.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/forms.js` |
| [frontend/pages/relatorios.html](../../frontend/pages/relatorios.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/pages/relatorios.js`, `../js/shared/layout.js` |
| [frontend/pages/vendas.html](../../frontend/pages/vendas.html) | user | salesOverview, salesHistory | `../js/core/config.js`, `../js/core/api.js`, `../js/services/data.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/connected.js`, `../js/shared/scanner.js`, `../js/shared/layout.js`, `../js/services/commerce.js`, `../js/pages/vendas.js` |

## frontend/js/auth/forms.js

Fonte: [frontend/js/auth/forms.js](../../frontend/js/auth/forms.js). 97 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 1 |
| `form` | 'submit' | 39 |

**Chamadas HTTP/armazenamento explícitas:** `SinstockAPI.request` (26); `SinstockAPI.request` (48); `SinstockAPI.request` (58); `SinstockAPI.request` (73).

## frontend/js/auth/login.js

Fonte: [frontend/js/auth/login.js](../../frontend/js/auth/login.js). 59 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 1 |
| `document .getElementById('togglePassword')` | 'click' | 7 |
| `form` | 'submit' | 19 |

**Chamadas HTTP/armazenamento explícitas:** `SinstockAPI.request` (29); `sessionStorage.setItem` (42); `sessionStorage.setItem` (43).

## frontend/js/auth/mfa.js

Fonte: [frontend/js/auth/mfa.js](../../frontend/js/auth/mfa.js). 91 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 1 |
| `input` | 'input' | 45 |
| `input` | 'keydown' | 49 |
| `input` | 'paste' | 53 |
| `form` | 'submit' | 63 |

**Chamadas HTTP/armazenamento explícitas:** `sessionStorage.getItem` (2); `sessionStorage.getItem` (11); `SinstockAPI.request` (27); `sessionStorage.setItem` (33); `SinstockAPI.request` (75).

## frontend/js/auth/session.js

Fonte: [frontend/js/auth/session.js](../../frontend/js/auth/session.js). 158 linhas.

**Funções nomeadas:** `clear` (linha 6); `login` (linha 15); `accept` (linha 22); `renderUser` (linha 29); `verify` (linha 67); `logout` (linha 147).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `logout` | 'click' | 62 |
| `retry` | 'click' | 96 |
| `window` | 'sinstock:unauthorized' | 106 |
| `document` | 'DOMContentLoaded' | 108 |
| `document` | event | 116 |
| `window` | 'pageshow' | 134 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const protectedPage =
    document.documentElement.hasAttribute('data-auth-required');
  let profile = null;
  const clear = () => {
    ['sinstock.access', 'sinstock.preAuth', 'sinstock.mfaMethod'].forEach(
      (key) => sessionStorage.removeItem(key),
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
  let lastActivity = Date.now();
  ['pointerdown', 'keydown', 'scroll'].forEach((event) =>
    document.addEventListener(
      event,
      () => {
        lastActivity = Date.now();
      },
      { passive: true },
    ),
  );
  if (protectedPage)
    setInterval(() => {
      if (
        profile &&
        profile.preferencias?.logout_inativo !== false &&
        Date.now() - lastActivity >= 15 * 60000
      )
        window.SinstockSession.logout();
    }, 30000);
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
})` (1); `sessionStorage.removeItem` (8); `localStorage.removeItem` (11); `sessionStorage.setItem` (26); `sessionStorage.getItem` (68); `SinstockAPI.request` (73); `sessionStorage.getItem` (133); `SinstockAPI.request` (149).

## frontend/js/core/api.js

Fonte: [frontend/js/core/api.js](../../frontend/js/core/api.js). 162 linhas.

**Funções nomeadas:** `request` (linha 9); `cancel` (linha 30); `subscribe` (linha 89); `stop` (linha 152).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `signal` | 'abort' | 31 |
| `signal` | 'abort' | 156 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
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
})` (1); `sessionStorage.getItem` (21); `fetch` (35); `fetch` (96); `sessionStorage.getItem` (100).

## frontend/js/core/config.js

Fonte: [frontend/js/core/config.js](../../frontend/js/core/config.js). 17 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/ajuda.js

Fonte: [frontend/js/pages/ajuda.js](../../frontend/js/pages/ajuda.js). 361 linhas.

**Funções nomeadas:** `$` (linha 4); `faq` (linha 26); `tickets` (linha 48); `upload` (linha 87); `create` (linha 98); `editFaq` (linha 171); `conversation` (linha 217); `render` (linha 234).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `$('helpSearch')` | 'input' | 158 |
| `$('ticketSearch')` | 'input' | 166 |
| `overlay` | 'click' | 306 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id),
    statusNames = {
      ABERTO: 'Aberto',
      EM_ANDAMENTO: 'Em andamento',
      RESOLVIDO: 'Resolvido',
      FECHADO: 'Fechado',
      CANCELADO: 'Cancelado',
    };
  let user,
    faqs = [],
    page = 1,
    sequence = 0;
  document.querySelectorAll('.help-tab').forEach(
    (tab) =>
      (tab.onclick = () => {
        document
          .querySelectorAll('.help-tab,.help-tab-content')
          .forEach((node) => node.classList.remove('active'));
        tab.classList.add('active');
        $(tab.dataset.tab).classList.add('active');
      }),
  );
  async function faq() {
    faqs = await D.get('/chamados/faq', { busca: $('helpSearch').value });
    $('faqList').innerHTML =
      faqs
        .map(
          (item) =>
            '<details class="live-faq"><summary>' +
            D.text(item.pergunta) +
            '</summary><p>' +
            D.text(item.resposta) +
            '</p>' +
            (user.perfil_id === 1
              ? '<div class="catalog-actions"><button type="button" data-faq="' +
                item.id +
                '">Editar</button><button type="button" data-delete-faq="' +
                item.id +
                '">Desativar</button></div>'
              : '') +
            '</details>',
        )
        .join('') || '<p>Nenhuma orientação encontrada.</p>';
  }
  async function tickets(pagina = page) {
    const callId = ++sequence;
    page = pagina;
    try {
      const result = await D.get('/chamados', {
        pagina,
        limite: D.pageSize(),
        busca: $('ticketSearch').value,
        status: $('ticketStatusFilter').value,
      });
      if (callId !== sequence) return;
      $('ticketsTableBody').innerHTML = result.dados
        .map(
          (item) =>
            '<tr><td>' +
            D.text(item.codigo) +
            '</td><td>' +
            D.text(item.assunto) +
            '</td><td>' +
            D.text(item.usuarios?.nome || '—') +
            '</td><td>' +
            D.text(item.prioridade) +
            '</td><td>' +
            D.text(statusNames[item.status]) +
            '</td><td>' +
            D.text(new Date(item.data_abertura).toLocaleString('pt-BR')) +
            '</td><td><button type="button" data-ticket="' +
            item.id +
            '">Ver conversa</button></td></tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message($('ticketsTableBody'), 'Nenhum chamado encontrado.', 7);
      D.paginate($('ticketPagination'), result, tickets);
    } catch (error) {
      if (callId === sequence)
        D.message($('ticketsTableBody'), error.message, 7);
    }
  }
  async function upload(id, file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      throw new Error('O anexo deve ter até 2 MB.');
    const body = new FormData();
    body.append('arquivo', file);
    return SinstockAPI.request('/chamados/' + id + '/anexos', {
      method: 'POST',
      body,
    });
  }
  function create() {
    const requestId = crypto.randomUUID();
    let created;
    const overlay = D.dialog(
      'Novo chamado',
      '<form id="ticketForm"><label>Assunto *<input id="ticketSubject" name="titulo" required maxlength="150"></label>' +
        '<label>Categoria<select id="ticketCategory" name="categoria"><option>Estoque</option><option>Login e conta</option><option>Vendas</option><option>Fornecedores</option><option>Relatórios</option><option>Outros</option></select></label>' +
        '<label>Prioridade<select id="ticketPriority" name="prioridade"><option value="BAIXA">Baixa</option><option value="MEDIA" selected>Média</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></label>' +
        '<label>Descrição *<textarea id="ticketDescription" name="descricao" required maxlength="10000" rows="5"></textarea></label>' +
        '<label>Tela relacionada<input id="ticketPage" name="pagina" maxlength="100"></label><label>Anexo (PNG, JPEG ou PDF, até 2 MB)<input id="ticketAttachment" name="arquivo" type="file" accept=".png,.jpg,.jpeg,.pdf"></label>' +
        '<button type="submit">Registrar chamado</button></form>',
    );
    overlay.id = 'ticketModal';
    const form = overlay.querySelector('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const file = form.elements.arquivo.files[0];
        if (file && file.size > 2 * 1024 * 1024)
          throw new Error('O anexo deve ter até 2 MB.');
        if (!created) {
          created = await SinstockAPI.request('/chamados', {
            method: 'POST',
            body: {
              request_id: requestId,
              titulo: form.elements.titulo.value.trim(),
              categoria: form.elements.categoria.value,
              prioridade: form.elements.prioridade.value,
              descricao: form.elements.descricao.value.trim(),
              pagina: form.elements.pagina.value,
            },
          });
          ['titulo', 'descricao', 'categoria', 'prioridade', 'pagina'].forEach(
            (name) => {
              form.elements[name].disabled = true;
            },
          );
        }
        try {
          await upload(created.id, file);
        } catch (error) {
          throw new Error(
            'Chamado ' +
              created.codigo +
              ' registrado. O anexo falhou: ' +
              error.message +
              ' Tente anexar novamente ou remova o arquivo.',
          );
        }
        overlay.remove();
        await tickets();
        SinstockUI.notify(
          created.email_enviado
            ? 'Chamado registrado; confirmação enviada por e-mail.'
            : 'Chamado registrado. A confirmação por e-mail está indisponível.',
        );
      });
    };
  }
  $('openTicketModal').onclick = $('openTicketFromHelp').onclick = create;
  $('helpSearch').addEventListener(
    'input',
    D.debounce(() =>
      faq().catch((error) => {
        $('helpError').textContent = error.message;
      }),
    ),
  );
  $('ticketSearch').addEventListener(
    'input',
    D.debounce(() => tickets(1)),
  );
  $('ticketStatusFilter').onchange = () => tickets(1);
  function editFaq(id) {
    const item = faqs.find((row) => row.id === id);
    const overlay = D.dialog(
      item ? 'Editar orientação' : 'Nova orientação',
      '<form><label>Pergunta *<input name="pergunta" maxlength="255" required></label><label>Resposta *<textarea name="resposta" maxlength="20000" rows="6" required></textarea></label><label>Ordem<input name="ordem" type="number" min="0" value="0"></label><button type="submit">Salvar orientação</button></form>',
    );
    const form = overlay.querySelector('form');
    if (item)
      ['pergunta', 'resposta', 'ordem'].forEach((name) => {
        form.elements[name].value = item[name] || '';
      });
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        await SinstockAPI.request(
          '/chamados/faq' + (item ? '/' + item.id : ''),
          {
            method: item ? 'PATCH' : 'POST',
            body: {
              pergunta: form.elements.pergunta.value,
              resposta: form.elements.resposta.value,
              ordem: Number(form.elements.ordem.value),
            },
          },
        );
        overlay.remove();
        await faq();
      });
    };
  }
  $('newFaq').onclick = () => editFaq();
  $('faqList').onclick = async (event) => {
    const edit = event.target.closest('[data-faq]'),
      remove = event.target.closest('[data-delete-faq]');
    if (edit) editFaq(Number(edit.dataset.faq));
    if (remove && confirm('Desativar esta orientação?')) {
      try {
        await SinstockAPI.request('/chamados/faq/' + remove.dataset.deleteFaq, {
          method: 'DELETE',
        });
        await faq();
      } catch (error) {
        SinstockUI.notify(error.message);
      }
    }
  };
  async function conversation(id) {
    const ticket = await D.get('/chamados/' + id);
    const closed = ['FECHADO', 'CANCELADO'].includes(ticket.status);
    const overlay = D.dialog(
      ticket.codigo,
      '<h3>' +
        D.text(ticket.assunto) +
        '</h3><p class="support-text">' +
        D.text(ticket.descricao) +
        '</p><p>Status: ' +
        D.text(statusNames[ticket.status]) +
        '</p><div class="support-messages"></div><div class="support-attachments"></div>' +
        (!closed
          ? '<form id="replyForm"><label>Mensagem *<textarea name="mensagem" maxlength="5000" required></textarea></label><label>Anexo (até 2 MB)<input name="arquivo" type="file" accept=".png,.jpg,.jpeg,.pdf"></label><button type="submit">Enviar mensagem</button></form>'
          : '<p>Chamado encerrado.</p>') +
        '<form id="ticketStatusForm"><label>Status<select name="status"></select></label><button type="submit">Atualizar status</button></form>',
    );
    function render(data) {
      overlay.querySelector('.support-messages').innerHTML =
        '<h3>Conversa</h3>' +
        data.mensagens
          .map(
            (message) =>
              '<article><strong>' +
              D.text(message.autor.nome) +
              '</strong><small> · ' +
              D.text(new Date(message.criado_em).toLocaleString('pt-BR')) +
              '</small><p class="support-text">' +
              D.text(message.mensagem) +
              '</p></article>',
          )
          .join('') +
        (data.mensagens.length ? '' : '<p>Sem mensagens adicionais.</p>');
      overlay.querySelector('.support-attachments').innerHTML =
        '<h3>Anexos</h3>' +
          data.anexos
            .map(
              (file) =>
                '<button type="button" data-attachment="' +
                file.id +
                '" data-filename="' +
                D.text(file.nome) +
                '">' +
                D.text(file.nome) +
                '</button>',
            )
            .join('') || '';
    }
    render(ticket);
    const statusForm = overlay.querySelector('#ticketStatusForm'),
      reply = overlay.querySelector('#replyForm');
    const allowed =
      user.perfil_id === 1
        ? Object.entries(statusNames)
        : [
            ['FECHADO', 'Fechado'],
            ['CANCELADO', 'Cancelado'],
          ];
    statusForm.elements.status.replaceChildren(
      ...allowed.map(([key, label]) => new Option(label, key)),
    );
    if (user.perfil_id === 1) statusForm.elements.status.value = ticket.status;
    statusForm.onsubmit = (event) => {
      event.preventDefault();
      D.saving(statusForm, async () => {
        await SinstockAPI.request('/chamados/' + id + '/status', {
          method: 'PATCH',
          body: { status: statusForm.elements.status.value },
        });
        overlay.remove();
        await tickets();
      });
    };
    if (reply)
      reply.onsubmit = (event) => {
        event.preventDefault();
        D.saving(reply, async () => {
          const file = reply.elements.arquivo.files[0];
          if (file?.size > 2 * 1024 * 1024)
            throw new Error('O anexo deve ter até 2 MB.');
          await upload(id, file);
          await SinstockAPI.request('/chamados/' + id + '/mensagens', {
            method: 'POST',
            body: { mensagem: reply.elements.mensagem.value },
          });
          reply.reset();
          render(await D.get('/chamados/' + id));
        });
      };
    overlay.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-attachment]');
      if (!button) return;
      button.disabled = true;
      try {
        const result = await SinstockAPI.request(
          '/chamados/anexos/' + button.dataset.attachment,
          { responseType: 'blob' },
        );
        const url = URL.createObjectURL(result.blob),
          anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = button.dataset.filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        SinstockUI.notify(error.message);
      } finally {
        button.disabled = false;
      }
    });
    const interval = setInterval(async () => {
      if (!overlay.isConnected || !overlay.classList.contains('active')) {
        clearInterval(interval);
        return;
      }
      try {
        render(await D.get('/chamados/' + id));
      } catch {
        /* Explicit sends show errors; polling can wait for connectivity. */
      }
    }, 10000);
  }
  $('ticketsTableBody').onclick = (event) => {
    const button = event.target.closest('[data-ticket]');
    if (button)
      conversation(Number(button.dataset.ticket)).catch((error) =>
        SinstockUI.notify(error.message),
      );
  };
  SinstockSession.ready
    .then(async (current) => {
      if (!current) return;
      user = current;
      const settings = await D.get('/configuracoes/publicas');
      const email = settings.email_suporte || settings.empresa.email;
      $('supportContact').innerHTML = email
        ? '<a href="mailto:' + D.text(email) + '">' + D.text(email) + '</a>'
        : '<p>Use os chamados para falar com a administração.</p>';
      await Promise.all([faq(), tickets()]);
    })
    .catch((error) => {
      $('helpError').textContent = error.message;
    });
})` (1); `SinstockAPI.request` (93); `SinstockAPI.request` (119); `SinstockAPI.request` (185); `SinstockAPI.request` (208); `SinstockAPI.request` (282); `SinstockAPI.request` (298); `SinstockAPI.request` (311).

**Controles criados em templates:** `ticketForm`, `ticketSubject`, `ticketCategory`, `ticketPriority`, `ticketDescription`, `ticketPage`, `ticketAttachment`, `replyForm`, `ticketStatusForm`.

## frontend/js/pages/configuracoes.js

Fonte: [frontend/js/pages/configuracoes.js](../../frontend/js/pages/configuracoes.js). 456 linhas.

**Funções nomeadas:** `$` (linha 4); `reauthenticate` (linha 45); `bind` (linha 49); `savePreferences` (linha 77); `listUsers` (linha 109); `editUser` (linha 138); `permissions` (linha 203); `codeForm` (linha 299).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  let user,
    profiles = [],
    users = [],
    settings,
    preferences;
  const companyFields = {
    nome: 'companyName',
    cnpj: 'companyCnpj',
    email: 'companyEmail',
    telefone: 'companyPhone',
    endereco: 'companyAddress',
    cidade: 'companyCity',
    estado: 'companyState',
  };
  const resources = {
    dashboard: 'Dashboard',
    produtos: 'Produtos',
    categorias: 'Categorias',
    fornecedores: 'Fornecedores',
    filiais: 'Filiais',
    clientes: 'Clientes',
    'saldos-estoque': 'Saldos',
    movimentacoes: 'Movimentações',
    'notas-fiscais-entrada': 'Recebimentos',
    pedidos: 'Vendas e pedidos',
    relatorios: 'Relatórios',
    notificacoes: 'Notificações',
    chamados: 'Suporte',
    'busca-global': 'Busca global',
  };
  document.querySelectorAll('.settings-tab').forEach(
    (tab) =>
      (tab.onclick = () => {
        document
          .querySelectorAll('.settings-tab,.settings-content')
          .forEach((node) => node.classList.remove('active'));
        tab.classList.add('active');
        $(tab.dataset.tab).classList.add('active');
      }),
  );
  async function reauthenticate() {
    SinstockSession.clear();
    location.assign(SinstockConfig.url('index.html'));
  }
  function bind(id, work) {
    $(id).onsubmit = (event) => {
      event.preventDefault();
      D.saving($(id), work);
    };
  }
  bind('companyForm', async () => {
    const body = {};
    Object.entries(companyFields).forEach(([key, id]) => {
      body[key] = $(id).value.trim() || null;
    });
    await SinstockAPI.request('/configuracoes/empresa', {
      method: 'PATCH',
      body,
    });
    SinstockUI.notify('Dados da empresa salvos.');
  });
  bind('stockSettingsForm', async () => {
    await SinstockAPI.request('/configuracoes/estoque', {
      method: 'PATCH',
      body: {
        dias_validade: Number($('expirationDays').value),
        estoque_minimo_padrao: Number($('defaultMinimumStock').value),
        bloquear_negativo: true,
      },
    });
    SinstockUI.notify('Padrões de estoque salvos.');
  });
  async function savePreferences(body) {
    preferences = await SinstockAPI.request('/configuracoes/preferencias', {
      method: 'PATCH',
      body,
    });
    user.preferencias = preferences;
    SinstockUI.notify('Preferências salvas.');
  }
  bind('notificationPreferences', () =>
    savePreferences({
      notificar_estoque: $('lowStockAlert').checked,
      notificar_validade: $('expirationAlert').checked,
    }),
  );
  bind('systemForm', () =>
    savePreferences({
      itens_por_pagina: Number($('itemsPerPage').value),
      logout_inativo: $('automaticLogout').checked,
    }),
  );
  bind('passwordForm', async () => {
    if ($('newPassword').value !== $('confirmPassword').value)
      throw new Error('A confirmação da senha não confere.');
    await SinstockAPI.request('/auth/password', {
      method: 'PATCH',
      body: {
        senha_atual: $('currentPassword').value,
        nova_senha: $('newPassword').value,
      },
    });
    await reauthenticate();
  });
  async function listUsers() {
    users = await D.get('/users');
    $('usersTableBody').innerHTML = users
      .map(
        (item) =>
          '<tr><td>' +
          D.text(item.nome) +
          '</td><td>' +
          D.text(item.email) +
          '</td><td>' +
          D.text(item.perfis.nome) +
          '</td><td>' +
          (item.ativo ? 'Ativo' : 'Inativo') +
          '</td><td>' +
          D.text(
            item.ultimo_acesso
              ? new Date(item.ultimo_acesso).toLocaleString('pt-BR')
              : 'Sem acesso registrado',
          ) +
          '</td><td><div class="catalog-actions"><button type="button" data-edit-user="' +
          item.id +
          '">Editar</button><button type="button" data-toggle-user="' +
          item.id +
          '">' +
          (item.ativo ? 'Desativar' : 'Ativar') +
          '</button></div></td></tr>',
      )
      .join('');
  }
  function editUser(id) {
    const item = users.find((row) => row.id === id);
    const overlay = D.dialog(
      item ? 'Editar usuário' : 'Novo usuário',
      '<form id="userForm">' +
        '<label>Nome *<input name="nome" maxlength="100" required></label><label>E-mail *<input name="email" type="email" maxlength="100" required></label>' +
        '<label>Telefone<input name="telefone" type="tel" maxlength="20"></label><label>Perfil *<select name="perfil" required></select></label>' +
        '<label>' +
        (item ? 'Nova senha (deixe em branco para manter)' : 'Senha *') +
        '<input name="senha" type="password" minlength="8" maxlength="72" autocomplete="new-password"' +
        (item ? '' : ' required') +
        '></label><button type="submit">Salvar usuário</button></form>',
    );
    overlay.id = 'userModal';
    const form = overlay.querySelector('form');
    D.options(form.elements.perfil, profiles, (row) => row.nome);
    if (item) {
      ['nome', 'email', 'telefone'].forEach((name) => {
        form.elements[name].value = item[name] || '';
      });
      form.elements.perfil.value = item.perfil_id;
    }
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const body = {
          nome: form.elements.nome.value.trim(),
          email: form.elements.email.value.trim(),
          telefone: form.elements.telefone.value.trim(),
          perfil_id: Number(form.elements.perfil.value),
        };
        if (form.elements.senha.value) body.senha = form.elements.senha.value;
        await SinstockAPI.request('/users' + (item ? '/' + item.id : ''), {
          method: item ? 'PATCH' : 'POST',
          body,
        });
        overlay.remove();
        if (item?.id === user.id) {
          await reauthenticate();
          return;
        }
        await listUsers();
        SinstockUI.notify('Usuário salvo.');
      });
    };
  }
  $('openUserModal').onclick = () => editUser();
  $('usersTableBody').onclick = async (event) => {
    const edit = event.target.closest('[data-edit-user]'),
      toggle = event.target.closest('[data-toggle-user]');
    if (edit) editUser(Number(edit.dataset.editUser));
    if (toggle && confirm('Alterar o status deste usuário?')) {
      toggle.disabled = true;
      try {
        await SinstockAPI.request(
          '/users/' + toggle.dataset.toggleUser + '/status',
          { method: 'PATCH' },
        );
        await listUsers();
      } catch (error) {
        toggle.disabled = false;
        SinstockUI.notify(error.message);
      }
    }
  };
  function permissions() {
    const profile = profiles.find(
      (row) => row.id === Number($('permissionProfile').value),
    );
    if (!profile) return;
    let perms = profile.permissoes;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch {
        perms = {};
      }
    }
    $('permissionRows').innerHTML = Object.entries(resources)
      .map(
        ([key, label]) =>
          '<tr><td>' +
          label +
          '</td>' +
          ['ler', 'criar', 'editar', 'excluir']
            .map((action) => {
              const blocked =
                key === 'filiais' && action !== 'ler' && profile.id !== 1;
              const allowed =
                profile.id === 1 ||
                (!blocked &&
                  (perms?.[key] === true ||
                    perms?.[key]?.[action] === true ||
                    (perms?.[key] === undefined && perms?.operacoes === true)));
              return (
                '<td><input type="checkbox" data-resource="' +
                key +
                '" data-action="' +
                action +
                '" aria-label="' +
                label +
                ': ' +
                action +
                '"' +
                (allowed ? ' checked' : '') +
                (profile.id === 1 || blocked ? ' disabled' : '') +
                '></td>'
              );
            })
            .join('') +
          '</tr>',
      )
      .join('');
    $('permissionsForm').querySelector('[type="submit"]').disabled =
      profile.id === 1;
  }
  $('permissionProfile').onchange = permissions;
  const newProfile = document.createElement('button');
  newProfile.type = 'button';
  newProfile.textContent = 'Novo perfil';
  $('permissionProfile').after(newProfile);
  newProfile.onclick = () => {
    const overlay = D.dialog(
      'Novo perfil',
      '<form><label>Nome do perfil *<input name="nome" required maxlength="50"></label><p>Após criar, configure as permissões deste perfil.</p><button type="submit">Criar perfil</button></form>',
    );
    const form = overlay.querySelector('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const profile = await SinstockAPI.request('/perfis', {
          method: 'POST',
          body: { nome: form.elements.nome.value, permissoes: {} },
        });
        profiles.push(profile);
        D.options($('permissionProfile'), profiles, (row) => row.nome);
        $('permissionProfile').value = profile.id;
        permissions();
        overlay.remove();
      });
    };
  };
  bind('permissionsForm', async () => {
    const profile = profiles.find(
        (row) => row.id === Number($('permissionProfile').value),
      ),
      perms = {};
    $('permissionRows')
      .querySelectorAll('input')
      .forEach((input) => {
        (perms[input.dataset.resource] ||= {})[input.dataset.action] =
          input.checked;
      });
    const updated = await SinstockAPI.request('/perfis/' + profile.id, {
      method: 'PATCH',
      body: { nome: profile.nome, permissoes: perms },
    });
    profiles = profiles.map((row) => (row.id === updated.id ? updated : row));
    permissions();
    SinstockUI.notify('Permissões salvas e aplicadas pela API.');
  });
  function codeForm(title, first, work) {
    const overlay = D.dialog(
      title,
      '<form><label>Senha atual *<input name="senha" type="password" required maxlength="72" autocomplete="current-password"></label>' +
        '<div data-code hidden><label>Código de seis dígitos *<input name="codigo" inputmode="numeric" pattern="[0-9]{6}" maxlength="6"></label></div>' +
        '<p role="status" data-message></p><button type="submit">' +
        first +
        '</button></form>',
    );
    const form = overlay.querySelector('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, () => work(form, overlay));
    };
    return overlay;
  }
  $('enableEmail2fa').onclick = () => {
    let challenge;
    codeForm(
      'Ativar segundo fator por e-mail',
      'Enviar código',
      async (form, overlay) => {
        if (!challenge) {
          challenge = await SinstockAPI.request('/auth/2fa/email/setup', {
            method: 'POST',
            body: { senha_atual: form.elements.senha.value },
          });
          form.querySelector('[data-code]').hidden = false;
          form.elements.codigo.required = true;
          form.querySelector('[data-message]').textContent =
            'Código enviado. Validade de cinco minutos.';
          form.querySelector('[type="submit"]').textContent =
            'Confirmar ativação';
        } else {
          await SinstockAPI.request('/auth/2fa/email/enable', {
            method: 'POST',
            body: {
              challenge_id: challenge.challengeId,
              codigo: form.elements.codigo.value,
            },
          });
          overlay.remove();
          await reauthenticate();
        }
      },
    );
  };
  $('enableTotp2fa').onclick = async () => {
    try {
      const result = await SinstockAPI.request('/auth/2fa/generate', {
        method: 'POST',
      });
      const overlay = D.dialog(
        'Ativar aplicativo autenticador',
        '<p>Escaneie o QR Code no seu aplicativo e confirme o código.</p><img alt="QR Code do autenticador" class="totp-qr">' +
          '<p>Chave manual: <code>' +
          D.text(result.secret) +
          '</code></p><form><label>Código *<input name="codigo" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><button type="submit">Ativar</button></form>',
      );
      overlay.querySelector('img').src = result.qrCodeDataUrl;
      const form = overlay.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        D.saving(form, async () => {
          await SinstockAPI.request('/auth/2fa/enable', {
            method: 'POST',
            body: { codigo: form.elements.codigo.value },
          });
          overlay.remove();
          await reauthenticate();
        });
      };
    } catch (error) {
      SinstockUI.notify(error.message);
    }
  };
  $('disable2fa').onclick = () => {
    let challenge;
    const email = user.two_factor_method === 'EMAIL';
    const overlay = codeForm(
      'Desativar segundo fator',
      email ? 'Enviar código' : 'Confirmar desativação',
      async (form, modal) => {
        if (email && !challenge) {
          challenge = await SinstockAPI.request(
            '/auth/2fa/email/disable-code',
            {
              method: 'POST',
              body: { senha_atual: form.elements.senha.value },
            },
          );
          form.querySelector('[data-code]').hidden = false;
          form.elements.codigo.required = true;
          form.querySelector('[type="submit"]').textContent =
            'Confirmar desativação';
          form.querySelector('[data-message]').textContent =
            'Código enviado ao seu e-mail.';
        } else {
          await SinstockAPI.request('/auth/2fa/disable', {
            method: 'POST',
            body: {
              senha_atual: form.elements.senha.value,
              codigo: form.elements.codigo.value,
              challenge_id: challenge?.challengeId,
            },
          });
          modal.remove();
          await reauthenticate();
        }
      },
    );
    if (!email) {
      overlay.querySelector('[data-code]').hidden = false;
      overlay.querySelector('[name="codigo"]').required = true;
    }
  };
  SinstockSession.ready
    .then(async (current) => {
      if (!current) return;
      user = current;
      [settings, preferences] = await Promise.all([
        D.get('/configuracoes/publicas'),
        D.get('/configuracoes/preferencias'),
      ]);
      user.preferencias = preferences;
      Object.entries(companyFields).forEach(([key, id]) => {
        $(id).value = settings.empresa[key] || '';
        $(id).readOnly = user.perfil_id !== 1;
      });
      $('expirationDays').value = settings.estoque.dias_validade;
      $('defaultMinimumStock').value = settings.estoque.estoque_minimo_padrao;
      $('lowStockAlert').checked = preferences.notificar_estoque;
      $('expirationAlert').checked = preferences.notificar_validade;
      $('automaticLogout').checked = preferences.logout_inativo;
      $('itemsPerPage').value = preferences.itens_por_pagina;
      $('twoFactorStatus').textContent = user.isTwoFactorEnable
        ? 'Ativo: ' +
          (user.two_factor_method === 'EMAIL'
            ? 'e-mail'
            : 'aplicativo autenticador')
        : 'Desativado.';
      $('enableEmail2fa').hidden = $('enableTotp2fa').hidden =
        user.isTwoFactorEnable;
      $('disable2fa').hidden = !user.isTwoFactorEnable;
      if (user.perfil_id === 1) {
        profiles = await D.get('/perfis');
        D.options($('permissionProfile'), profiles, (row) => row.nome);
        $('permissionProfile').value =
          profiles.find((row) => row.id !== 1)?.id || 1;
        permissions();
        await listUsers();
      }
    })
    .catch((error) => {
      $('settingsError').textContent = error.message;
    });
})` (1); `SinstockAPI.request` (60); `SinstockAPI.request` (67); `SinstockAPI.request` (78); `SinstockAPI.request` (100); `SinstockAPI.request` (170); `SinstockAPI.request` (192); `SinstockAPI.request` (268); `SinstockAPI.request` (291); `SinstockAPI.request` (322); `SinstockAPI.request` (333); `SinstockAPI.request` (348); `SinstockAPI.request` (363); `SinstockAPI.request` (383); `SinstockAPI.request` (397).

**Controles criados em templates:** `userForm`.

## frontend/js/pages/dashboard.js

Fonte: [frontend/js/pages/dashboard.js](../../frontend/js/pages/dashboard.js). 234 linhas.

**Funções nomeadas:** `$` (linha 4); `liveUpdates` (linha 12); `graph` (linha 29); `load` (linha 64).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `window` | 'pagehide' | 25 |
| `window` | 'pageshow' | 26 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/estoque.js

Fonte: [frontend/js/pages/estoque.js](../../frontend/js/pages/estoque.js). 637 linhas.

**Funções nomeadas:** `$` (linha 4); `date` (linha 26); `branch` (linha 28); `choices` (linha 38); `summary` (linha 68); `inventory` (linha 84); `history` (linha 150); `receipts` (linha 200); `refresh` (linha 241); `showType` (linha 268); `balance` (linha 290); `describeBalance` (linha 318); `receiptDetail` (linha 428); `lots` (linha 491); `adjustLot` (linha 533).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `$('stockSearch')` | 'input' | 249 |
| `$('receiptSearch')` | 'input' | 257 |
| `window` | 'sinstock:catalog-changed' | 618 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id),
    modal = $('movementModal'),
    form = $('movementForm');
  let products = [],
    inventoryPage = 1,
    historyPage = 1,
    receiptPage = 1,
    inventorySequence = 0,
    historySequence = 0,
    receiptSequence = 0,
    balanceSequence = 0;
  let currentProduct;
  const initialQuery = new URLSearchParams(location.search);
  $('stockSearch').value = initialQuery.get('busca') || '';
  $('receiptSearch').value = initialQuery.get('nota') || '';
  if (initialQuery.has('nota')) {
    document
      .querySelectorAll('.stock-tab,.stock-tab-content')
      .forEach((node) => node.classList.remove('active'));
    document.querySelector('[data-tab="receipts"]').classList.add('active');
    $('receipts').classList.add('active');
  }
  const date = (value) =>
    value ? value.slice(0, 10).split('-').reverse().join('/') : '—';
  const branch = () => Number($('stockBranch').value) || undefined;
  document.querySelectorAll('.stock-tab').forEach((tab) => {
    tab.onclick = () => {
      document
        .querySelectorAll('.stock-tab,.stock-tab-content')
        .forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      $(tab.dataset.tab).classList.add('active');
    };
  });
  async function choices() {
    const [branches, categories, suppliers, catalog] = await Promise.all([
      D.get('/filiais'),
      D.get('/categorias'),
      D.all('/fornecedores'),
      D.all('/produtos'),
    ]);
    const previous = $('stockBranch').value || initialQuery.get('filial_id');
    ['stockBranch', 'movementBranch', 'movementDestination'].forEach((id) => {
      D.options($(id), D.rows(branches), (item) => item.nome);
    });
    $('stockBranch').value = previous || D.rows(branches)[0]?.id || '';
    D.options(
      $('categoryFilter'),
      D.rows(categories),
      (item) => item.nome,
      'Todas as categorias',
    );
    D.options(
      $('movementSupplier'),
      suppliers,
      (item) => item.nome_fantasia || item.nome_juridico,
    );
    products = catalog;
    D.options(
      $('movementProduct'),
      catalog,
      (item) => item.nome + (item.sku ? ' · ' + item.sku : ''),
    );
  }
  async function summary() {
    const info = await D.get('/saldos-estoque/resumo/atual', {
      filial_id: branch(),
    });
    const values = [
      D.number(info.disponivel),
      D.number(info.estoque_baixo),
      D.number(info.sem_estoque),
      D.money(info.valor),
    ];
    document
      .querySelectorAll('.stock-summary-card strong')
      .forEach((node, i) => {
        node.textContent = values[i];
      });
  }
  async function inventory(pagina = inventoryPage) {
    const sequence = ++inventorySequence;
    inventoryPage = pagina;
    D.message($('stockTableBody'), 'Carregando estoque...', 9);
    try {
      const result = await D.get('/produtos', {
        pagina,
        limite: D.pageSize(),
        filial_id: branch(),
        busca: $('stockSearch').value,
        categoria_id: $('categoryFilter').value,
        estoque:
          $('stockStatusFilter').value === 'sem-movimento'
            ? undefined
            : $('stockStatusFilter').value,
        sem_movimento_dias:
          $('stockStatusFilter').value === 'sem-movimento' ? 30 : undefined,
      });
      if (sequence !== inventorySequence) return;
      $('stockTableBody').innerHTML = result.dados
        .map((product) => {
          const physical = D.quantities(product.saldos_estoque);
          const reserved = D.quantities(product.saldos_estoque, true);
          const available = Math.round((physical - reserved) * 1000) / 1000,
            minimum = Number(product.estoque_minimo);
          return (
            '<tr><td>' +
            D.text(product.nome) +
            '</td><td>' +
            D.text(product.sku || '—') +
            '</td><td>' +
            D.text(product.categorias.nome) +
            '</td><td>' +
            D.number(available) +
            '<small>Físico: ' +
            D.number(physical) +
            ' · Reservado: ' +
            D.number(reserved) +
            '</small></td><td>' +
            D.number(minimum) +
            '</td><td>' +
            D.money(product.custo_medio) +
            '</td><td>' +
            D.money(physical * Number(product.custo_medio)) +
            '</td><td>' +
            (available === 0
              ? 'Sem estoque'
              : available <= minimum
                ? 'Estoque baixo'
                : 'Normal') +
            '</td><td><button type="button" class="stock-actions-button" data-lots="' +
            product.id +
            '">Lotes</button></td></tr>'
          );
        })
        .join('');
      if (!result.dados.length)
        D.message($('stockTableBody'), 'Nenhum produto encontrado.', 9);
      document.querySelector('.stock-footer > span').textContent =
        result.meta.total + ' produtos encontrados';
      D.paginate($('stockPagination'), result, inventory);
    } catch (error) {
      if (sequence === inventorySequence)
        D.message($('stockTableBody'), error.message, 9);
    }
  }
  async function history(pagina = historyPage) {
    const sequence = ++historySequence;
    historyPage = pagina;
    D.message($('movementTableBody'), 'Carregando histórico...', 6);
    try {
      const result = await D.get('/movimentacoes/historico', {
        pagina,
        limit: D.pageSize(),
        filial_id: branch(),
        tipo: $('movementFilter').value.toUpperCase(),
      });
      if (sequence !== historySequence) return;
      $('movementTableBody').innerHTML = result.dados
        .map(
          (log) =>
            '<tr><td>' +
            D.text(new Date(log.data_hora).toLocaleString('pt-BR')) +
            '</td><td>' +
            D.text(log.produtos.nome) +
            '<small>' +
            D.text(log.lotes?.numero_lote || 'Sem lote') +
            ' · ' +
            D.text(log.filiais.nome) +
            '</small></td><td>' +
            D.text(log.tipo_movimentacao) +
            '</td><td>' +
            D.number(log.quantidade) +
            '<small>' +
            D.number(log.saldo_anterior) +
            ' → ' +
            D.number(log.saldo_atual) +
            '</small></td><td>' +
            D.text(log.observacao || log.referencia || '—') +
            '</td><td>' +
            D.text(log.usuarios.nome) +
            '</td></tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message(
          $('movementTableBody'),
          'Nenhuma movimentação encontrada.',
          6,
        );
      D.paginate($('historyPagination'), result, history);
    } catch (error) {
      if (sequence === historySequence)
        D.message($('movementTableBody'), error.message, 6);
    }
  }
  async function receipts(pagina = receiptPage) {
    const sequence = ++receiptSequence;
    receiptPage = pagina;
    D.message($('receiptsBody'), 'Carregando recebimentos...', 7);
    try {
      const result = await D.get('/notas-fiscais-entrada', {
        pagina,
        limite: D.pageSize(),
        filial_id: branch(),
        busca: $('receiptSearch').value,
        status: $('receiptStatus').value,
      });
      if (sequence !== receiptSequence) return;
      $('receiptsBody').innerHTML = result.dados
        .map(
          (note) =>
            '<tr><td>' +
            D.text(note.numero_nf) +
            '</td><td>' +
            D.text(note.fornecedores.nome_juridico) +
            '</td><td>' +
            D.text(note.filiais?.nome || 'Não informada') +
            '</td><td>' +
            date(note.data_emissao) +
            '</td><td>' +
            D.money(note.total) +
            '</td><td>' +
            D.text(note.status) +
            '</td><td><button type="button" data-note="' +
            note.id +
            '">Detalhes</button></td></tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message($('receiptsBody'), 'Nenhum recebimento encontrado.', 7);
      D.paginate($('receiptPagination'), result, receipts);
    } catch (error) {
      if (sequence === receiptSequence)
        D.message($('receiptsBody'), error.message, 7);
    }
  }
  async function refresh() {
    $('stockError').textContent = '';
    try {
      await Promise.all([inventory(), history(), receipts(), summary()]);
    } catch (error) {
      $('stockError').textContent = error.message;
    }
  }
  $('stockSearch').addEventListener(
    'input',
    D.debounce(() => inventory(1)),
  );
  ['categoryFilter', 'stockStatusFilter'].forEach(
    (id) => ($(id).onchange = () => inventory(1)),
  );
  $('movementFilter').onchange = () => history(1);
  $('receiptSearch').addEventListener(
    'input',
    D.debounce(() => receipts(1)),
  );
  $('receiptStatus').onchange = () => receipts(1);
  $('stockBranch').onchange = () => {
    inventoryPage = historyPage = receiptPage = 1;
    refresh();
  };
  $('refreshStock').onclick = () => refresh();

  function showType() {
    const type = $('movementType').value,
      entry = type === 'entrada',
      transfer = type === 'transferencia';
    document.querySelectorAll('[data-entry-only]').forEach((node) => {
      node.hidden = !entry;
    });
    document.querySelectorAll('[data-transfer-only]').forEach((node) => {
      node.hidden = !transfer;
    });
    ['movementSupplier', 'movementReference'].forEach((id) => {
      $(id).closest('.stock-form-group').hidden = !entry;
      $(id).required = entry;
    });
    $('movementCost').required = entry;
    $('movementDestination').required = transfer;
    $('movementDate').disabled = !entry;
    $('movementQuantity').min = type === 'ajuste' ? 0 : 0.001;
    $('movementQuantityLabel').textContent =
      type === 'ajuste' ? 'Quantidade física após contagem *' : 'Quantidade *';
    $('movementExpiry').required = entry && !!$('movementNewLot').value.trim();
  }
  async function balance() {
    const sequence = ++balanceSequence,
      id = Number($('movementProduct').value);
    $('movementBalance').textContent = '';
    currentProduct = null;
    D.options($('movementLot'), [], (item) => item.numero_lote, 'Sem lote');
    if (!id) return;
    try {
      const product = await D.get('/produtos/' + id);
      if (sequence !== balanceSequence) return;
      currentProduct = product;
      const balances = product.saldos_estoque.filter(
        (row) => row.filial_id === Number($('movementBranch').value),
      );
      const lots = balances.filter((row) => row.lotes).map((row) => row.lotes);
      D.options(
        $('movementLot'),
        lots,
        (item) => item.numero_lote + ' · ' + date(item.data_validade),
        'Sem lote',
      );
      if (lots.length && !balances.some((row) => row.lote_id === null))
        $('movementLot').value = lots[0].id;
      describeBalance();
    } catch (error) {
      $('movementBalance').textContent = error.message;
    }
  }
  function describeBalance() {
    const selected = currentProduct?.saldos_estoque.find(
      (row) =>
        row.filial_id === Number($('movementBranch').value) &&
        (row.lote_id || '') === (Number($('movementLot').value) || ''),
    );
    $('movementBalance').textContent =
      'Disponível no lote: ' +
      D.number(
        Number(selected?.quantidade || 0) -
          Number(selected?.quantidade_reservada || 0),
      );
  }
  $('movementType').onchange = showType;
  $('movementNewLot').oninput = showType;
  $('scanMovementProduct').onclick = () =>
    SinstockScanner.scan(async (code) => {
      const product = await D.get(
        '/produtos/codigo-barras/' + encodeURIComponent(code),
        { filial_id: Number($('movementBranch').value) },
      );
      $('movementProduct').value = product.id;
      await balance();
    });
  $('movementProduct').onchange = balance;
  $('movementBranch').onchange = balance;
  $('movementLot').onchange = describeBalance;
  $('openMovementModal').onclick = () => {
    form.reset();
    $('movementError').textContent = '';
    form.querySelector('[data-form-error]')?.remove();
    $('movementBranch').value = branch() || '';
    $('movementDate').value = new Date().toLocaleDateString('en-CA');
    showType();
    balance();
    modal.classList.add('active');
  };
  ['closeMovementModal', 'cancelMovement'].forEach(
    (id) => ($(id).onclick = () => modal.classList.remove('active')),
  );
  modal.onclick = (event) => {
    if (event.target === modal) modal.classList.remove('active');
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    D.saving(form, async () => {
      const type = $('movementType').value,
        product = Number($('movementProduct').value),
        filial = Number($('movementBranch').value),
        lote = Number($('movementLot').value) || undefined;
      const quantidade = Number($('movementQuantity').value),
        observacao = $('movementReason').value.trim();
      if (type === 'entrada') {
        const newLot = $('movementNewLot').value.trim();
        await SinstockAPI.request('/notas-fiscais-entrada', {
          method: 'POST',
          body: {
            fornecedor_id: Number($('movementSupplier').value),
            filial_id: filial,
            numero_nf: $('movementReference').value.trim(),
            data_emissao: $('movementDate').value,
            observacao,
            status: $('movementReceiptStatus').value,
            itens: [
              {
                produto_id: product,
                quantidade,
                custo_unitario: Number($('movementCost').value),
                ...(newLot
                  ? {
                      lote: {
                        numero_lote: newLot,
                        data_validade: $('movementExpiry').value,
                      },
                    }
                  : { lote_id: lote }),
              },
            ],
          },
        });
      } else if (type === 'transferencia') {
        await SinstockAPI.request('/movimentacoes/transferencia', {
          method: 'POST',
          body: {
            produto_id: product,
            filial_origem_id: filial,
            filial_destino_id: Number($('movementDestination').value),
            lote_id: lote,
            quantidade,
            observacao,
          },
        });
      } else {
        await SinstockAPI.request('/movimentacoes', {
          method: 'POST',
          body: {
            produto_id: product,
            filial_id: filial,
            lote_id: lote,
            tipo: type.toUpperCase(),
            quantidade,
            observacao,
          },
        });
      }
      modal.classList.remove('active');
      SinstockUI.notify('Operação registrada.');
      await refresh();
    });
  };
  async function receiptDetail(id) {
    const note = await D.get('/notas-fiscais-entrada/' + id);
    const overlay = D.dialog(
      'Documento ' + note.numero_nf,
      '<p>' +
        D.text(note.fornecedores.nome_juridico) +
        ' · ' +
        D.text(note.status) +
        '</p>' +
        '<div class="catalog-table-container"><table><thead><tr><th>Produto</th><th>Lote</th><th>Quantidade</th><th>Custo</th></tr></thead><tbody>' +
        note.itens_entrada
          .map(
            (item) =>
              '<tr><td>' +
              D.text(item.produtos.nome) +
              '</td><td>' +
              D.text(item.lotes?.numero_lote || 'Sem lote') +
              '</td><td>' +
              D.number(item.quantidade) +
              '</td><td>' +
              D.money(item.custo_unitario) +
              '</td></tr>',
          )
          .join('') +
        '</tbody></table></div>' +
        (note.status === 'PENDENTE'
          ? '<button type="button" data-receive>Receber documento</button>'
          : '') +
        (note.status !== 'CANCELADA'
          ? '<form><div class="product-form-group"><label for="cancelNoteReason">Motivo do estorno *</label><input id="cancelNoteReason" name="motivo" required maxlength="1000"></div><button type="submit">Estornar documento</button></form>'
          : ''),
    );
    const receive = overlay.querySelector('[data-receive]');
    if (receive)
      receive.onclick = async () => {
        receive.disabled = true;
        try {
          await SinstockAPI.request(
            '/notas-fiscais-entrada/' + id + '/receber',
            { method: 'PATCH' },
          );
          overlay.remove();
          await refresh();
        } catch (error) {
          receive.disabled = false;
          SinstockUI.notify(error.message);
        }
      };
    const cancel = overlay.querySelector('form');
    if (cancel)
      cancel.onsubmit = (event) => {
        event.preventDefault();
        D.saving(cancel, async () => {
          await SinstockAPI.request(
            '/notas-fiscais-entrada/' + id + '/estorno',
            { method: 'PATCH', body: { motivo: cancel.elements.motivo.value } },
          );
          overlay.remove();
          await refresh();
          SinstockUI.notify('Documento estornado.');
        });
      };
  }
  async function lots(id) {
    const product = await D.get('/produtos/' + id);
    const balances = product.saldos_estoque.filter(
      (row) => !branch() || row.filial_id === branch(),
    );
    const overlay = D.dialog(
      'Lotes de ' + product.nome,
      '<div class="catalog-table-container"><table><thead><tr><th>Lote</th><th>Validade</th><th>Físico</th><th>Reservado</th><th>Ações</th></tr></thead><tbody>' +
        balances
          .map(
            (row) =>
              '<tr><td>' +
              D.text(row.lotes?.numero_lote || 'Sem lote') +
              '</td><td>' +
              date(row.lotes?.data_validade) +
              '</td><td>' +
              D.number(row.quantidade) +
              '</td><td>' +
              D.number(row.quantidade_reservada) +
              '</td><td>' +
              (row.lote_id
                ? '<button type="button" data-adjust="' +
                  row.lote_id +
                  '">Ajustar lote</button>'
                : '—') +
              '</td></tr>',
          )
          .join('') +
        (balances.length
          ? ''
          : '<tr><td colspan="5">Nenhum saldo registrado nesta filial.</td></tr>') +
        '</tbody></table></div>',
    );
    overlay.onclick = (event) => {
      const button = event.target.closest('[data-adjust]');
      if (button)
        adjustLot(product, Number(button.dataset.adjust)).catch((error) =>
          SinstockUI.notify(error.message),
        );
      if (event.target === overlay) overlay.remove();
    };
  }
  async function adjustLot(product, id) {
    const lot = product.saldos_estoque.find((row) => row.lote_id === id).lotes;
    const notes = await D.all('/notas-fiscais-entrada', {
      produto_id: product.id,
    });
    const items = notes
      .filter((note) => note.status !== 'CANCELADA')
      .flatMap((note) =>
        note.itens_entrada
          .filter((item) => item.lote_id === id)
          .map((item) => ({ ...item, documento: note.numero_nf })),
      );
    const overlay = D.dialog(
      'Ajustar lote ' + lot.numero_lote,
      '<form><div class="product-form-group"><label>Número do lote<input name="numero" required maxlength="50" value="' +
        D.text(lot.numero_lote) +
        '"></label></div>' +
        '<div class="product-form-group"><label>Validade<input name="validade" type="date" required value="' +
        lot.data_validade.slice(0, 10) +
        '"></label></div>' +
        '<div class="product-form-group"><label>Item de origem (para ajustar quantidade/custo)<select name="item"><option value="">Somente dados do lote</option>' +
        items
          .map(
            (item) =>
              '<option value="' +
              item.id +
              '">NF ' +
              D.text(item.documento) +
              ' · item ' +
              item.id +
              '</option>',
          )
          .join('') +
        '</select></label></div>' +
        '<div data-financial hidden><label>Quantidade recebida<input type="number" name="quantidade" min="0.001" step="0.001"></label><label>Custo unitário<input type="number" name="custo" min="0" step="0.01"></label></div>' +
        '<div class="product-form-group"><label>Motivo *<input name="motivo" required maxlength="1000"></label></div><button type="submit">Salvar ajuste</button></form>',
    );
    const lotForm = overlay.querySelector('form');
    const itemSelect = lotForm.elements.namedItem('item');
    itemSelect.onchange = () => {
      const item = items.find((row) => row.id === Number(itemSelect.value));
      overlay.querySelector('[data-financial]').hidden = !item;
      lotForm.elements.quantidade.required = lotForm.elements.custo.required =
        !!item;
      lotForm.elements.quantidade.value = item?.quantidade || '';
      lotForm.elements.custo.value = item?.custo_unitario || '';
    };
    lotForm.onsubmit = (event) => {
      event.preventDefault();
      D.saving(lotForm, async () => {
        const body = {
          numero_lote: lotForm.elements.numero.value,
          data_validade: lotForm.elements.validade.value,
          motivo: lotForm.elements.motivo.value,
        };
        if (itemSelect.value)
          Object.assign(body, {
            item_entrada_id: Number(itemSelect.value),
            quantidade: Number(lotForm.elements.quantidade.value),
            custo_unitario: Number(lotForm.elements.custo.value),
          });
        await SinstockAPI.request('/notas-fiscais-entrada/lotes/' + id, {
          method: 'PATCH',
          body,
        });
        overlay.remove();
        await refresh();
        SinstockUI.notify('Lote ajustado.');
      });
    };
  }
  $('stockTableBody').onclick = (event) => {
    const button = event.target.closest('[data-lots]');
    if (button)
      lots(Number(button.dataset.lots)).catch((error) =>
        SinstockUI.notify(error.message),
      );
  };
  $('receiptsBody').onclick = (event) => {
    const button = event.target.closest('[data-note]');
    if (button)
      receiptDetail(Number(button.dataset.note)).catch((error) =>
        SinstockUI.notify(error.message),
      );
  };
  window.addEventListener('sinstock:catalog-changed', () =>
    choices()
      .then(refresh)
      .catch((error) => SinstockUI.notify(error.message)),
  );
  document.querySelectorAll('.stock-summary-card strong').forEach((node) => {
    node.textContent = '—';
  });
  SinstockSession.ready
    .then(async (user) => {
      if (user) {
        await choices();
        await refresh();
      }
    })
    .catch((error) => {
      $('stockError').textContent = error.message;
    });
})` (1); `SinstockAPI.request` (372); `SinstockAPI.request` (399); `SinstockAPI.request` (411); `SinstockAPI.request` (465); `SinstockAPI.request` (481); `SinstockAPI.request` (594).

**Controles criados em templates:** `cancelNoteReason`.

## frontend/js/pages/fornecedores.js

Fonte: [frontend/js/pages/fornecedores.js](../../frontend/js/pages/fornecedores.js). 341 linhas.

**Funções nomeadas:** `$` (linha 4); `choices` (linha 32); `fill` (linha 35); `open` (linha 49); `summary` (linha 76); `load` (linha 85); `search` (linha 240).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `$('supplierSearch')` | 'input' | 143 |
| `$(id)` | 'change' | 148 |
| `window` | 'sinstock:catalog-changed' | 328 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id),
    form = $('supplierForm'),
    modal = $('supplierModal'),
    table = $('suppliersTableBody');
  let sequence = 0,
    records = [],
    page = 1;
  $('supplierSearch').value =
    new URLSearchParams(location.search).get('busca') || '';
  const fields = {
    nome_juridico: 'companyName',
    nome_fantasia: 'tradeName',
    cnpj: 'supplierCnpj',
    inscricao_estadual: 'stateRegistration',
    contato: 'contactPerson',
    email: 'supplierEmail',
    telefone: 'supplierPhone',
    categoria: 'supplierCategory',
    prazo_entrega: 'deliveryTime',
    condicao_pagamento: 'paymentTerms',
    endereco: 'supplierAddress',
    cidade: 'supplierCity',
    estado: 'supplierState',
    cep: 'supplierZip',
    observacoes: 'supplierNotes',
    latitude: 'supplierLatitude',
    longitude: 'supplierLongitude',
  };
  async function choices() {
    const categories = D.rows(await D.get('/categorias'));
    // Supplier categories are labels; products use category IDs.
    const fill = (id, empty) => {
      const select = $(id),
        previous = select.value;
      select.replaceChildren(
        new Option(empty, ''),
        ...categories.map((item) => new Option(item.nome, item.nome)),
      );
      if (previous && !categories.some((item) => item.nome === previous))
        select.add(new Option(previous, previous));
      select.value = previous;
    };
    fill('supplierCategory', 'Selecione');
    fill('supplierCategoryFilter', 'Todas as categorias');
  }
  function open(supplier) {
    form.reset();
    $('supplierId').value = supplier?.id || '';
    $('supplierModalTitle').textContent = supplier
      ? 'Editar fornecedor'
      : 'Novo fornecedor';
    Object.entries(fields).forEach(([key, id]) => {
      const value = supplier?.[key] ?? '';
      if (
        $(id).tagName === 'SELECT' &&
        value &&
        ![...$(id).options].some((option) => option.value === value)
      )
        $(id).add(new Option(value, value));
      $(id).value = value;
    });
    $('supplierStatus').value = supplier?.ativo === false ? 'inativo' : 'ativo';
    form.querySelector('[data-form-error]')?.remove();
    modal.classList.add('active');
  }
  $('openSupplierModal').onclick = () => open();
  ['closeSupplierModal', 'cancelSupplier'].forEach((id) => {
    $(id).onclick = () => modal.classList.remove('active');
  });
  modal.onclick = (event) => {
    if (event.target === modal) modal.classList.remove('active');
  };
  async function summary() {
    const info = await D.get('/fornecedores/resumo');
    const values = [info.total, info.ativos, info.pendentes, info.localizados];
    document
      .querySelectorAll('.supplier-summary-card strong')
      .forEach((node, i) => {
        node.textContent = D.number(values[i]);
      });
  }
  async function load(pagina = 1) {
    const callId = ++sequence;
    page = pagina;
    D.message(table, 'Carregando fornecedores...', 7);
    try {
      const result = await D.get('/fornecedores', {
        pagina,
        limite: D.pageSize(),
        busca: $('supplierSearch').value,
        categoria: $('supplierCategoryFilter').value,
        ativo: $('supplierStatusFilter').value
          ? $('supplierStatusFilter').value === 'ativo'
          : undefined,
      });
      if (callId !== sequence) return;
      records = D.rows(result);
      table.innerHTML = records
        .map(
          (item) =>
            '<tr><td><strong>' +
            D.text(item.nome_fantasia || item.nome_juridico) +
            '</strong><small>' +
            D.text(item.nome_juridico) +
            '</small></td><td>' +
            D.text(item.cnpj) +
            '</td><td>' +
            D.text(item.categoria || '—') +
            '</td><td>' +
            (item.email
              ? '<a href="mailto:' +
                D.text(item.email) +
                '">' +
                D.text(item.contato || item.email) +
                '</a>'
              : D.text(item.contato || '—')) +
            '<small>' +
            D.text(item.telefone || '') +
            '</small></td><td>' +
            D.text(
              [item.cidade, item.estado].filter(Boolean).join(' / ') || '—',
            ) +
            '</td><td>' +
            (item.ativo ? 'Ativo' : 'Inativo') +
            '</td><td><div class="catalog-actions"><button type="button" data-edit="' +
            item.id +
            '">Editar</button><button type="button" data-delete="' +
            item.id +
            '">Excluir</button></div></td></tr>',
        )
        .join('');
      if (!records.length) D.message(table, 'Nenhum fornecedor encontrado.', 7);
      document.querySelector('.suppliers-footer > span').textContent =
        D.meta(result).total + ' fornecedores encontrados';
      D.paginate(document.querySelector('.suppliers-pagination'), result, load);
    } catch (error) {
      if (callId === sequence) D.message(table, error.message, 7);
    }
  }
  $('supplierSearch').addEventListener(
    'input',
    D.debounce(() => load()),
  );
  ['supplierCategoryFilter', 'supplierStatusFilter'].forEach((id) =>
    $(id).addEventListener('change', () => load()),
  );
  table.onclick = async (event) => {
    const edit = event.target.closest('[data-edit]'),
      remove = event.target.closest('[data-delete]');
    if (edit) open(records.find((row) => row.id === Number(edit.dataset.edit)));
    if (
      remove &&
      confirm(
        'Excluir este fornecedor? Cadastros com notas ou produtos vinculados são preservados.',
      )
    ) {
      remove.disabled = true;
      try {
        await SinstockAPI.request('/fornecedores/' + remove.dataset.delete, {
          method: 'DELETE',
        });
        await Promise.all([load(page), summary()]);
      } catch (error) {
        remove.disabled = false;
        SinstockUI.notify(error.message);
      }
    }
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    D.saving(form, async () => {
      const body = {},
        id = $('supplierId').value;
      Object.entries(fields).forEach(([key, field]) => {
        const value = $(field).value.trim();
        if (key === 'prazo_entrega') body[key] = Number(value || 0);
        else if (['latitude', 'longitude'].includes(key)) {
          if (value !== '') body[key] = Number(value);
          else if (id) body[key] = null;
        } else if (value) body[key] = value;
        else if (id) body[key] = null;
      });
      body.ativo = $('supplierStatus').value === 'ativo';
      await SinstockAPI.request('/fornecedores' + (id ? '/' + id : ''), {
        method: id ? 'PATCH' : 'POST',
        body,
      });
      modal.classList.remove('active');
      SinstockUI.notify('Fornecedor salvo.');
      await Promise.all([load(page), summary()]);
    });
  };
  $('locateSupplierAddress').onclick = async () => {
    const button = $('locateSupplierAddress');
    if (
      !$('supplierAddress').value.trim() ||
      !$('supplierCity').value.trim() ||
      !$('supplierState').value
    )
      return SinstockUI.notify(
        'Informe endereço, cidade e UF para localizar o fornecedor.',
      );
    button.disabled = true;
    try {
      const coords = await D.get('/integracoes/coordenadas', {
        logradouro: $('supplierAddress').value,
        cidade: $('supplierCity').value,
        uf: $('supplierState').value,
      });
      if (!coords.lat || !coords.lon)
        throw new Error(
          'Endereço não localizado. Você pode informar as coordenadas manualmente.',
        );
      $('supplierLatitude').value = Number(coords.lat).toFixed(8);
      $('supplierLongitude').value = Number(coords.lon).toFixed(8);
      SinstockUI.notify(
        'Coordenadas preenchidas. Confira o endereço e salve o cadastro.',
      );
    } catch (error) {
      SinstockUI.notify(error.message);
    } finally {
      button.disabled = false;
    }
  };
  $('openNearbyModal').onclick = () => {
    const overlay = D.dialog(
      'Fornecedores próximos',
      '<form id="nearbyForm"><div class="commerce-grid"><label>Cidade<input name="cidade" maxlength="100"></label><label>CEP<input name="cep" pattern="[0-9]{5}-?[0-9]{3}"></label></div><label>Raio para GPS (km)<input name="raio" type="number" min="0.1" max="500" step="0.1" value="50"></label>' +
        '<div class="catalog-actions"><button type="submit">Buscar por cidade ou CEP</button><button type="button" data-gps>Usar minha localização</button></div></form><p role="status" data-nearby-message></p>' +
        '<div class="catalog-table-container"><table><thead><tr><th>Fornecedor</th><th>Cidade</th><th>Distância</th><th>Contato</th></tr></thead><tbody></tbody></table></div><div class="catalog-pagination"></div><p class="catalog-note">Distância em linha reta para fornecedores com coordenadas cadastradas. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></p>',
    );
    const form = overlay.querySelector('form'),
      body = overlay.querySelector('tbody'),
      status = overlay.querySelector('[data-nearby-message]');
    let filters = {},
      call = 0;
    async function search(pagina = 1) {
      const sequence = ++call;
      D.message(body, 'Pesquisando...', 4);
      try {
        const result = await D.get('/fornecedores/proximos', {
          ...filters,
          pagina,
          limite: D.pageSize(),
        });
        if (sequence !== call || !overlay.isConnected) return;
        status.textContent =
          result.modo === 'distancia'
            ? result.sem_coordenadas
              ? result.sem_coordenadas +
                ' fornecedores sem coordenadas não entram no cálculo de distância.'
              : 'Fornecedores dentro do raio informado.'
            : 'Pesquisa pelos dados de cidade/CEP cadastrados; sem cálculo de distância.';
        body.innerHTML = result.dados
          .map((item) => {
            const phone = (item.telefone || '').replace(/\D/g, '');
            return (
              '<tr><td>' +
              D.text(item.nome_fantasia || item.nome_juridico) +
              '</td><td>' +
              D.text(item.cidade || '—') +
              '</td><td>' +
              (item.distancia_km === null
                ? '—'
                : D.number(item.distancia_km) + ' km') +
              '</td><td>' +
              (phone ? '<a href="tel:' + phone + '">Ligar</a> ' : '') +
              (item.email
                ? '<a href="mailto:' + D.text(item.email) + '">E-mail</a>'
                : '') +
              '</td></tr>'
            );
          })
          .join('');
        if (!result.dados.length)
          D.message(
            body,
            'Nenhum fornecedor encontrado. Tente outra cidade, CEP ou raio.',
            4,
          );
        D.paginate(
          overlay.querySelector('.catalog-pagination'),
          result,
          search,
        );
      } catch (error) {
        if (sequence === call) {
          D.message(body, error.message, 4);
          status.textContent = error.message;
        }
      }
    }
    form.onsubmit = (event) => {
      event.preventDefault();
      filters = {
        cidade: form.elements.cidade.value.trim(),
        cep: form.elements.cep.value.trim(),
      };
      search();
    };
    overlay.querySelector('[data-gps]').onclick = () => {
      if (!navigator.geolocation) {
        status.textContent =
          'Localização indisponível. Busque por cidade ou CEP.';
        return;
      }
      status.textContent = 'Solicitando localização ao navegador...';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          filters = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            raio_km: Number(form.elements.raio.value || 50),
          };
          search();
        },
        () => {
          status.textContent =
            'Não foi possível obter sua localização. Autorize no navegador ou busque por cidade/CEP.';
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    };
  };
  window.addEventListener('sinstock:catalog-changed', () =>
    choices().catch((error) => SinstockUI.notify(error.message)),
  );
  D.message(table, 'Carregando fornecedores...', 7);
  document.querySelectorAll('.supplier-summary-card strong').forEach((node) => {
    node.textContent = '—';
  });
  SinstockSession.ready
    .then(async (user) => {
      if (user) await Promise.all([load(), summary(), choices()]);
    })
    .catch((error) => SinstockUI.notify(error.message));
})` (1); `SinstockAPI.request` (162); `SinstockAPI.request` (187).

**Controles criados em templates:** `nearbyForm`.

## frontend/js/pages/pedidos.js

Fonte: [frontend/js/pages/pedidos.js](../../frontend/js/pages/pedidos.js). 123 linhas.

**Funções nomeadas:** `$` (linha 5); `filter` (linha 10); `list` (linha 24); `summary` (linha 68); `refresh` (linha 79).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `$('.order-search input')` | 'input' | 93 |
| `window` | 'sinstock:commerce-changed' | 106 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/produtos.js

Fonte: [frontend/js/pages/produtos.js](../../frontend/js/pages/produtos.js). 253 linhas.

**Funções nomeadas:** `$` (linha 4); `choices` (linha 27); `open` (linha 48); `summary` (linha 90); `load` (linha 104).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `$('productSearch')` | 'input' | 181 |
| `$(id)` | 'change' | 186 |
| `window` | 'sinstock:catalog-changed' | 239 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  const form = $('productForm'),
    modal = $('productModal'),
    table = $('productsTableBody');
  let page = 1,
    sequence = 0,
    records = [],
    defaultMinimum = 0;
  $('productSearch').value =
    new URLSearchParams(location.search).get('busca') || '';
  const fields = {
    nome: 'productName',
    descricao: 'productDescription',
    marca: 'productBrand',
    sku: 'productSku',
    codigo_barras: 'productBarcode',
    categoria_id: 'productCategory',
    fornecedor_id: 'productSupplier',
    preco_venda: 'productPrice',
    estoque_minimo: 'minimumStock',
    unidade: 'productUnit',
    observacao: 'productObservation',
  };
  async function choices() {
    const [categories, suppliers, settings] = await Promise.all([
      D.get('/categorias'),
      D.all('/fornecedores'),
      D.get('/configuracoes/publicas'),
    ]);
    defaultMinimum = settings.estoque.estoque_minimo_padrao;
    D.options($('productCategory'), D.rows(categories), (item) => item.nome);
    D.options(
      $('categoryFilter'),
      D.rows(categories),
      (item) => item.nome,
      'Todas as categorias',
    );
    D.options(
      $('productSupplier'),
      suppliers,
      (item) => item.nome_fantasia || item.nome_juridico,
      'Sem fornecedor',
    );
  }
  function open(product) {
    form.reset();
    $('productId').value = product?.id || '';
    $('productModalTitle').textContent = product
      ? 'Editar produto'
      : 'Novo produto';
    Object.entries(fields).forEach(([key, id]) => {
      $(id).value =
        product?.[key] ??
        (key === 'unidade'
          ? 'UN'
          : key === 'estoque_minimo'
            ? defaultMinimum
            : '');
    });
    $('productStatus').value = product?.ativo === false ? 'inativo' : 'ativo';
    $('productCost').value = Number(product?.custo_medio || 0);
    form.querySelector('[data-form-error]')?.remove();
    modal.classList.add('active');
  }
  $('openProductModal').onclick = () => open();
  $('scanProductBarcode').onclick = () =>
    SinstockScanner.scan(async (code) => {
      $('productBarcode').value = code;
      try {
        open(
          await D.get('/produtos/codigo-barras/' + encodeURIComponent(code)),
        );
      } catch (error) {
        if (error.status === 404)
          SinstockUI.notify(
            'Código ainda não cadastrado. Informe os dados do produto.',
          );
        else throw error;
      }
    });
  ['closeProductModal', 'cancelProduct'].forEach((id) => {
    $(id).onclick = () => modal.classList.remove('active');
  });
  modal.onclick = (event) => {
    if (event.target === modal) modal.classList.remove('active');
  };
  async function summary() {
    const info = await D.get('/produtos/resumo');
    const values = [
      info.total,
      info.ativos,
      info.estoque_baixo,
      info.proximos_validade,
    ];
    document
      .querySelectorAll('.product-summary-card strong')
      .forEach((node, i) => {
        node.textContent = D.number(values[i]);
      });
  }
  async function load(pagina = 1) {
    const callId = ++sequence;
    page = pagina;
    D.message(table, 'Carregando produtos...', 9);
    try {
      const result = await D.get('/produtos', {
        pagina,
        limite: D.pageSize(),
        busca: $('productSearch').value,
        categoria_id: $('categoryFilter').value,
        ativo: $('productStatusFilter').value
          ? $('productStatusFilter').value === 'ativo'
          : undefined,
        estoque: $('stockFilter').value,
      });
      if (callId !== sequence) return;
      records = result.dados;
      table.innerHTML = records
        .map((product) => {
          const available =
            Math.round(
              (D.quantities(product.saldos_estoque) -
                D.quantities(product.saldos_estoque, true)) *
                1000,
            ) / 1000;
          const expiries = product.saldos_estoque
            .filter((row) => Number(row.quantidade) > 0 && row.lotes)
            .map((row) => row.lotes.data_validade.slice(0, 10))
            .sort();
          return (
            '<tr><td><strong>' +
            D.text(product.nome) +
            '</strong><small>' +
            D.text(product.marca || product.descricao || '') +
            '</small></td><td>' +
            D.text(product.sku || '—') +
            '</td><td>' +
            D.text(product.categorias.nome) +
            '</td><td>' +
            D.text(
              product.fornecedores?.nome_fantasia ||
                product.fornecedores?.nome_juridico ||
                '—',
            ) +
            '</td><td>' +
            D.number(available) +
            ' ' +
            D.text(product.unidade) +
            '</td><td>' +
            D.money(product.preco_venda) +
            '</td><td>' +
            D.text(
              expiries[0] ? expiries[0].split('-').reverse().join('/') : '—',
            ) +
            '</td><td>' +
            (product.ativo ? 'Ativo' : 'Inativo') +
            '</td><td><div class="catalog-actions"><button type="button" data-edit="' +
            product.id +
            '">Editar</button><button type="button" data-delete="' +
            product.id +
            '">Excluir</button></div></td></tr>'
          );
        })
        .join('');
      if (!records.length)
        D.message(
          table,
          'Nenhum produto encontrado. Cadastre uma categoria e seu primeiro produto.',
          9,
        );
      document.querySelector('.products-footer > span').textContent =
        D.meta(result).total + ' produtos encontrados';
      D.paginate(document.querySelector('.products-pagination'), result, load);
    } catch (error) {
      if (callId === sequence) D.message(table, error.message, 9);
    }
  }
  $('productSearch').addEventListener(
    'input',
    D.debounce(() => load()),
  );
  ['categoryFilter', 'productStatusFilter', 'stockFilter'].forEach((id) =>
    $(id).addEventListener('change', () => load()),
  );
  table.onclick = async (event) => {
    const edit = event.target.closest('[data-edit]'),
      remove = event.target.closest('[data-delete]');
    if (edit) open(records.find((row) => row.id === Number(edit.dataset.edit)));
    if (
      remove &&
      confirm(
        'Excluir este produto? O histórico vinculado impede a exclusão; nesse caso, você pode inativá-lo.',
      )
    ) {
      remove.disabled = true;
      try {
        await SinstockAPI.request('/produtos/' + remove.dataset.delete, {
          method: 'DELETE',
        });
        await Promise.all([load(page), summary()]);
      } catch (error) {
        remove.disabled = false;
        SinstockUI.notify(error.message);
      }
    }
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    D.saving(form, async () => {
      const body = {},
        id = $('productId').value;
      Object.entries(fields).forEach(([key, field]) => {
        const value = $(field).value.trim();
        if (
          [
            'categoria_id',
            'fornecedor_id',
            'preco_venda',
            'estoque_minimo',
          ].includes(key)
        ) {
          if (value !== '') body[key] = Number(value);
        } else body[key] = value;
      });
      if (!body.fornecedor_id && id) body.fornecedor_id = null;
      body.ativo = $('productStatus').value === 'ativo';
      await SinstockAPI.request('/produtos' + (id ? '/' + id : ''), {
        method: id ? 'PATCH' : 'POST',
        body,
      });
      modal.classList.remove('active');
      SinstockUI.notify('Produto salvo.');
      await Promise.all([load(page), summary()]);
    });
  };
  window.addEventListener('sinstock:catalog-changed', () =>
    choices().catch((error) => SinstockUI.notify(error.message)),
  );
  D.message(table, 'Carregando produtos...', 9);
  document.querySelectorAll('.product-summary-card strong').forEach((node) => {
    node.textContent = '—';
  });
  SinstockSession.ready
    .then(async (user) => {
      if (!user) return;
      await Promise.all([load(), summary(), choices()]);
    })
    .catch((error) => SinstockUI.notify(error.message));
})` (1); `SinstockAPI.request` (200); `SinstockAPI.request` (230).

## frontend/js/pages/relatorios.js

Fonte: [frontend/js/pages/relatorios.js](../../frontend/js/pages/relatorios.js). 163 linhas.

**Funções nomeadas:** `$` (linha 4); `readFilters` (linha 8); `format` (linha 24); `load` (linha 34).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  let current = null,
    filters = {},
    sequence = 0;
  function readFilters() {
    if (
      $('startDate').value &&
      $('endDate').value &&
      $('startDate').value > $('endDate').value
    )
      throw new Error('A data inicial deve ser anterior à final.');
    return {
      tipo: $('reportType').value,
      filial_id: $('reportBranch').value,
      categoria_id: $('reportCategory').value,
      data_inicio: $('startDate').value,
      data_fim: $('endDate').value,
      sem_movimento_dias: Number($('reportIdleDays').value || 30),
    };
  }
  function format(value, column) {
    if (value === null || value === undefined) return '—';
    if (column.format === 'money') return D.money(value);
    if (column.format === 'number') return D.number(value);
    if (column.format === 'date')
      return column.key === 'validade'
        ? value.slice(0, 10).split('-').reverse().join('/')
        : new Date(value).toLocaleString('pt-BR');
    return value;
  }
  async function load(pagina = 1) {
    const callId = ++sequence;
    $('reportError').textContent = '';
    try {
      const result = await D.get('/relatorios', {
        ...filters,
        pagina,
        limite: D.pageSize(20),
      });
      if (callId !== sequence) return;
      current = result;
      $('reportTitle').textContent = result.titulo;
      $('reportContext').textContent = result.contexto;
      const table = $('liveReportTable');
      table.querySelector('thead').innerHTML =
        '<tr>' +
        result.colunas
          .map((column) => '<th>' + D.text(column.header) + '</th>')
          .join('') +
        '</tr>';
      table.querySelector('tbody').innerHTML = result.dados
        .map(
          (row) =>
            '<tr>' +
            result.colunas
              .map(
                (column) =>
                  '<td>' + D.text(format(row[column.key], column)) + '</td>',
              )
              .join('') +
            '</tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message(
          table.querySelector('tbody'),
          'Nenhum registro encontrado para os filtros.',
          result.colunas.length,
        );
      $('reportCount').textContent =
        result.meta.total + ' registros encontrados';
      D.paginate($('reportPagination'), result, load);
    } catch (error) {
      if (callId === sequence) $('reportError').textContent = error.message;
    }
  }
  $('applyReportFilters').onclick = () => {
    try {
      filters = readFilters();
      load();
    } catch (error) {
      $('reportError').textContent = error.message;
    }
  };
  $('clearReportFilters').onclick = () => {
    ['reportBranch', 'reportCategory', 'startDate', 'endDate'].forEach((id) => {
      $(id).value = '';
    });
    $('reportIdleDays').value = 30;
    filters = readFilters();
    load();
  };
  $('exportReport').onclick = async () => {
    const button = $('exportReport');
    button.disabled = true;
    $('reportError').textContent = '';
    try {
      // Export uses the applied filter snapshot, identical to the table query.
      const values = { ...filters, formato: $('reportFormat').value };
      const params = new URLSearchParams(
        Object.entries(values).filter(
          ([, value]) => value !== '' && value !== undefined,
        ),
      );
      const result = await SinstockAPI.request(
        '/relatorios/exportar?' + params,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(result.blob),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'sinstock-' + filters.tipo + '.' + values.formato;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      $('reportError').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
  $('printReport').onclick = () => {
    if (!current) return;
    SinstockUI.notify(
      'A impressão usa a página atual. Para o relatório completo, exporte em PDF.',
    );
    window.print();
  };
  SinstockSession.ready
    .then(async (user) => {
      if (!user) return;
      const [branches, categories] = await Promise.all([
        D.get('/filiais'),
        D.get('/categorias'),
      ]);
      D.options(
        $('reportBranch'),
        D.rows(branches),
        (item) => item.nome,
        'Todas as filiais',
      );
      D.options(
        $('reportCategory'),
        D.rows(categories),
        (item) => item.nome,
        'Todas as categorias',
      );
      $('startDate').value = new Date(
        Date.now() - 30 * 86400000,
      ).toLocaleDateString('en-CA');
      $('endDate').value = new Date().toLocaleDateString('en-CA');
      filters = readFilters();
      await load();
    })
    .catch((error) => {
      $('reportError').textContent = error.message;
    });
})` (1); `SinstockAPI.request` (108).

## frontend/js/pages/vendas.js

Fonte: [frontend/js/pages/vendas.js](../../frontend/js/pages/vendas.js). 178 linhas.

**Funções nomeadas:** `$` (linha 5); `filter` (linha 8); `list` (linha 32); `summary` (linha 75); `refresh` (linha 129).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `$('salesSearch')` | 'input' | 143 |
| `window` | 'sinstock:commerce-changed' | 157 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/services/commerce.js

Fonte: [frontend/js/services/commerce.js](../../frontend/js/services/commerce.js). 370 linhas.

**Funções nomeadas:** `open` (linha 23); `$` (linha 66); `productFor` (linha 78); `total` (linha 84); `add` (linha 106); `balance` (linha 120); `catalog` (linha 174); `details` (linha 262); `action` (linha 341).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const D = SinstockData,
    statuses = {
      ORCAMENTO: 'Reservado',
      CONCLUIDO: 'Confirmado',
      CANCELADO: 'Cancelado',
    };
  const payments = {
    PIX: 'PIX',
    DINHEIRO: 'Dinheiro',
    CREDITO: 'Crédito',
    DEBITO: 'Débito',
    BOLETO: 'Boleto',
    OUTRO: 'Outro',
  };
  const delivery = {
    PENDENTE: 'Pendente',
    EM_SEPARACAO: 'Em separação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
  };
  async function open(mode = 'sale', selectedBranch) {
    const reserve = mode === 'reserve';
    const overlay = D.dialog(
      reserve ? 'Novo pedido com reserva' : 'Nova venda',
      '<p role="status">Carregando cadastros e disponibilidade...</p>',
    );
    overlay.id = reserve ? 'orderModal' : 'saleModal';
    try {
      const [branches, clients] = await Promise.all([
        D.get('/filiais'),
        D.all('/clientes'),
      ]);
      if (!overlay.isConnected) return;
      const content = overlay.querySelector('.catalog-content');
      content.innerHTML =
        '<form id="' +
        (reserve ? 'orderForm' : 'newSaleForm') +
        '">' +
        '<div class="commerce-grid"><label>Filial *<select id="saleBranch" required></select></label><label>Cliente<select id="saleCustomer"></select></label></div>' +
        '<div class="catalog-tools"><button type="button" data-catalog="clientes">Gerenciar clientes</button></div>' +
        '<label>Código de barras<input id="saleBarcode" inputmode="numeric" placeholder="Digite ou escaneie e pressione Enter"></label><button type="button" id="scanSaleBarcode">Ler pela câmera</button>' +
        '<p class="catalog-note">Escolha o produto e o lote. A disponibilidade é conferida novamente pelo servidor.</p>' +
        '<div id="saleProducts"></div><button type="button" id="addSaleProduct">Adicionar produto</button>' +
        '<div class="commerce-grid"><label>Desconto (R$)<input type="number" id="saleDiscount" value="0" min="0" step="0.01"></label>' +
        '<label>Pagamento<select id="salePayment"' +
        (reserve ? '' : ' required') +
        '><option value="">Selecione</option>' +
        Object.entries(payments)
          .map(
            ([key, text]) =>
              '<option value="' + key + '">' + text + '</option>',
          )
          .join('') +
        '</select></label></div>' +
        (reserve
          ? '<label>Reserva válida por (minutos)<input id="saleExpiration" type="number" min="1" max="1440" value="15" required></label>'
          : '') +
        '<label>Observação<textarea id="saleObservation" maxlength="1000"></textarea></label>' +
        '<div class="sale-summary-box"><p>Subtotal: <strong id="saleSubtotal">R$ 0,00</strong></p><p>Total: <strong id="saleTotal">R$ 0,00</strong></p></div>' +
        '<div class="catalog-actions"><button type="button" data-cancel>Cancelar</button><button type="submit">' +
        (reserve ? 'Reservar estoque' : 'Finalizar venda') +
        '</button></div></form>';
      const form = content.querySelector('form'),
        $ = (selector) => form.querySelector(selector);
      D.options($('#saleBranch'), D.rows(branches), (item) => item.nome);
      $('#saleBranch').value = selectedBranch || D.rows(branches)[0]?.id || '';
      D.options(
        $('#saleCustomer'),
        clients,
        (item) => item.nome,
        'Consumidor não identificado',
      );
      $('[data-cancel]').onclick = () => overlay.remove();
      let products = [],
        sequence = 0;
      const productFor = (row) =>
        products.find(
          (product) =>
            product.id ===
            Number(row.querySelector('.sale-product-select').value),
        );
      function total() {
        const subtotalMilliCents = [
          ...form.querySelectorAll('.sale-product-row'),
        ].reduce(
          (sum, row) =>
            sum +
            Math.round(Number(productFor(row)?.preco_venda || 0) * 100) *
              Math.round(
                Number(row.querySelector('.sale-product-quantity').value) *
                  1000,
              ),
          0,
        );
        const subtotalCents = Math.floor((subtotalMilliCents + 500) / 1000);
        $('#saleSubtotal').textContent = D.money(subtotalCents / 100);
        $('#saleTotal').textContent = D.money(
          Math.max(
            0,
            subtotalCents - Math.round(Number($('#saleDiscount').value) * 100),
          ) / 100,
        );
      }
      function add(productId) {
        const row = document.createElement('div');
        row.className = 'sale-product-row commerce-product-row';
        row.innerHTML =
          '<label>Produto *<select class="sale-product-select" required></select></label><label>Lote<select class="sale-lot-select"></select></label>' +
          '<label>Quantidade *<input class="sale-product-quantity" type="number" min="0.001" step="0.001" value="1" required></label>' +
          '<div class="sale-product-price"></div><button type="button" class="remove-sale-product" aria-label="Remover produto">Remover</button>';
        const select = row.querySelector('.sale-product-select'),
          lots = row.querySelector('.sale-lot-select');
        D.options(
          select,
          products,
          (item) => item.nome + ' · ' + D.money(item.preco_venda),
        );
        function balance() {
          const item = productFor(row),
            stock = item?.saldos_estoque.find(
              (saldo) => (saldo.lote_id || '') === (Number(lots.value) || ''),
            );
          row.querySelector('.sale-product-price').textContent =
            D.money(item?.preco_venda) +
            ' · Disponível: ' +
            D.number(
              Number(stock?.quantidade || 0) -
                Number(stock?.quantidade_reservada || 0),
            );
          total();
        }
        select.onchange = () => {
          const product = productFor(row);
          const available = (product?.saldos_estoque || [])
            .filter(
              (saldo) =>
                Number(saldo.quantidade) - Number(saldo.quantidade_reservada) >
                0,
            )
            .sort((a, b) =>
              String(a.lotes?.data_validade || '9999').localeCompare(
                String(b.lotes?.data_validade || '9999'),
              ),
            );
          lots.replaceChildren(
            ...available.map(
              (saldo) =>
                new Option(
                  saldo.lotes
                    ? saldo.lotes.numero_lote +
                        ' · ' +
                        saldo.lotes.data_validade.slice(0, 10)
                    : 'Sem lote',
                  saldo.lote_id || '',
                ),
            ),
          );
          if (!available.length)
            lots.add(new Option('Sem saldo disponível', ''));
          balance();
        };
        lots.onchange = balance;
        row.querySelector('.sale-product-quantity').oninput = total;
        row.querySelector('[aria-label="Remover produto"]').onclick = () => {
          row.remove();
          total();
        };
        $('#saleProducts').append(row);
        if (productId) select.value = productId;
        select.onchange();
      }
      async function catalog() {
        const current = ++sequence;
        const data = await D.all('/produtos', {
          filial_id: Number($('#saleBranch').value) || undefined,
          ativo: true,
        });
        if (current !== sequence || !overlay.isConnected) return;
        products = data;
        $('#saleProducts').replaceChildren();
        add();
      }
      $('#saleBranch').onchange = () =>
        catalog().catch((error) => SinstockUI.notify(error.message));
      $('#addSaleProduct').onclick = () => add();
      $('#saleDiscount').oninput = total;
      $('#saleBarcode').onkeydown = async (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        try {
          const product = await D.get(
            '/produtos/codigo-barras/' +
              encodeURIComponent(event.target.value.trim()),
            { filial_id: Number($('#saleBranch').value) },
          );
          const empty = [...form.querySelectorAll('.sale-product-row')].find(
            (row) => !row.querySelector('.sale-product-select').value,
          );
          if (empty) empty.remove();
          add(product.id);
          event.target.value = '';
        } catch (error) {
          SinstockUI.notify(error.message);
        }
      };
      $('#scanSaleBarcode').onclick = () =>
        SinstockScanner.scan((code) => {
          $('#saleBarcode').value = code;
          $('#saleBarcode').dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
          );
        });
      form.onsubmit = (event) => {
        event.preventDefault();
        D.saving(form, async () => {
          const rows = [...form.querySelectorAll('.sale-product-row')];
          if (!rows.length) throw new Error('Adicione pelo menos um produto.');
          const items = rows.map((row) => {
            const product = productFor(row);
            if (!product) throw new Error('Selecione os produtos do pedido.');
            return {
              produto_id: product.id,
              lote_id:
                Number(row.querySelector('.sale-lot-select').value) ||
                undefined,
              quantidade: Number(
                row.querySelector('.sale-product-quantity').value,
              ),
              preco_unitario: Number(product.preco_venda),
            };
          });
          await SinstockAPI.request(
            reserve ? '/pedidos/reservar' : '/pedidos/checkout',
            {
              method: 'POST',
              body: {
                filial_id: Number($('#saleBranch').value),
                cliente_id: Number($('#saleCustomer').value) || undefined,
                itens: items,
                pagamento: $('#salePayment').value || undefined,
                desconto: Number($('#saleDiscount').value),
                observacao: $('#saleObservation').value,
                ...(reserve
                  ? { minutos_expiracao: Number($('#saleExpiration').value) }
                  : {}),
              },
            },
          );
          overlay.remove();
          SinstockUI.notify(reserve ? 'Reserva criada.' : 'Venda concluída.');
          window.dispatchEvent(new Event('sinstock:commerce-changed'));
        });
      };
      await catalog();
    } catch (error) {
      if (overlay.isConnected)
        overlay.querySelector('.catalog-content').textContent = error.message;
    }
  }
  async function details(id) {
    const order = await D.get('/pedidos/' + id),
      reserved = order.status === 'ORCAMENTO';
    const expired = reserved && new Date(order.reservado_ate) <= new Date();
    const overlay = D.dialog(
      'Pedido #' + id,
      '<p>' +
        D.text(order.clientes?.nome || 'Consumidor não identificado') +
        ' · ' +
        D.text(order.filiais.nome) +
        '</p><p>Status comercial: ' +
        statuses[order.status] +
        '</p>' +
        (reserved
          ? '<p>Reserva até: ' +
            D.text(new Date(order.reservado_ate).toLocaleString('pt-BR')) +
            (expired ? ' (expirada)' : '') +
            '</p>'
          : '') +
        '<div class="catalog-table-container"><table><thead><tr><th>Produto</th><th>Lote</th><th>Quantidade</th><th>Preço</th></tr></thead><tbody>' +
        order.itens_venda
          .map(
            (item) =>
              '<tr><td>' +
              D.text(item.produtos.nome) +
              '</td><td>' +
              D.text(item.lotes?.numero_lote || 'Sem lote') +
              '</td><td>' +
              D.number(item.quantidade) +
              '</td><td>' +
              D.money(item.preco_unitario) +
              '</td></tr>',
          )
          .join('') +
        '</tbody></table></div>' +
        '<p>Pagamento: ' +
        D.text(payments[order.pagamento] || 'Não informado') +
        ' · Desconto: ' +
        D.money(order.desconto) +
        ' · Total: ' +
        D.money(order.total) +
        '</p>' +
        '<p>' +
        D.text(order.observacao || '') +
        '</p>' +
        (order.status === 'CONCLUIDO'
          ? '<form><label>Atendimento / entrega<select name="atendimento">' +
            Object.entries(delivery)
              .map(
                ([key, text]) =>
                  '<option value="' + key + '">' + text + '</option>',
              )
              .join('') +
            '</select></label><button type="submit">Atualizar atendimento</button></form>'
          : '') +
        '<div class="catalog-actions">' +
        (reserved && !expired
          ? '<button type="button" data-confirm>Confirmar reserva</button>'
          : '') +
        (order.status !== 'CANCELADO'
          ? '<button type="button" data-cancel-order>Cancelar pedido</button>'
          : '') +
        '</div><p role="alert" data-detail-error></p>',
    );
    const update = overlay.querySelector('form');
    if (update) {
      update.elements.atendimento.value = order.atendimento;
      update.onsubmit = (event) => {
        event.preventDefault();
        D.saving(update, async () => {
          await SinstockAPI.request('/pedidos/' + id + '/atendimento', {
            method: 'PATCH',
            body: { atendimento: update.elements.atendimento.value },
          });
          overlay.remove();
          window.dispatchEvent(new Event('sinstock:commerce-changed'));
        });
      };
    }
    async function action(button, endpoint) {
      button.disabled = true;
      try {
        await SinstockAPI.request('/pedidos/' + id + endpoint, {
          method: 'PATCH',
        });
        overlay.remove();
        window.dispatchEvent(new Event('sinstock:commerce-changed'));
      } catch (error) {
        button.disabled = false;
        overlay.querySelector('[data-detail-error]').textContent =
          error.message;
      }
    }
    const confirm = overlay.querySelector('[data-confirm]'),
      cancel = overlay.querySelector('[data-cancel-order]');
    if (confirm) confirm.onclick = () => action(confirm, '/confirmar');
    if (cancel)
      cancel.onclick = () => {
        if (
          window.confirm(
            'Cancelar este pedido e reverter seu efeito no estoque?',
          )
        )
          action(cancel, '/cancelar');
      };
  }
  window.SinstockCommerce = { open, details, statuses, payments, delivery };
})` (1); `SinstockAPI.request` (234); `SinstockAPI.request` (332); `SinstockAPI.request` (344).

**Controles criados em templates:** `' +
        (reserve ? 'orderForm' : 'newSaleForm') +
        '`, `saleBranch`, `saleCustomer`, `saleBarcode`, `scanSaleBarcode`, `addSaleProduct`, `saleDiscount`, `salePayment`, `saleExpiration`, `saleObservation`.

## frontend/js/services/data.js

Fonte: [frontend/js/services/data.js](../../frontend/js/services/data.js). 149 linhas.

**Funções nomeadas:** `query` (linha 3); `get` (linha 11); `pageSize` (linha 12); `quantities` (linha 14); `rows` (linha 23); `meta` (linha 25); `all` (linha 31); `text` (linha 41); `money` (linha 42); `number` (linha 47); `message` (linha 49); `options` (linha 57); `paginate` (linha 65); `debounce` (linha 81); `saving` (linha 88); `dialog` (linha 111).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `prev` | 'click' | 77 |
| `next` | 'click' | 78 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const query = (values) => {
    const result = new URLSearchParams();
    Object.entries(values || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '')
        result.set(key, String(value));
    });
    return result.size ? '?' + result : '';
  };
  const get = (path, filters) => SinstockAPI.request(path + query(filters));
  const pageSize = (fallback = 10) =>
    window.SinstockSession?.user?.preferencias?.itens_por_pagina || fallback;
  const quantities = (rows, reserved = false) =>
    rows.reduce(
      (sum, row) =>
        sum +
        Math.round(
          Number(row[reserved ? 'quantidade_reservada' : 'quantidade']) * 1000,
        ),
      0,
    ) / 1000;
  const rows = (result) =>
    Array.isArray(result) ? result : result?.dados || result?.data || [];
  const meta = (result) => ({
    total:
      result?.meta?.total ?? result?.meta?.totalItems ?? rows(result).length,
    pagina: result?.meta?.pagina ?? result?.meta?.currentPage ?? 1,
    paginas: result?.meta?.totalPages ?? 1,
  });
  async function all(path, filters = {}) {
    const data = [];
    for (let pagina = 1; pagina <= 1000; pagina++) {
      const response = await get(path, { ...filters, pagina, limite: 100 });
      data.push(...rows(response));
      if (Array.isArray(response) || pagina >= meta(response).paginas)
        return data;
    }
    throw new Error('Refine a consulta para carregar as opções.');
  }
  const text = (value) => SinstockUI.escape(value ?? '');
  const money = (value) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  const number = (value) =>
    Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  function message(container, value, columns = 1) {
    container.innerHTML =
      '<tr><td colspan="' +
      columns +
      '" role="status">' +
      text(value) +
      '</td></tr>';
  }
  function options(select, data, label, empty = 'Selecione') {
    const previous = select.value;
    select.replaceChildren(
      new Option(empty, ''),
      ...data.map((item) => new Option(label(item), item.id)),
    );
    select.value = previous;
  }
  function paginate(container, result, load) {
    const info = meta(result);
    const prev = document.createElement('button'),
      next = document.createElement('button'),
      label = document.createElement('span');
    prev.type = next.type = 'button';
    prev.textContent = 'Anterior';
    next.textContent = 'Próxima';
    prev.disabled = info.pagina <= 1;
    next.disabled = info.pagina >= info.paginas;
    label.textContent =
      'Página ' + info.pagina + ' de ' + Math.max(1, info.paginas);
    prev.addEventListener('click', () => load(info.pagina - 1));
    next.addEventListener('click', () => load(info.pagina + 1));
    container.replaceChildren(prev, label, next);
  }
  function debounce(fn) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, 300);
    };
  }
  async function saving(form, work) {
    if (form.dataset.saving) return;
    form.dataset.saving = 'true';
    const button = form.querySelector('[type="submit"]');
    if (button) button.disabled = true;
    let alert = form.querySelector('[data-form-error]');
    if (!alert) {
      alert = document.createElement('p');
      alert.dataset.formError = '';
      alert.setAttribute('role', 'alert');
      form.append(alert);
    }
    alert.textContent = '';
    try {
      await work();
    } catch (error) {
      alert.textContent = error.message;
      SinstockUI.notify(error.message);
    } finally {
      delete form.dataset.saving;
      if (button) button.disabled = false;
    }
  }
  function dialog(title, content) {
    document
      .querySelectorAll('[data-api-dialog]')
      .forEach((node) => node.remove());
    const overlay = document.createElement('div');
    overlay.dataset.apiDialog = '';
    overlay.className = 'catalog-modal-overlay active';
    overlay.innerHTML =
      '<div class="product-modal"><div class="product-modal-header"><h2>' +
      text(title) +
      '</h2><button type="button" data-close aria-label="Fechar">Fechar</button></div><div class="catalog-content">' +
      content +
      '</div></div>';
    overlay.querySelector('[data-close]').onclick = () => overlay.remove();
    overlay.onclick = (event) => {
      if (event.target === overlay) overlay.remove();
    };
    document.body.append(overlay);
    return overlay;
  }
  window.SinstockData = {
    get,
    rows,
    meta,
    all,
    text,
    money,
    number,
    message,
    options,
    paginate,
    debounce,
    saving,
    dialog,
    pageSize,
    quantities,
  };
})` (1); `SinstockAPI.request` (11).

## frontend/js/shared/catalogs.js

Fonte: [frontend/js/shared/catalogs.js](../../frontend/js/shared/catalogs.js). 203 linhas.

**Funções nomeadas:** `open` (linha 29); `load` (linha 83).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `search` | 'input' | 136 |
| `document` | 'click' | 195 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  const schemas = {
    categorias: {
      title: 'Categorias',
      fields: [
        ['nome', 'Nome', true],
        ['descricao', 'Descrição'],
      ],
    },
    filiais: {
      title: 'Filiais',
      fields: [
        ['nome', 'Nome', true],
        ['endereco', 'Endereço'],
      ],
    },
    clientes: {
      title: 'Clientes',
      fields: [
        ['nome', 'Nome', true],
        ['cpf_cnpj', 'CPF/CNPJ'],
        ['telefone', 'Telefone'],
        ['email', 'E-mail', false, 'email'],
      ],
    },
  };
  let overlay;
  async function open(resource) {
    const D = SinstockData,
      schema = schemas[resource];
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.className = 'product-modal-overlay active catalog-modal-overlay';
    overlay.innerHTML =
      '<div class="product-modal"><div class="product-modal-header"><h2>' +
      schema.title +
      '</h2><button type="button" data-close aria-label="Fechar">Fechar</button></div>' +
      '<div class="catalog-content"><form id="catalogForm"><input type="hidden" name="id">' +
      schema.fields
        .map(
          ([name, label, required, type]) =>
            '<div class="product-form-group"><label for="catalog-' +
            name +
            '">' +
            label +
            (required ? ' *' : '') +
            '</label><input id="catalog-' +
            name +
            '" name="' +
            name +
            '" type="' +
            (type || 'text') +
            '"' +
            (required ? ' required' : '') +
            '></div>',
        )
        .join('') +
      '<div class="catalog-actions"><button type="submit" class="save-product-button">Salvar</button><button type="button" data-new>Novo cadastro</button></div></form>' +
      '<label for="catalogSearch">Buscar</label><input id="catalogSearch" type="search" placeholder="Buscar cadastro">' +
      '<div class="catalog-table-container"><table><thead><tr><th>Nome</th><th>Informações</th><th>Ações</th></tr></thead><tbody></tbody></table></div>' +
      '<div class="catalog-pagination"></div></div></div>';
    document.body.append(overlay);
    const current = overlay,
      form = current.querySelector('form'),
      body = current.querySelector('tbody'),
      search = current.querySelector('#catalogSearch');
    const readonly =
      resource === 'filiais' && SinstockSession.user?.perfil_id !== 1;
    form.hidden = readonly;
    current.querySelector('[data-close]').onclick = () =>
      current.classList.remove('active');
    current.onclick = (event) => {
      if (event.target === current) current.classList.remove('active');
    };
    current.querySelector('[data-new]').onclick = () => {
      form.reset();
      form.elements.id.value = '';
      form.elements.nome.focus();
    };
    let sequence = 0,
      entries = [];
    async function load(pagina = 1) {
      const callId = ++sequence;
      D.message(body, 'Carregando...', 3);
      try {
        const response = await D.get('/' + resource, {
          busca: search.value,
          pagina,
          limite: D.pageSize(),
        });
        if (callId !== sequence || !current.isConnected) return;
        entries = D.rows(response);
        const visible =
          resource === 'clientes'
            ? entries
            : entries.filter((item) =>
                JSON.stringify(item)
                  .toLocaleLowerCase('pt-BR')
                  .includes(search.value.toLocaleLowerCase('pt-BR')),
              );
        body.innerHTML = visible
          .map(
            (item) =>
              '<tr><td>' +
              D.text(item.nome) +
              '</td><td>' +
              D.text(
                item.email ||
                  item.endereco ||
                  item.descricao ||
                  item.telefone ||
                  '—',
              ) +
              '</td><td>' +
              (readonly
                ? 'Consulta'
                : '<button type="button" data-edit="' +
                  item.id +
                  '">Editar</button> <button type="button" data-delete="' +
                  item.id +
                  '">Excluir</button>') +
              '</td></tr>',
          )
          .join('');
        if (!visible.length) D.message(body, 'Nenhum cadastro encontrado.', 3);
        D.paginate(
          current.querySelector('.catalog-pagination'),
          response,
          load,
        );
      } catch (error) {
        if (callId === sequence) D.message(body, error.message, 3);
      }
    }
    search.addEventListener(
      'input',
      D.debounce(() => load()),
    );
    body.onclick = async (event) => {
      const edit = event.target.closest('[data-edit]'),
        remove = event.target.closest('[data-delete]');
      if (edit) {
        const item = entries.find(
          (row) => row.id === Number(edit.dataset.edit),
        );
        form.elements.id.value = item.id;
        schema.fields.forEach(([name]) => {
          form.elements[name].value = item[name] ?? '';
        });
        form.elements.nome.focus();
      }
      if (
        remove &&
        confirm('Excluir este cadastro? Registros vinculados são preservados.')
      ) {
        remove.disabled = true;
        try {
          await SinstockAPI.request(
            '/' + resource + '/' + remove.dataset.delete,
            { method: 'DELETE' },
          );
          await load();
          window.dispatchEvent(new Event('sinstock:catalog-changed'));
        } catch (error) {
          SinstockUI.notify(error.message);
          remove.disabled = false;
        }
      }
    };
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const id = form.elements.id.value,
          values = {};
        schema.fields.forEach(([name]) => {
          const value = form.elements[name].value.trim();
          if (value) values[name] = value;
          else if (id) values[name] = null;
        });
        await SinstockAPI.request('/' + resource + (id ? '/' + id : ''), {
          method: id ? 'PATCH' : 'POST',
          body: values,
        });
        form.reset();
        form.elements.id.value = '';
        await load();
        SinstockUI.notify('Cadastro salvo.');
        window.dispatchEvent(new Event('sinstock:catalog-changed'));
      });
    };
    await load();
  }
  window.SinstockCatalogs = { open };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-catalog]');
    if (button && schemas[button.dataset.catalog])
      open(button.dataset.catalog).catch((error) =>
        SinstockUI.notify(error.message),
      );
  });
})` (1); `SinstockAPI.request` (159); `SinstockAPI.request` (181).

**Controles criados em templates:** `catalogForm`, `catalog-' +
            name +
            '`, `catalogSearch`.

## frontend/js/shared/connected.js

Fonte: [frontend/js/shared/connected.js](../../frontend/js/shared/connected.js). 184 linhas.

**Funções nomeadas:** `setBadge` (linha 9); `unread` (linha 16); `notifications` (linha 23).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 3 |
| `search` | 'keydown' | 93 |
| `window` | 'focus' | 179 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const D = SinstockData,
      search = document.querySelector('.search-box input'),
      bell = document.querySelector('.notification');
    if (!search && !bell) return;
    let ready = false;
    function setBadge(count) {
      const badge = bell?.querySelector('.notification-number');
      if (badge) {
        badge.hidden = !count;
        badge.textContent = count > 99 ? '99+' : count;
      }
    }
    async function unread() {
      try {
        setBadge((await D.get('/notificacoes', { limite: 1 })).nao_lidas);
      } catch {
        /* The drawer displays connection errors when opened. */
      }
    }
    async function notifications(pagina = 1, overlay) {
      overlay ||= D.dialog('Notificações', '<p>Carregando...</p>');
      const content = overlay.querySelector('.catalog-content');
      try {
        const result = await D.get('/notificacoes', {
          pagina,
          limite: D.pageSize(),
        });
        if (!overlay.isConnected) return;
        setBadge(result.nao_lidas);
        content.innerHTML =
          (SinstockSession.user?.perfil_id === 1
            ? '<div class="catalog-tools"><button type="button" data-scan>Atualizar alertas</button></div>'
            : '') +
          '<div class="notification-list">' +
          result.dados
            .map(
              (item) =>
                '<article><strong>' +
                D.text(item.titulo) +
                '</strong><p>' +
                D.text(item.mensagem) +
                '</p><small>' +
                D.text(new Date(item.criado_em).toLocaleString('pt-BR')) +
                '</small>' +
                (item.lida
                  ? '<span> · Lida</span>'
                  : '<button type="button" data-read="' +
                    item.id +
                    '">Marcar como lida</button>') +
                '</article>',
            )
            .join('') +
          (result.dados.length
            ? ''
            : '<p>Nenhuma notificação encontrada.</p>') +
          '</div><div class="catalog-pagination"></div>';
        D.paginate(
          content.querySelector('.catalog-pagination'),
          result,
          (page) => notifications(page, overlay),
        );
        content.onclick = async (event) => {
          const read = event.target.closest('[data-read]'),
            scan = event.target.closest('[data-scan]');
          if (!read && !scan) return;
          const button = read || scan;
          button.disabled = true;
          try {
            await SinstockAPI.request(
              read
                ? '/notificacoes/' + read.dataset.read + '/ler'
                : '/notificacoes/executar-varredura',
              { method: read ? 'PATCH' : 'POST' },
            );
            await notifications(pagina, overlay);
          } catch (error) {
            button.disabled = false;
            SinstockUI.notify(error.message);
          }
        };
      } catch (error) {
        content.textContent = error.message;
      }
    }
    if (bell)
      bell.onclick = () => {
        if (ready) notifications();
      };
    if (search)
      search.addEventListener('keydown', async (event) => {
        if (event.key !== 'Enter' || !ready) return;
        event.preventDefault();
        const term = search.value.trim();
        if (term.length < 2) {
          SinstockUI.notify('Digite pelo menos dois caracteres.');
          return;
        }
        const overlay = D.dialog('Busca: ' + term, '<p>Pesquisando...</p>');
        try {
          const data = await D.get('/busca-global', {
            termo: term,
            limite: D.pageSize(),
          });
          const groups = [
            [
              'Produtos',
              data.resultados.produtos,
              (item) => [
                item.nome,
                'produtos.html?busca=' +
                  encodeURIComponent(item.codigo_barras || item.nome),
              ],
            ],
            [
              'Fornecedores',
              data.resultados.fornecedores,
              (item) => [
                item.nome_juridico,
                'fornecedores.html?busca=' + encodeURIComponent(item.cnpj),
              ],
            ],
            [
              'Lotes',
              data.resultados.lotes,
              (item) => [
                item.numero_lote + ' · ' + item.produto_nome,
                'estoque.html?busca=' + encodeURIComponent(item.produto_nome),
              ],
            ],
            [
              'Documentos',
              data.resultados.notas_fiscais,
              (item) => [
                item.numero_nf + ' · ' + item.fornecedor_nome,
                'estoque.html?nota=' +
                  encodeURIComponent(item.numero_nf) +
                  (item.filial_id ? '&filial_id=' + item.filial_id : ''),
              ],
            ],
          ];
          if (overlay.isConnected)
            overlay.querySelector('.catalog-content').innerHTML = groups
              .map(
                ([name, items, link]) =>
                  '<h3>' +
                  name +
                  '</h3>' +
                  (items.length
                    ? '<ul>' +
                      items
                        .map((item) => {
                          const [label, url] = link(item);
                          return (
                            '<li><a href="' +
                            D.text(url) +
                            '">' +
                            D.text(label) +
                            '</a></li>'
                          );
                        })
                        .join('') +
                      '</ul>'
                    : '<p>Nenhum resultado.</p>'),
              )
              .join('');
        } catch (error) {
          if (overlay.isConnected)
            overlay.querySelector('.catalog-content').textContent =
              error.message;
        }
      });
    SinstockSession.ready.then((user) => {
      ready = !!user;
      if (user) unread();
    });
    window.addEventListener('focus', () => {
      if (ready) unread();
    });
  });
})` (1); `SinstockAPI.request` (72).

## frontend/js/shared/layout.js

Fonte: [frontend/js/shared/layout.js](../../frontend/js/shared/layout.js). 33 linhas.

**Funções nomeadas:** `atualizarData` (linha 1).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/shared/scanner.js

Fonte: [frontend/js/shared/scanner.js](../../frontend/js/shared/scanner.js). 79 linhas.

**Funções nomeadas:** `scan` (linha 3); `stop` (linha 19).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/shared/ui.js

Fonte: [frontend/js/shared/ui.js](../../frontend/js/shared/ui.js). 294 linhas.

**Funções nomeadas:** `notify` (linha 9); `escape` (linha 17); `closeMenu` (linha 67); `addMenu` (linha 101); `refreshModals` (linha 172); `focusable` (linha 214); `trapFocus` (linha 223).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 23 |
| `toggle` | 'click' | 76 |
| `close` | 'click' | 85 |
| `backdrop` | 'click' | 86 |
| `window` | 'resize' | 87 |
| `trigger` | 'click' | 120 |
| `document` | 'click' | 136 |
| `element` | 'keydown' | 154 |
| `document` | 'keydown' | 248 |
| `document` | 'keydown' | 278 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.
