(() => {
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
})();
