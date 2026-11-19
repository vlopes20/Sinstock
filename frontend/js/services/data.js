(() => {
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
  // Keep the same request on retries, including a reload in the same tab.
  const pendingStockWrites = new Map();
  const hexBytes = (bytes) =>
    Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  async function stockWrite(path, { body, method = 'POST' }) {
    const input = JSON.stringify([
      window.SinstockSession?.user?.id,
      method,
      path,
      body,
    ]);
    const digest = await crypto.subtle?.digest(
      'SHA-256',
      new TextEncoder().encode(input),
    );
    const key = digest
      ? 'sinstock.stock-write.' + hexBytes(new Uint8Array(digest))
      : input;
    const storage = digest ? sessionStorage : pendingStockWrites;
    let request_id = digest ? storage.getItem(key) : storage.get(key);
    if (!request_id) {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 15) | 64;
      bytes[8] = (bytes[8] & 63) | 128;
      const hex = hexBytes(bytes);
      request_id = [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
      ].join('-');
      if (digest) storage.setItem(key, request_id);
      else storage.set(key, request_id);
    }
    const result = await SinstockAPI.request(path, {
      method,
      body: { ...body, request_id },
    });
    if (digest) {
      if (storage.getItem(key) === request_id) storage.removeItem(key);
    } else if (storage.get(key) === request_id) {
      storage.delete(key);
    }
    return result;
  }
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
    stockWrite,
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
})();
