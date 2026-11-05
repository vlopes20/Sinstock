(() => {
  'use strict';
  const D = SinstockData,
    C = SinstockCommerce,
    $ = (id) => document.getElementById(id);
  let sequence = 0,
    page = 1;
  const filter = () => ({
    filial_id: $('salesBranch').value,
    busca: $('salesSearch').value,
    status: $('salesStatusFilter').value,
    pagamento: $('paymentFilter').value,
    data_inicio: $('salesFrom').value
      ? $('salesFrom').value + 'T00:00:00-03:00'
      : undefined,
    data_fim: $('salesTo').value
      ? $('salesTo').value + 'T23:59:59-03:00'
      : undefined,
  });
  document.querySelectorAll('.sales-tab').forEach(
    (tab) =>
      (tab.onclick = () => {
        document
          .querySelectorAll('.sales-tab,.sales-tab-content')
          .forEach((node) => node.classList.remove('active'));
        tab.classList.add('active');
        $(tab.dataset.tab).classList.add('active');
      }),
  );
  $('openSaleModal').onclick = () =>
    C.open('sale', Number($('salesBranch').value));
  async function list(pagina = page) {
    const current = ++sequence;
    page = pagina;
    D.message($('salesTableBody'), 'Carregando vendas...', 8);
    try {
      const result = await D.get('/pedidos', {
        ...filter(),
        pagina,
        limite: D.pageSize(),
      });
      if (current !== sequence) return;
      $('salesTableBody').innerHTML = result.dados
        .map(
          (order) =>
            '<tr><td>#' +
            order.id +
            '</td><td>' +
            D.text(order.clientes?.nome || 'Consumidor não identificado') +
            '</td><td>' +
            D.text(new Date(order.data_venda).toLocaleString('pt-BR')) +
            '</td><td>' +
            order.itens_venda.length +
            '</td><td>' +
            D.text(C.payments[order.pagamento] || 'Não informado') +
            '</td><td>' +
            D.money(order.total) +
            '</td><td>' +
            C.statuses[order.status] +
            '</td><td><button type="button" data-order="' +
            order.id +
            '">Detalhes</button></td></tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message($('salesTableBody'), 'Nenhuma venda encontrada.', 8);
      document.querySelector('.sales-table-footer > span').textContent =
        result.meta.total + ' registros encontrados';
      D.paginate(document.querySelector('.sales-pagination'), result, list);
    } catch (error) {
      if (current === sequence)
        D.message($('salesTableBody'), error.message, 8);
    }
  }
  async function summary() {
    const { busca, status, pagamento, ...period } = filter();
    const info = await D.get('/pedidos/resumo/periodo', period);
    const values = [
      D.money(info.faturamento),
      D.number(info.confirmados),
      D.money(info.ticket_medio),
      D.number(info.cancelados),
    ];
    document
      .querySelectorAll('.sales-summary-card strong')
      .forEach((node, i) => {
        node.textContent = values[i];
      });
    const max = Math.max(1, ...info.diario.map((item) => item.total));
    document.querySelector('.sales-chart .chart-bars').innerHTML = info.diario
      .length
      ? info.diario
          .map(
            (item) =>
              '<div class="sales-bar-group"><div class="sales-bar" style="height:' +
              Math.max(1, (item.total / max) * 100) +
              '%" title="' +
              D.text(item.data + ': ' + D.money(item.total)) +
              '"></div><span>' +
              D.text(item.data.slice(5).split('-').reverse().join('/')) +
              '</span></div>',
          )
          .join('')
      : '<p>Nenhuma venda confirmada no período.</p>';
    document.querySelector('.sales-chart-footer strong').textContent = D.money(
      info.faturamento,
    );
    const sales = info.pagamentos.reduce(
      (sum, item) => sum + item.quantidade,
      0,
    );
    document.querySelector('.payment-list').innerHTML = info.pagamentos.length
      ? info.pagamentos
          .map(
            (item) =>
              '<div class="payment-item"><div><strong>' +
              D.text(C.payments[item.pagamento] || item.pagamento) +
              '</strong><p>' +
              D.number(item.quantidade) +
              ' vendas</p></div><strong>' +
              D.money(item.total) +
              '</strong></div><div class="payment-progress"><div style="width:' +
              (sales ? (item.quantidade / sales) * 100 : 0) +
              '%"></div></div>',
          )
          .join('')
      : '<p>Nenhum pagamento no período.</p>';
  }
  async function refresh() {
    try {
      await Promise.all([list(), summary()]);
    } catch (error) {
      SinstockUI.notify(error.message);
    }
  }
  $('salesTableBody').onclick = (event) => {
    const button = event.target.closest('[data-order]');
    if (button)
      C.details(Number(button.dataset.order)).catch((error) =>
        SinstockUI.notify(error.message),
      );
  };
  $('salesSearch').addEventListener(
    'input',
    D.debounce(() => list(1)),
  );
  ['paymentFilter', 'salesStatusFilter'].forEach(
    (id) => ($(id).onchange = () => list(1)),
  );
  ['salesBranch', 'salesFrom', 'salesTo'].forEach(
    (id) =>
      ($(id).onchange = () => {
        page = 1;
        refresh();
      }),
  );
  window.addEventListener('sinstock:commerce-changed', refresh);
  const today = new Date(),
    week = new Date(Date.now() - 6 * 86400000);
  $('salesFrom').value = week.toLocaleDateString('en-CA');
  $('salesTo').value = today.toLocaleDateString('en-CA');
  document.querySelectorAll('.sales-summary-card strong').forEach((node) => {
    node.textContent = '—';
  });
  SinstockSession.ready
    .then(async (user) => {
      if (!user) return;
      D.options(
        $('salesBranch'),
        D.rows(await D.get('/filiais')),
        (item) => item.nome,
        'Todas as filiais',
      );
      await refresh();
    })
    .catch((error) => SinstockUI.notify(error.message));
})();
