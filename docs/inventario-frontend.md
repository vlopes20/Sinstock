# Inventário do frontend

Catálogo estático de páginas, funções nomeadas e listeners em 04/11/2026. Callbacks anônimos são localizados pelo listener e linha no JSON complementar.

| Página | Proteção | Abas | Scripts próprios |
|---|---|---|---|
| [frontend/index.html](../frontend/index.html) | public | — | `./js/core/config.js`, `./js/core/api.js`, `./js/auth/session.js`, `./js/auth/login.js` |
| [frontend/pages/ajuda.html](../frontend/pages/ajuda.html) | user | helpCenter, tickets, contact | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/pages/ajuda.js`, `../js/shared/layout.js` |
| [frontend/pages/autenticacao.html](../frontend/pages/autenticacao.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js` |
| [frontend/pages/cadastro.html](../frontend/pages/cadastro.html) | admin | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/forms.js` |
| [frontend/pages/codigo.html](../frontend/pages/codigo.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/mfa.js` |
| [frontend/pages/configuracoes.html](../frontend/pages/configuracoes.html) | user | generalSettings, usersSettings, stockSettings, securitySettings, systemSettings | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/pages/configuracoes.js`, `../js/shared/layout.js` |
| [frontend/pages/dashboard.html](../frontend/pages/dashboard.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/layout.js`, `../js/pages/dashboard.js` |
| [frontend/pages/esquecisenha.html](../frontend/pages/esquecisenha.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/forms.js` |
| [frontend/pages/estoque.html](../frontend/pages/estoque.html) | user | inventory, movements | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/stock-model.js`, `../js/pages/estoque.js`, `../js/shared/layout.js` |
| [frontend/pages/fornecedores.html](../frontend/pages/fornecedores.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/pages/fornecedores.js`, `../js/shared/layout.js` |
| [frontend/pages/login.html](../frontend/pages/login.html) | public | — |  |
| [frontend/pages/pedidos.html](../frontend/pages/pedidos.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/layout.js`, `../js/pages/pedidos.js`, `../js/shared/ui.js` |
| [frontend/pages/produtos.html](../frontend/pages/produtos.html) | user | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/pages/produtos.js`, `../js/shared/layout.js` |
| [frontend/pages/redefinirsenha.html](../frontend/pages/redefinirsenha.html) | public | — | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/auth/forms.js` |
| [frontend/pages/relatorios.html](../frontend/pages/relatorios.html) | user | generalReport, salesReport, stockReport, movementsReport | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/pages/relatorios.js`, `../js/shared/layout.js` |
| [frontend/pages/vendas.html](../frontend/pages/vendas.html) | user | salesOverview, salesHistory | `../js/core/config.js`, `../js/core/api.js`, `../js/auth/session.js`, `../js/shared/ui.js`, `../js/shared/layout.js`, `../js/pages/vendas.js` |

## frontend/js/auth/forms.js

Fonte: [frontend/js/auth/forms.js](../frontend/js/auth/forms.js). 95 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 1 |
| `form` | 'submit' | 39 |

**Chamadas HTTP/armazenamento explícitas:** `SinstockAPI.request` (26); `SinstockAPI.request` (48); `SinstockAPI.request` (58); `SinstockAPI.request` (73).

## frontend/js/auth/login.js

Fonte: [frontend/js/auth/login.js](../frontend/js/auth/login.js). 58 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 1 |
| `document .getElementById('togglePassword')` | 'click' | 7 |
| `form` | 'submit' | 19 |

**Chamadas HTTP/armazenamento explícitas:** `SinstockAPI.request` (29); `sessionStorage.setItem` (42).

## frontend/js/auth/mfa.js

Fonte: [frontend/js/auth/mfa.js](../frontend/js/auth/mfa.js). 59 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | 'DOMContentLoaded' | 1 |
| `input` | 'input' | 13 |
| `input` | 'keydown' | 17 |
| `input` | 'paste' | 21 |
| `form` | 'submit' | 31 |

**Chamadas HTTP/armazenamento explícitas:** `sessionStorage.getItem` (2); `SinstockAPI.request` (43).

## frontend/js/auth/session.js

Fonte: [frontend/js/auth/session.js](../frontend/js/auth/session.js). 139 linhas.

**Funções nomeadas:** `clear` (linha 6); `login` (linha 15); `accept` (linha 22); `renderUser` (linha 29); `verify` (linha 67); `logout` (linha 128).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `logout` | 'click' | 62 |
| `retry` | 'click' | 96 |
| `window` | 'sinstock:unauthorized' | 106 |
| `document` | 'DOMContentLoaded' | 108 |
| `window` | 'pageshow' | 115 |

**Chamadas HTTP/armazenamento explícitas:** `(() => {
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
})` (1); `sessionStorage.removeItem` (8); `localStorage.removeItem` (11); `sessionStorage.setItem` (26); `sessionStorage.getItem` (68); `SinstockAPI.request` (73); `sessionStorage.getItem` (114); `SinstockAPI.request` (130).

## frontend/js/core/api.js

Fonte: [frontend/js/core/api.js](../frontend/js/core/api.js). 70 linhas.

**Funções nomeadas:** `request` (linha 9); `cancel` (linha 19).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `signal` | 'abort' | 20 |

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
})` (1); `sessionStorage.getItem` (14); `fetch` (24).

## frontend/js/core/config.js

Fonte: [frontend/js/core/config.js](../frontend/js/core/config.js). 17 linhas.

**Funções nomeadas:** callbacks anônimos registrados abaixo.

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/ajuda.js

Fonte: [frontend/js/pages/ajuda.js](../frontend/js/pages/ajuda.js). 567 linhas.

**Funções nomeadas:** `filterFAQ` (linha 110); `openTicketModal` (linha 276); `closeTicketModal` (linha 285).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `tab` | "click" | 18 |
| `question` | "click" | 81 |
| `helpSearch` | "input" | 155 |
| `card` | "click" | 180 |
| `document .getElementById( "openTicketModal" )` | "click" | 294 |
| `document .getElementById( "openTicketFromHelp" )` | "click" | 304 |
| `document .getElementById( "openTicketFromTickets" )` | "click" | 314 |
| `document .getElementById( "closeTicketModal" )` | "click" | 324 |
| `document .getElementById( "cancelTicket" )` | "click" | 334 |
| `ticketModal` | "click" | 344 |
| `ticketForm` | "submit" | 371 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/configuracoes.js

Fonte: [frontend/js/pages/configuracoes.js](../frontend/js/pages/configuracoes.js). 562 linhas.

**Funções nomeadas:** `openUserModal` (linha 144); `closeUserModal` (linha 153).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `tab` | "click" | 18 |
| `companyForm` | "submit" | 73 |
| `document .getElementById( "openUserModal" )` | "click" | 162 |
| `document .getElementById( "closeUserModal" )` | "click" | 172 |
| `document .getElementById( "cancelUser" )` | "click" | 182 |
| `userModal` | "click" | 192 |
| `userForm` | "submit" | 219 |
| `document .getElementById( "savePermissions" )` | "click" | 355 |
| `document .getElementById( "stockSettingsForm" )` | "submit" | 375 |
| `document .getElementById( "passwordForm" )` | "submit" | 433 |
| `document .getElementById( "systemForm" )` | "submit" | 496 |
| `document .getElementById( "exportSystemData" )` | "click" | 549 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/dashboard.js

Fonte: [frontend/js/pages/dashboard.js](../frontend/js/pages/dashboard.js). 1107 linhas.

**Funções nomeadas:** `updateCurrentDate` (linha 49); `setActiveSidebarItem` (linha 84); `createNotificationMenu` (linha 237); `positionDropdown` (linha 355); `closeNotificationMenu` (linha 410); `createUserMenu` (linha 430); `closeUserMenu` (linha 528); `logout` (linha 573); `updateChart` (linha 681); `showToast` (linha 1035).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | "DOMContentLoaded" | 5 |
| `document` | "keydown" | 132 |
| `searchInput` | "keydown" | 169 |
| `notification` | "click" | 376 |
| `logoutButton` | "click" | 481 |
| `user` | "click" | 494 |
| `document` | "click" | 545 |
| `window` | "resize" | 557 |
| `periodSelect` | "change" | 967 |
| `item` | "click" | 997 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

**Controles criados em templates:** `dashboardLogout`.

## frontend/js/pages/estoque.js

Fonte: [frontend/js/pages/estoque.js](../frontend/js/pages/estoque.js). 369 linhas.

**Funções nomeadas:** `filterStock` (linha 78); `openModal` (linha 185); `closeModal` (linha 192).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `tab` | "click" | 16 |
| `searchInput` | "input" | 142 |
| `categoryFilter` | "change" | 148 |
| `statusFilter` | "change" | 154 |
| `openModalButton` | "click" | 199 |
| `closeModalButton` | "click" | 205 |
| `cancelMovement` | "click" | 211 |
| `modal` | "click" | 217 |
| `option` | "click" | 247 |
| `movementForm` | "submit" | 303 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/fornecedores.js

Fonte: [frontend/js/pages/fornecedores.js](../frontend/js/pages/fornecedores.js). 381 linhas.

**Funções nomeadas:** `openModal` (linha 35); `closeModal` (linha 70); `filterSuppliers` (linha 128).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `openSupplierModal` | "click" | 60 |
| `closeSupplierModal` | "click" | 79 |
| `cancelSupplier` | "click" | 85 |
| `supplierModal` | "click" | 91 |
| `supplierSearch` | "input" | 191 |
| `supplierCategoryFilter` | "change" | 197 |
| `supplierStatusFilter` | "change" | 203 |
| `supplierCnpj` | "input" | 219 |
| `supplierForm` | "submit" | 272 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/pedidos.js

Fonte: [frontend/js/pages/pedidos.js](../frontend/js/pages/pedidos.js). 2557 linhas.

**Funções nomeadas:** `updateCurrentDate` (linha 60); `setActiveSidebarItem` (linha 94); `normalizeText` (linha 177); `parseDateBR` (linha 191); `getRowStatus` (linha 236); `matchesPeriod` (linha 316); `getFilteredRows` (linha 454); `updateTable` (linha 556); `updateFooter` (linha 652); `createPagination` (linha 686); `createOrderModal` (linha 918); `createProductRow` (linha 1224); `formatCurrency` (linha 1315); `calculateOrderTotal` (linha 1337); `openOrderModal` (linha 1556); `closeOrderModal` (linha 1565); `getNextOrderNumber` (linha 1625); `getInitials` (linha 1665); `changeSummaryCard` (linha 1689); `createActionMenu` (linha 1979); `closeActionMenu` (linha 2046); `updateOrderStatus` (linha 2119); `showToast` (linha 2478).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | "DOMContentLoaded" | 5 |
| `document` | "keydown" | 142 |
| `previous` | "click" | 710 |
| `button` | "click" | 800 |
| `next` | "click" | 836 |
| `orderSearch` | "input" | 868 |
| `statusFilter` | "change" | 884 |
| `periodFilter` | "change" | 900 |
| `orderModal .querySelector( "#addOrderProduct" )` | "click" | 1461 |
| `productsContainer` | "change" | 1475 |
| `productsContainer` | "input" | 1481 |
| `orderModal .querySelector( "#newOrderDiscount" )` | "input" | 1487 |
| `productsContainer` | "click" | 1501 |
| `newOrderButton` | "click" | 1574 |
| `orderModal .querySelector( ".close-order-modal" )` | "click" | 1584 |
| `orderModal .querySelector( ".cancel-order-button" )` | "click" | 1594 |
| `orderModal` | "click" | 1604 |
| `orderModal .querySelector( "#newOrderForm" )` | "submit" | 1729 |
| `tableBody` | "click" | 2063 |
| `document` | "click" | 2300 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

**Controles criados em templates:** `newOrderForm`, `newOrderCustomer`, `addOrderProduct`, `newOrderPayment`, `newOrderDiscount`, `newOrderObservation`.

## frontend/js/pages/produtos.js

Fonte: [frontend/js/pages/produtos.js](../frontend/js/pages/produtos.js). 372 linhas.

**Funções nomeadas:** `openModal` (linha 35); `closeModal` (linha 71); `filterProducts` (linha 133).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `openProductModal` | "click" | 61 |
| `closeProductModal` | "click" | 80 |
| `cancelProduct` | "click" | 86 |
| `productModal` | "click" | 92 |
| `productSearch` | "input" | 217 |
| `categoryFilter` | "change" | 223 |
| `statusFilter` | "change" | 229 |
| `stockFilter` | "change" | 235 |
| `productForm` | "submit" | 245 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/relatorios.js

Fonte: [frontend/js/pages/relatorios.js](../frontend/js/pages/relatorios.js). 312 linhas.

**Funções nomeadas:** `getActiveReportTable` (linha 164).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `tab` | "click" | 18 |
| `document .getElementById( "applyReportFilters" )` | "click" | 88 |
| `document .getElementById( "clearReportFilters" )` | "click" | 140 |
| `document .getElementById( "exportReport" )` | "click" | 183 |
| `document .getElementById( "printReport" )` | "click" | 301 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/pages/vendas.js

Fonte: [frontend/js/pages/vendas.js](../frontend/js/pages/vendas.js). 584 linhas.

**Funções nomeadas:** `filterSales` (linha 76); `openModal` (linha 176); `closeModal` (linha 183); `createProductRow` (linha 235); `formatCurrency` (linha 363); `updateSaleTotal` (linha 376).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `tab` | "click" | 16 |
| `salesSearch` | "input" | 133 |
| `paymentFilter` | "change" | 139 |
| `salesStatusFilter` | "change" | 145 |
| `openSaleModal` | "click" | 190 |
| `closeSaleModal` | "click" | 196 |
| `cancelSale` | "click" | 202 |
| `saleModal` | "click" | 208 |
| `addSaleProduct` | "click" | 310 |
| `saleProducts` | "click" | 320 |
| `saleProducts` | "change" | 467 |
| `saleProducts` | "input" | 473 |
| `saleDiscount` | "input" | 479 |
| `newSaleForm` | "submit" | 495 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/shared/layout.js

Fonte: [frontend/js/shared/layout.js](../frontend/js/shared/layout.js). 33 linhas.

**Funções nomeadas:** `atualizarData` (linha 1).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/shared/stock-model.js

Fonte: [frontend/js/shared/stock-model.js](../frontend/js/shared/stock-model.js). 103 linhas.

**Funções nomeadas:** `seed` (linha 5); `validate` (linha 16); `load` (linha 41); `apply` (linha 51); `saveMovement` (linha 89); `status` (linha 96).

| Alvo do evento | Evento | Linha |
|---|---|---|

**Chamadas HTTP/armazenamento explícitas:** nenhuma.

## frontend/js/shared/ui.js

Fonte: [frontend/js/shared/ui.js](../frontend/js/shared/ui.js). 220 linhas.

**Funções nomeadas:** `notify` (linha 9); `escape` (linha 15); `closeMenu` (linha 65); `addMenu` (linha 103); `refreshModals` (linha 159); `focusable` (linha 182); `trapFocus` (linha 186).

| Alvo do evento | Evento | Linha |
|---|---|---|
| `document` | "DOMContentLoaded" | 21 |
| `toggle` | "click" | 74 |
| `close` | "click" | 83 |
| `backdrop` | "click" | 84 |
| `window` | "resize" | 85 |
| `trigger` | "click" | 122 |
| `document` | "click" | 134 |
| `element` | "keydown" | 144 |
| `search` | "keydown" | 151 |
| `document` | "keydown" | 196 |
| `document` | "keydown" | 212 |

**Chamadas HTTP/armazenamento explícitas:** nenhuma.
