(() => {
  'use strict';
  const D = SinstockData,
    C = SinstockCommerce,
    $ = (selector) => document.querySelector(selector);
  let page = 1,
    sequence = 0;
  const statuses = $('#orderStatus'),
    periods = $('#orderPeriod');
  function filter() {
    const days = Number(periods.value);
    return {
      filial_id: $('#ordersBranch').value,
      busca: $('.order-search input').value,
      status: statuses.value,
      atendimento: $('#orderDelivery').value,
      ...(days
        ? { data_inicio: new Date(Date.now() - days * 86400000).toISOString() }
        : {}),
    };
  }
  $('#openOrderModal').onclick = () =>
    C.open('reserve', Number($('#ordersBranch').value));
  async function list(pagina = page) {
    const current = ++sequence;
    page = pagina;
    D.message($('.orders-table tbody'), 'Carregando pedidos...', 7);
    try {
      const result = await D.get('/pedidos', {
        ...filter(),
        pagina,
        limite: D.pageSize(),
      });
      if (current !== sequence) return;
      $('.orders-table tbody').innerHTML = result.dados
        .map(
          (order) =>
            '<tr><td>#' +
            order.id +
            '</td><td>' +
            D.text(order.clientes?.nome || 'Consumidor não identificado') +
            '</td><td>' +
            D.text(new Date(order.data_venda).toLocaleString('pt-BR')) +
            '</td><td>' +
            D.money(order.total) +
            '</td><td>' +
            D.text(C.payments[order.pagamento] || 'Não informado') +
            '</td><td>' +
            C.statuses[order.status] +
            '<small>' +
            D.text(C.delivery[order.atendimento] || order.atendimento) +
            '</small>' +
            '</td><td><button type="button" data-order="' +
            order.id +
            '">Detalhes</button></td></tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message($('.orders-table tbody'), 'Nenhum pedido encontrado.', 7);
      $('.orders-footer > span').textContent =
        result.meta.total + ' pedidos encontrados';
      D.paginate($('.pagination'), result, list);
    } catch (error) {
      if (current === sequence)
        D.message($('.orders-table tbody'), error.message, 7);
    }
  }
  async function summary() {
    const { status, busca, atendimento, ...period } = filter();
    const info = await D.get('/pedidos/resumo/periodo', period);
    [info.total, info.reservas, info.em_separacao, info.confirmados].forEach(
      (value, i) => {
        document.querySelectorAll('.summary-information strong')[
          i
        ].textContent = D.number(value);
      },
    );
  }
  async function refresh() {
    try {
      await Promise.all([list(), summary()]);
    } catch (error) {
      SinstockUI.notify(error.message);
    }
  }
  $('.orders-table tbody').onclick = (event) => {
    const button = event.target.closest('[data-order]');
    if (button)
      C.details(Number(button.dataset.order)).catch((error) =>
        SinstockUI.notify(error.message),
      );
  };
  $('.order-search input').addEventListener(
    'input',
    D.debounce(() => list(1)),
  );
  [statuses, $('#orderDelivery')].forEach((input) => {
    input.onchange = () => list(1);
  });
  [periods, $('#ordersBranch')].forEach((input) => {
    input.onchange = () => {
      page = 1;
      refresh();
    };
  });
  window.addEventListener('sinstock:commerce-changed', refresh);
  document.querySelectorAll('.summary-information strong').forEach((node) => {
    node.textContent = '—';
  });
  SinstockSession.ready
    .then(async (user) => {
      if (!user) return;
      D.options(
        $('#ordersBranch'),
        D.rows(await D.get('/filiais')),
        (item) => item.nome,
        'Todas as filiais',
      );
      await refresh();
    })
    .catch((error) => SinstockUI.notify(error.message));
})();
