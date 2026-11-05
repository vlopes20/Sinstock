(() => {
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
})();
