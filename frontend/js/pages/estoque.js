(() => {
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
})();
