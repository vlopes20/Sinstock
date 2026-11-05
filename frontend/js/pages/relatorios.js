(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  let current = null,
    filters = {},
    sequence = 0;
  function readFilters() {
    if (
      $('startDate').value &&
      $('endDate').value &&
      $('startDate').value > $('endDate').value
    )
      throw new Error('A data inicial deve ser anterior à final.');
    return {
      tipo: $('reportType').value,
      filial_id: $('reportBranch').value,
      categoria_id: $('reportCategory').value,
      data_inicio: $('startDate').value,
      data_fim: $('endDate').value,
      sem_movimento_dias: Number($('reportIdleDays').value || 30),
    };
  }
  function format(value, column) {
    if (value === null || value === undefined) return '—';
    if (column.format === 'money') return D.money(value);
    if (column.format === 'number') return D.number(value);
    if (column.format === 'date')
      return column.key === 'validade'
        ? value.slice(0, 10).split('-').reverse().join('/')
        : new Date(value).toLocaleString('pt-BR');
    return value;
  }
  async function load(pagina = 1) {
    const callId = ++sequence;
    $('reportError').textContent = '';
    try {
      const result = await D.get('/relatorios', {
        ...filters,
        pagina,
        limite: D.pageSize(20),
      });
      if (callId !== sequence) return;
      current = result;
      $('reportTitle').textContent = result.titulo;
      $('reportContext').textContent = result.contexto;
      const table = $('liveReportTable');
      table.querySelector('thead').innerHTML =
        '<tr>' +
        result.colunas
          .map((column) => '<th>' + D.text(column.header) + '</th>')
          .join('') +
        '</tr>';
      table.querySelector('tbody').innerHTML = result.dados
        .map(
          (row) =>
            '<tr>' +
            result.colunas
              .map(
                (column) =>
                  '<td>' + D.text(format(row[column.key], column)) + '</td>',
              )
              .join('') +
            '</tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message(
          table.querySelector('tbody'),
          'Nenhum registro encontrado para os filtros.',
          result.colunas.length,
        );
      $('reportCount').textContent =
        result.meta.total + ' registros encontrados';
      D.paginate($('reportPagination'), result, load);
    } catch (error) {
      if (callId === sequence) $('reportError').textContent = error.message;
    }
  }
  $('applyReportFilters').onclick = () => {
    try {
      filters = readFilters();
      load();
    } catch (error) {
      $('reportError').textContent = error.message;
    }
  };
  $('clearReportFilters').onclick = () => {
    ['reportBranch', 'reportCategory', 'startDate', 'endDate'].forEach((id) => {
      $(id).value = '';
    });
    $('reportIdleDays').value = 30;
    filters = readFilters();
    load();
  };
  $('exportReport').onclick = async () => {
    const button = $('exportReport');
    button.disabled = true;
    $('reportError').textContent = '';
    try {
      // Export uses the applied filter snapshot, identical to the table query.
      const values = { ...filters, formato: $('reportFormat').value };
      const params = new URLSearchParams(
        Object.entries(values).filter(
          ([, value]) => value !== '' && value !== undefined,
        ),
      );
      const result = await SinstockAPI.request(
        '/relatorios/exportar?' + params,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(result.blob),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'sinstock-' + filters.tipo + '.' + values.formato;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      $('reportError').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
  $('printReport').onclick = () => {
    if (!current) return;
    SinstockUI.notify(
      'A impressão usa a página atual. Para o relatório completo, exporte em PDF.',
    );
    window.print();
  };
  SinstockSession.ready
    .then(async (user) => {
      if (!user) return;
      const [branches, categories] = await Promise.all([
        D.get('/filiais'),
        D.get('/categorias'),
      ]);
      D.options(
        $('reportBranch'),
        D.rows(branches),
        (item) => item.nome,
        'Todas as filiais',
      );
      D.options(
        $('reportCategory'),
        D.rows(categories),
        (item) => item.nome,
        'Todas as categorias',
      );
      $('startDate').value = new Date(
        Date.now() - 30 * 86400000,
      ).toLocaleDateString('en-CA');
      $('endDate').value = new Date().toLocaleDateString('en-CA');
      filters = readFilters();
      await load();
    })
    .catch((error) => {
      $('reportError').textContent = error.message;
    });
})();
