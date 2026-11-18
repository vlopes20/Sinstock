(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id),
    form = $('supplierForm'),
    modal = $('supplierModal'),
    table = $('suppliersTableBody'),
    pagination = document.querySelector('.suppliers-pagination'),
    footer = document.querySelector('.suppliers-footer');
  let addressLookup = 0;
  let summarySequence = 0;
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
    fill('supplierCategoryFilter', 'Todas');
  }
  function open(supplier) {
    if (form.dataset.saving) {
      SinstockUI.notify('Aguarde a conclusão do cadastro em andamento.');
      return;
    }
    ++addressLookup;
    $('locateSupplierAddress').disabled = false;
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
    form.querySelector('[data-form-error]').textContent = '';
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
    const callId = ++summarySequence;
    const nodes = document.querySelectorAll('[data-summary]');
    try {
      const info = await D.get('/fornecedores/resumo');
      if (callId !== summarySequence) return;
      nodes.forEach((node) => {
        node.textContent = D.number(info[node.dataset.summary]);
      });
    } catch (error) {
      if (callId !== summarySequence) return;
      nodes.forEach((node) => {
        node.textContent = '—';
      });
      SinstockUI.notify(error.message);
    }
  }
  async function load(pagina = 1) {
    const callId = ++sequence;
    page = pagina;
    records = [];
    footer.hidden = true;
    $('supplierCount').textContent = '';
    pagination.replaceChildren();
    $('retrySuppliers').hidden = true;
    D.message(table, 'Carregando fornecedores...', 7);
    try {
      const result = await D.get('/fornecedores', {
        pagina,
        limite: D.pageSize(),
        busca: $('supplierSearch').value.trim(),
        categoria: $('supplierCategoryFilter').value,
        ativo: $('supplierStatusFilter').value
          ? $('supplierStatusFilter').value === 'ativo'
          : undefined,
      });
      if (callId !== sequence) return;
      const info = D.meta(result);
      if (pagina > Math.max(1, info.paginas))
        return load(Math.max(1, info.paginas));
      records = D.rows(result);
      table.innerHTML = records
        .map((item) => {
          const name = item.nome_fantasia || item.nome_juridico;
          const legal =
            name !== item.nome_juridico
              ? '<small>' + D.text(item.nome_juridico) + '</small>'
              : '';
          const cnpj = item.cnpj.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5',
          );
          const contact = item.email
            ? '<a href="mailto:' +
              D.text(item.email) +
              '">' +
              D.text(item.contato || item.email) +
              '</a>'
            : D.text(item.contato || (item.telefone ? '' : '—'));
          return `<tr>
          <td><strong>${D.text(name)}</strong>${legal}</td>
          <td data-label="CNPJ">${D.text(cnpj)}</td>
          <td data-label="Categoria">${D.text(item.categoria || '—')}</td>
          <td data-label="Contato">${contact}${item.telefone ? '<small>' + D.text(item.telefone) + '</small>' : ''}</td>
          <td data-label="Cidade">${D.text([item.cidade, item.estado].filter(Boolean).join(' / ') || '—')}</td>
          <td data-label="Status"><span class="supplier-status ${item.ativo ? 'active' : ''}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td><div class="catalog-actions"><button type="button" data-edit="${item.id}">Editar</button><button type="button" data-delete="${item.id}">Excluir</button></div></td>
        </tr>`;
        })
        .join('');
      if (!records.length) D.message(table, 'Nenhum fornecedor encontrado.', 7);
      $('supplierCount').textContent =
        info.total === 1
          ? '1 fornecedor encontrado'
          : D.number(info.total) + ' fornecedores encontrados';
      if (info.paginas > 1) D.paginate(pagination, result, load);
      footer.hidden = false;
    } catch (error) {
      if (callId !== sequence) return;
      D.message(table, error.message, 7);
      $('retrySuppliers').hidden = false;
      footer.hidden = false;
    }
  }
  $('retrySuppliers').onclick = () => load(page);
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
      load(page);
      summary();
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
    const address = () => ({
      logradouro: $('supplierAddress').value.trim(),
      cidade: $('supplierCity').value.trim(),
      uf: $('supplierState').value,
    });
    const query = address();
    const callId = ++addressLookup;
    button.disabled = true;
    try {
      const coords = await D.get('/integracoes/coordenadas', query);
      if (callId !== addressLookup || !modal.classList.contains('active'))
        return;
      const latest = address();
      if (Object.keys(query).some((key) => latest[key] !== query[key])) {
        SinstockUI.notify(
          'O endereço mudou. Localize o novo endereço para preencher as coordenadas.',
        );
        return;
      }
      if (coords.lat == null || coords.lon == null)
        throw new Error(
          'Endereço não localizado. Você pode informar as coordenadas manualmente.',
        );
      $('supplierLatitude').value = Number(coords.lat).toFixed(8);
      $('supplierLongitude').value = Number(coords.lon).toFixed(8);
      SinstockUI.notify(
        'Coordenadas preenchidas. Confira o endereço e salve o cadastro.',
      );
    } catch (error) {
      if (callId === addressLookup && modal.classList.contains('active'))
        SinstockUI.notify(error.message);
    } finally {
      if (callId === addressLookup) button.disabled = false;
    }
  };
  $('openNearbyModal').onclick = () => {
    const overlay = D.dialog(
      'Fornecedores próximos',
      `<form id="nearbyForm">
        <div class="commerce-grid"><label>Cidade<input name="cidade" maxlength="100"></label>
        <label>CEP<input name="cep" inputmode="numeric" maxlength="9" pattern="[0-9]{5}-?[0-9]{3}" placeholder="00000-000"></label></div>
        <button type="submit">Buscar por cidade ou CEP</button>
      </form>
      <form id="nearbyGpsForm">
        <label>Raio para GPS (km)<input name="raio" type="number" required min="0.1" max="500" step="0.1" value="50"></label>
        <button type="submit" data-gps>Usar minha localização</button>
      </form>
      <p role="status" data-nearby-message></p>
      <div class="catalog-table-container" hidden tabindex="0" aria-label="Fornecedores próximos" role="region"><table>
        <thead><tr><th>Fornecedor</th><th>Cidade</th><th>Distância</th><th>Contato</th></tr></thead><tbody></tbody>
      </table></div><div class="catalog-pagination" hidden></div>
      <p class="catalog-note">Distância em linha reta para fornecedores com coordenadas cadastradas. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></p>`,
    );
    const form = overlay.querySelector('#nearbyForm'),
      gpsForm = overlay.querySelector('#nearbyGpsForm'),
      body = overlay.querySelector('tbody'),
      results = overlay.querySelector('.catalog-table-container'),
      pages = overlay.querySelector('.catalog-pagination'),
      status = overlay.querySelector('[data-nearby-message]');
    let filters = {},
      call = 0;
    function begin(message) {
      results.hidden = true;
      pages.hidden = true;
      status.textContent = message;
      return ++call;
    }
    async function search(pagina = 1) {
      const sequence = begin('Pesquisando fornecedores...');
      try {
        const result = await D.get('/fornecedores/proximos', {
          ...filters,
          pagina,
          limite: D.pageSize(),
        });
        if (
          sequence !== call ||
          !overlay.isConnected ||
          !overlay.classList.contains('active')
        )
          return;
        status.textContent =
          result.modo === 'distancia'
            ? result.sem_coordenadas
              ? result.sem_coordenadas +
                ' fornecedores sem coordenadas não entram no cálculo de distância.'
              : 'Fornecedores dentro do raio informado.'
            : 'Resultado da busca pela cidade ou pelo CEP cadastrado.';
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
        if (!result.dados.length) {
          status.textContent =
            'Nenhum fornecedor encontrado. Tente outra cidade, CEP ou raio.';
          return;
        }
        results.hidden = false;
        if (D.meta(result).paginas > 1) {
          D.paginate(pages, result, search);
          pages.hidden = false;
        }
      } catch (error) {
        if (sequence === call) status.textContent = error.message;
      }
    }
    form.onsubmit = (event) => {
      event.preventDefault();
      filters = {
        cidade: form.elements.cidade.value.trim(),
        cep: form.elements.cep.value.trim(),
      };
      if (!filters.cidade && !filters.cep) {
        begin('Informe a cidade ou o CEP para buscar fornecedores.');
        form.elements.cidade.focus();
        return;
      }
      search();
    };
    gpsForm.onsubmit = (event) => {
      event.preventDefault();
      const pending = begin('Solicitando localização ao navegador...');
      const radius = gpsForm.elements.raio.valueAsNumber;
      if (!navigator.geolocation) {
        status.textContent =
          'Localização indisponível. Busque por cidade ou CEP.';
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (
            pending !== call ||
            !overlay.isConnected ||
            !overlay.classList.contains('active')
          )
            return;
          filters = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            raio_km: radius,
          };
          search();
        },
        () => {
          if (pending !== call) return;
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
  SinstockSession.ready
    .then(async (user) => {
      if (user) await Promise.all([load(), summary(), choices()]);
    })
    .catch((error) => SinstockUI.notify(error.message));
})();
