(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  let sequence = 0,
    current;
  let live;
  const status = document.createElement('p');
  status.id = 'dashboardLiveStatus';
  status.className = 'catalog-note';
  $('dashboardError').after(status);
  function liveUpdates() {
    live?.abort();
    live = new AbortController();
    const refresh = D.debounce(() => {
      if (document.visibilityState === 'visible') load();
    });
    SinstockAPI.subscribe('/dashboard/realtime-stream', refresh, {
      signal: live.signal,
      onState: (message) => {
        status.textContent = message;
      },
    });
  }
  window.addEventListener('pagehide', () => live?.abort());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && SinstockSession.user) liveUpdates();
  });
  function graph(data) {
    $('dashboardChart').parentElement.classList.toggle('empty-chart', !data.length);
    if (!data.length) {
      $('dashboardChart').textContent = 'Nenhuma venda confirmada no período.';
      return;
    }
    const max = Math.max(1, ...data.map((item) => item.total));
    const points = data.map((item, i) => ({
      x: 20 + (data.length === 1 ? 330 : (i * 660) / (data.length - 1)),
      y: 200 - (item.total / max) * 180,
      ...item,
    }));
    $('dashboardChart').innerHTML =
      '<svg viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Faturamento diário">' +
      '<polyline points="' +
      points.map((p) => p.x + ',' + p.y).join(' ') +
      '" fill="none" stroke="#f97316" stroke-width="3"></polyline>' +
      points
        .map(
          (p) =>
            '<circle cx="' +
            p.x +
            '" cy="' +
            p.y +
            '" r="5" fill="#f97316"><title>' +
            D.text(p.data + ': ' + D.money(p.total)) +
            '</title></circle>',
        )
        .join('') +
      '</svg><div class="chart-days"><span>' +
      D.text(data[0].data.split('-').reverse().join('/')) +
      '</span><span>' +
      D.text(data.at(-1).data.split('-').reverse().join('/')) +
      '</span></div>';
  }
  async function load() {
    const callId = ++sequence;
    $('dashboardError').textContent = '';
    try {
      const result = await D.get('/dashboard/resumo', {
        filial_id: $('dashboardBranch').value,
        data_inicio: new Date(
          Date.now() - Number($('dashboardPeriod').value) * 86400000,
        ).toISOString(),
      });
      if (callId !== sequence) return;
      current = result;
      $('dashboardOrders').textContent = D.number(result.comercial.total);
      $('dashboardStock').textContent = D.number(result.estoque.disponivel);
      $('dashboardRevenue').textContent = $('dashboardTotal').textContent =
        D.money(result.comercial.faturamento);
      graph(result.comercial.diario);
      const low = result.alertas.alertas.estoque_baixo,
        expiry = result.alertas.alertas.lotes_vencendo;
      $('dashboardAlerts').innerHTML = [
        [
          'Estoque baixo',
          low.length + ' saldos de produto/filial no mínimo ou abaixo dele.',
          'low',
        ],
        [
          'Validade',
          expiry.length + ' lotes vencidos ou com validade em até sete dias.',
          'expiry',
        ],
        [
          'Reservas abertas',
          result.comercial.reservas + ' pedidos reservados no período.',
          'orders',
        ],
      ]
        .map(
          ([title, label, type]) =>
            '<button type="button" class="alert-item" data-alert="' +
            type +
            '"><div class="alert-information"><strong>' +
            title +
            '</strong><span>' +
            D.text(label) +
            '</span></div></button>',
        )
        .join('');
      $('dashboardCategories').innerHTML = result.categorias
        .map(
          (item) =>
            '<tr><td>' +
            D.text(item.categoria) +
            '</td><td>' +
            D.number(item.quantidadeTotal) +
            '</td><td>' +
            D.money(item.valorTotal) +
            '</td></tr>',
        )
        .join('');
      if (!result.categorias.length)
        D.message($('dashboardCategories'), 'Nenhuma categoria cadastrada.', 3);
      $('dashboardRecent').innerHTML = result.recentes
        .map(
          (log) =>
            '<tr><td>' +
            D.text(log.produtos.nome) +
            '<small>' +
            D.text(log.filiais.nome) +
            '</small></td><td>' +
            D.text(log.tipo_movimentacao) +
            '</td><td>' +
            D.number(log.quantidade) +
            '</td><td>' +
            D.text(log.usuarios.nome) +
            '</td></tr>',
        )
        .join('');
      if (!result.recentes.length)
        D.message($('dashboardRecent'), 'Nenhuma movimentação encontrada.', 4);
    } catch (error) {
      if (callId === sequence) $('dashboardError').textContent = error.message;
    }
  }
  $('dashboardAlerts').onclick = (event) => {
    const button = event.target.closest('[data-alert]');
    if (!button || !current) return;
    if (button.dataset.alert === 'orders') {
      location.href = 'pedidos.html';
      return;
    }
    const low = button.dataset.alert === 'low';
    const data = low
      ? current.alertas.alertas.estoque_baixo
      : current.alertas.alertas.lotes_vencendo;
    D.dialog(
      low ? 'Estoque baixo por filial' : 'Validade dos lotes',
      '<ul>' +
        data
          .map(
            (item) =>
              '<li><strong>' +
              D.text(item.produto_nome) +
              '</strong><p>' +
              (low
                ? D.text(item.filial_nome) +
                  ': ' +
                  D.number(item.quantidade_atual) +
                  ' disponíveis, mínimo ' +
                  D.number(item.estoque_minimo)
                : 'Lote ' +
                  D.text(item.numero_lote) +
                  ' · ' +
                  D.text(
                    item.data_validade
                      .slice(0, 10)
                      .split('-')
                      .reverse()
                      .join('/'),
                  ) +
                  ' · ' +
                  item.dias_para_vencer +
                  ' dias') +
              '</p><a href="estoque.html?busca=' +
              encodeURIComponent(item.produto_nome) +
              (item.filial_id ? '&amp;filial_id=' + item.filial_id : '') +
              '">Consultar estoque</a></li>',
          )
          .join('') +
        (data.length ? '' : '<li>Nenhum alerta atual.</li>') +
        '</ul>',
    );
  };
  $('showSalesData').onclick = () => {
    if (!current) return;
    D.dialog(
      'Faturamento diário',
      '<div class="catalog-table-container"><table><thead><tr><th>Data</th><th>Faturamento</th></tr></thead><tbody>' +
        current.comercial.diario
          .map(
            (item) =>
              '<tr><td>' +
              D.text(item.data) +
              '</td><td>' +
              D.money(item.total) +
              '</td></tr>',
          )
          .join('') +
        '</tbody></table></div>',
    );
  };
  $('dashboardBranch').onchange = load;
  $('dashboardPeriod').onchange = load;
  $('refreshDashboard').onclick = load;
  SinstockSession.ready
    .then(async (user) => {
      if (!user) return;
      $('dashboardWelcome').textContent = 'Olá, ' + user.nome.split(' ')[0];
      D.options(
        $('dashboardBranch'),
        D.rows(await D.get('/filiais')),
        (item) => item.nome,
        'Todas as filiais',
      );
      await load();
      liveUpdates();
    })
    .catch((error) => {
      $('dashboardError').textContent = error.message;
    });
})();
