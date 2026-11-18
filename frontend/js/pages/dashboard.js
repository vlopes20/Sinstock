(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  let sequence = 0,
    current;
  let live;
  let currentFilter;
  let branchesLoaded = false;
  const status = $('dashboardLiveStatus');
  const operations = {
    ENTRADA: 'Entrada',
    SAIDA: 'Saída',
    TRANSFERENCIA: 'Transferência',
    AJUSTE: 'Ajuste',
  };
  const dayMs = 86400000;
  const displayDate = (iso) => iso.slice(0, 10).split('-').reverse().join('/');
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
  function graph(data, firstDay, lastDay, days) {
    const chart = $('dashboardChart');
    if (!data.length) {
      chart.innerHTML =
        '<p class="catalog-status">Nenhuma venda confirmada no período.</p>';
      return;
    }
    const peak = Math.max(...data.map((item) => item.total)) || 1;
    const bars = data.map((item) => {
      const offset = (Date.parse(item.data) - Date.parse(firstDay)) / dayMs;
      const height = (100 * item.total) / peak;
      const label = D.text(
        displayDate(item.data) + ' · ' + D.money(item.total),
      );
      return `<rect x="${offset + 0.15}" y="${100 - height}" width="0.7" height="${height}"><title>${label}</title></rect>`;
    });
    chart.innerHTML = `
      <div class="sales-chart">
        <div class="chart-scale"><span>${D.money(peak)}</span><span>${D.money(peak / 2)}</span><span>R$ 0,00</span></div>
        <svg class="chart-plot" viewBox="0 0 ${days} 100" preserveAspectRatio="none" role="img" aria-label="Faturamento diário em reais">
          ${bars.join('')}
        </svg>
        <div class="chart-days"><span>${displayDate(firstDay)}</span><span>${displayDate(lastDay)}</span></div>
      </div>`;
  }

  function expiryLabel(days) {
    if (days === 0) return 'Vence hoje';
    const duration = Math.abs(days) + (Math.abs(days) === 1 ? ' dia' : ' dias');
    return days < 0 ? 'Vencido há ' + duration : 'Vence em ' + duration;
  }

  async function load() {
    const callId = ++sequence;
    const branch = $('dashboardBranch').value;
    const days = Number($('dashboardPeriod').value);
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    });
    const firstDay = new Date(Date.parse(today) - (days - 1) * dayMs)
      .toISOString()
      .slice(0, 10);
    const filter = [branch, firstDay, today].join('|');
    const cached = current && currentFilter === filter;
    $('dashboardError').hidden = true;
    $('dashboardResults').hidden = !cached;
    $('dashboardLoading').hidden = !!cached;
    $('refreshDashboard').disabled = true;
    try {
      if (!branchesLoaded) {
        const branches = await D.get('/filiais');
        if (callId !== sequence) return;
        D.options(
          $('dashboardBranch'),
          D.rows(branches),
          (item) => item.nome,
          'Todas as filiais',
        );
        branchesLoaded = true;
        $('dashboardBranch').disabled = false;
        $('dashboardPeriod').disabled = false;
      }
      const result = await D.get('/dashboard/resumo', {
        filial_id: branch,
        data_inicio: firstDay + 'T00:00:00-03:00',
        data_fim: today + 'T23:59:59.999-03:00',
      });
      if (callId !== sequence) return;
      $('dashboardOrders').textContent = D.number(result.comercial.total);
      $('dashboardStock').textContent = D.number(result.estoque.disponivel);
      $('dashboardRevenue').textContent = $('dashboardTotal').textContent =
        D.money(result.comercial.faturamento);
      graph(result.comercial.diario, firstDay, today, days);
      const alerts = result.alertas.resumo;
      const expiryDays = alerts.parametros_aplicados.dias_vencimento;
      $('expiryDescription').textContent =
        'Vencidos ou a vencer em até ' +
        expiryDays +
        (expiryDays === 1 ? ' dia' : ' dias');
      for (const [id, count] of [
        ['lowCount', alerts.total_estoque_baixo],
        ['expiryCount', alerts.total_lotes_vencendo],
        ['ordersCount', result.comercial.reservas],
      ]) {
        $(id).textContent = D.number(count);
        $(id).classList.toggle('has-alert', count > 0);
      }
      $('showSalesData').disabled = !result.comercial.diario.length;
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
            D.text(operations[log.tipo_movimentacao] || log.tipo_movimentacao) +
            '</td><td>' +
            D.number(log.quantidade) +
            '</td><td>' +
            D.text(log.usuarios.nome) +
            '</td></tr>',
        )
        .join('');
      if (!result.recentes.length)
        D.message($('dashboardRecent'), 'Nenhuma movimentação encontrada.', 4);
      current = result;
      currentFilter = filter;
      $('dashboardResults').hidden = false;
    } catch (error) {
      if (callId !== sequence) return;
      $('dashboardError').textContent =
        error.message +
        (cached ? ' Exibindo a última consulta concluída.' : '');
      $('dashboardError').hidden = false;
    } finally {
      if (callId === sequence) {
        $('dashboardLoading').hidden = true;
        $('refreshDashboard').disabled = false;
      }
    }
  }
  $('dashboardAlerts').onclick = (event) => {
    const button = event.target.closest('[data-alert]');
    if (!button || !current) return;
    const low = button.dataset.alert === 'low';
    const data = low
      ? current.alertas.alertas.estoque_baixo
      : current.alertas.alertas.lotes_vencendo;
    D.dialog(
      low ? 'Estoque baixo por filial' : 'Validade dos lotes',
      '<ul>' +
        data
          .map((item) => {
            const branch = item.filial_id || $('dashboardBranch').value;
            return (
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
                  D.text(displayDate(item.data_validade)) +
                  ' · ' +
                  expiryLabel(item.dias_para_vencer)) +
              '</p><a href="estoque.html?busca=' +
              encodeURIComponent(item.produto_nome) +
              (branch ? '&amp;filial_id=' + encodeURIComponent(branch) : '') +
              '">Consultar estoque</a></li>'
            );
          })
          .join('') +
        (data.length ? '' : '<li>Nenhum alerta atual.</li>') +
        '</ul>',
    );
  };
  $('showSalesData').onclick = () => {
    if (!current) return;
    D.dialog(
      'Faturamento diário',
      '<div class="catalog-table-container daily-sales-table"><table><thead><tr><th>Data</th><th>Faturamento</th></tr></thead><tbody>' +
        current.comercial.diario
          .map(
            (item) =>
              '<tr><td>' +
              D.text(displayDate(item.data)) +
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
  SinstockSession.ready.then(async (user) => {
    if (!user) return;
    $('dashboardWelcome').textContent =
      'Olá, ' + user.nome.trim().split(/\s+/)[0];
    await load();
    liveUpdates();
  });
})();
