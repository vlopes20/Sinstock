(() => {
  'use strict';
  const D = SinstockData,
    statuses = {
      ORCAMENTO: 'Reservado',
      CONCLUIDO: 'Confirmado',
      CANCELADO: 'Cancelado',
    };
  const payments = {
    PIX: 'PIX',
    DINHEIRO: 'Dinheiro',
    CREDITO: 'Crédito',
    DEBITO: 'Débito',
    BOLETO: 'Boleto',
    OUTRO: 'Outro',
  };
  const delivery = {
    PENDENTE: 'Pendente',
    EM_SEPARACAO: 'Em separação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
  };
  async function open(mode = 'sale', selectedBranch) {
    const reserve = mode === 'reserve';
    const overlay = D.dialog(
      reserve ? 'Novo pedido com reserva' : 'Nova venda',
      '<p role="status">Carregando cadastros e disponibilidade...</p>',
    );
    overlay.id = reserve ? 'orderModal' : 'saleModal';
    try {
      const [branches, clients] = await Promise.all([
        D.get('/filiais'),
        D.all('/clientes'),
      ]);
      if (!overlay.isConnected) return;
      const content = overlay.querySelector('.catalog-content');
      content.innerHTML =
        '<form id="' +
        (reserve ? 'orderForm' : 'newSaleForm') +
        '">' +
        '<div class="commerce-grid"><label>Filial *<select id="saleBranch" required></select></label><label>Cliente<select id="saleCustomer"></select></label></div>' +
        '<div class="catalog-tools"><button type="button" data-catalog="clientes">Gerenciar clientes</button></div>' +
        '<label>Código de barras<input id="saleBarcode" inputmode="numeric" placeholder="Digite ou escaneie e pressione Enter"></label><button type="button" id="scanSaleBarcode">Ler pela câmera</button>' +
        '<p class="catalog-note">Escolha o produto e o lote. A disponibilidade é conferida novamente pelo servidor.</p>' +
        '<div id="saleProducts"></div><button type="button" id="addSaleProduct">Adicionar produto</button>' +
        '<div class="commerce-grid"><label>Desconto (R$)<input type="number" id="saleDiscount" value="0" min="0" step="0.01"></label>' +
        '<label>Pagamento<select id="salePayment"' +
        (reserve ? '' : ' required') +
        '><option value="">Selecione</option>' +
        Object.entries(payments)
          .map(
            ([key, text]) =>
              '<option value="' + key + '">' + text + '</option>',
          )
          .join('') +
        '</select></label></div>' +
        (reserve
          ? '<label>Reserva válida por (minutos)<input id="saleExpiration" type="number" min="1" max="1440" value="15" required></label>'
          : '') +
        '<label>Observação<textarea id="saleObservation" maxlength="1000"></textarea></label>' +
        '<div class="sale-summary-box"><p>Subtotal: <strong id="saleSubtotal">R$ 0,00</strong></p><p>Total: <strong id="saleTotal">R$ 0,00</strong></p></div>' +
        '<div class="catalog-actions"><button type="button" data-cancel>Cancelar</button><button type="submit">' +
        (reserve ? 'Reservar estoque' : 'Finalizar venda') +
        '</button></div></form>';
      const form = content.querySelector('form'),
        $ = (selector) => form.querySelector(selector);
      D.options($('#saleBranch'), D.rows(branches), (item) => item.nome);
      $('#saleBranch').value = selectedBranch || D.rows(branches)[0]?.id || '';
      D.options(
        $('#saleCustomer'),
        clients,
        (item) => item.nome,
        'Consumidor não identificado',
      );
      $('[data-cancel]').onclick = () => overlay.remove();
      let products = [],
        sequence = 0;
      const productFor = (row) =>
        products.find(
          (product) =>
            product.id ===
            Number(row.querySelector('.sale-product-select').value),
        );
      function total() {
        const subtotalMilliCents = [
          ...form.querySelectorAll('.sale-product-row'),
        ].reduce(
          (sum, row) =>
            sum +
            Math.round(Number(productFor(row)?.preco_venda || 0) * 100) *
              Math.round(
                Number(row.querySelector('.sale-product-quantity').value) *
                  1000,
              ),
          0,
        );
        const subtotalCents = Math.floor((subtotalMilliCents + 500) / 1000);
        $('#saleSubtotal').textContent = D.money(subtotalCents / 100);
        $('#saleTotal').textContent = D.money(
          Math.max(
            0,
            subtotalCents - Math.round(Number($('#saleDiscount').value) * 100),
          ) / 100,
        );
      }
      function add(productId) {
        const row = document.createElement('div');
        row.className = 'sale-product-row commerce-product-row';
        row.innerHTML =
          '<label>Produto *<select class="sale-product-select" required></select></label><label>Lote<select class="sale-lot-select"></select></label>' +
          '<label>Quantidade *<input class="sale-product-quantity" type="number" min="0.001" step="0.001" value="1" required></label>' +
          '<div class="sale-product-price"></div><button type="button" class="remove-sale-product" aria-label="Remover produto">Remover</button>';
        const select = row.querySelector('.sale-product-select'),
          lots = row.querySelector('.sale-lot-select');
        D.options(
          select,
          products,
          (item) => item.nome + ' · ' + D.money(item.preco_venda),
        );
        function balance() {
          const item = productFor(row),
            stock = item?.saldos_estoque.find(
              (saldo) => (saldo.lote_id || '') === (Number(lots.value) || ''),
            );
          row.querySelector('.sale-product-price').textContent =
            D.money(item?.preco_venda) +
            ' · Disponível: ' +
            D.number(
              Number(stock?.quantidade || 0) -
                Number(stock?.quantidade_reservada || 0),
            );
          total();
        }
        select.onchange = () => {
          const product = productFor(row);
          const available = (product?.saldos_estoque || [])
            .filter(
              (saldo) =>
                Number(saldo.quantidade) - Number(saldo.quantidade_reservada) >
                0,
            )
            .sort((a, b) =>
              String(a.lotes?.data_validade || '9999').localeCompare(
                String(b.lotes?.data_validade || '9999'),
              ),
            );
          lots.replaceChildren(
            ...available.map(
              (saldo) =>
                new Option(
                  saldo.lotes
                    ? saldo.lotes.numero_lote +
                        ' · ' +
                        saldo.lotes.data_validade.slice(0, 10)
                    : 'Sem lote',
                  saldo.lote_id || '',
                ),
            ),
          );
          if (!available.length)
            lots.add(new Option('Sem saldo disponível', ''));
          balance();
        };
        lots.onchange = balance;
        row.querySelector('.sale-product-quantity').oninput = total;
        row.querySelector('[aria-label="Remover produto"]').onclick = () => {
          row.remove();
          total();
        };
        $('#saleProducts').append(row);
        if (productId) select.value = productId;
        select.onchange();
      }
      async function catalog() {
        const current = ++sequence;
        const data = await D.all('/produtos', {
          filial_id: Number($('#saleBranch').value) || undefined,
          ativo: true,
        });
        if (current !== sequence || !overlay.isConnected) return;
        products = data;
        $('#saleProducts').replaceChildren();
        add();
      }
      $('#saleBranch').onchange = () =>
        catalog().catch((error) => SinstockUI.notify(error.message));
      $('#addSaleProduct').onclick = () => add();
      $('#saleDiscount').oninput = total;
      $('#saleBarcode').onkeydown = async (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        try {
          const product = await D.get(
            '/produtos/codigo-barras/' +
              encodeURIComponent(event.target.value.trim()),
            { filial_id: Number($('#saleBranch').value) },
          );
          const empty = [...form.querySelectorAll('.sale-product-row')].find(
            (row) => !row.querySelector('.sale-product-select').value,
          );
          if (empty) empty.remove();
          add(product.id);
          event.target.value = '';
        } catch (error) {
          SinstockUI.notify(error.message);
        }
      };
      $('#scanSaleBarcode').onclick = () =>
        SinstockScanner.scan((code) => {
          $('#saleBarcode').value = code;
          $('#saleBarcode').dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
          );
        });
      form.onsubmit = (event) => {
        event.preventDefault();
        D.saving(form, async () => {
          const rows = [...form.querySelectorAll('.sale-product-row')];
          if (!rows.length) throw new Error('Adicione pelo menos um produto.');
          const items = rows.map((row) => {
            const product = productFor(row);
            if (!product) throw new Error('Selecione os produtos do pedido.');
            return {
              produto_id: product.id,
              lote_id:
                Number(row.querySelector('.sale-lot-select').value) ||
                undefined,
              quantidade: Number(
                row.querySelector('.sale-product-quantity').value,
              ),
              preco_unitario: Number(product.preco_venda),
            };
          });
          await SinstockAPI.request(
            reserve ? '/pedidos/reservar' : '/pedidos/checkout',
            {
              method: 'POST',
              body: {
                filial_id: Number($('#saleBranch').value),
                cliente_id: Number($('#saleCustomer').value) || undefined,
                itens: items,
                pagamento: $('#salePayment').value || undefined,
                desconto: Number($('#saleDiscount').value),
                observacao: $('#saleObservation').value,
                ...(reserve
                  ? { minutos_expiracao: Number($('#saleExpiration').value) }
                  : {}),
              },
            },
          );
          overlay.remove();
          SinstockUI.notify(reserve ? 'Reserva criada.' : 'Venda concluída.');
          window.dispatchEvent(new Event('sinstock:commerce-changed'));
        });
      };
      await catalog();
    } catch (error) {
      if (overlay.isConnected)
        overlay.querySelector('.catalog-content').textContent = error.message;
    }
  }
  async function details(id) {
    const order = await D.get('/pedidos/' + id),
      reserved = order.status === 'ORCAMENTO';
    const expired = reserved && new Date(order.reservado_ate) <= new Date();
    const overlay = D.dialog(
      'Pedido #' + id,
      '<p>' +
        D.text(order.clientes?.nome || 'Consumidor não identificado') +
        ' · ' +
        D.text(order.filiais.nome) +
        '</p><p>Status comercial: ' +
        statuses[order.status] +
        '</p>' +
        (reserved
          ? '<p>Reserva até: ' +
            D.text(new Date(order.reservado_ate).toLocaleString('pt-BR')) +
            (expired ? ' (expirada)' : '') +
            '</p>'
          : '') +
        '<div class="catalog-table-container"><table><thead><tr><th>Produto</th><th>Lote</th><th>Quantidade</th><th>Preço</th></tr></thead><tbody>' +
        order.itens_venda
          .map(
            (item) =>
              '<tr><td>' +
              D.text(item.produtos.nome) +
              '</td><td>' +
              D.text(item.lotes?.numero_lote || 'Sem lote') +
              '</td><td>' +
              D.number(item.quantidade) +
              '</td><td>' +
              D.money(item.preco_unitario) +
              '</td></tr>',
          )
          .join('') +
        '</tbody></table></div>' +
        '<p>Pagamento: ' +
        D.text(payments[order.pagamento] || 'Não informado') +
        ' · Desconto: ' +
        D.money(order.desconto) +
        ' · Total: ' +
        D.money(order.total) +
        '</p>' +
        '<p>' +
        D.text(order.observacao || '') +
        '</p>' +
        (order.status === 'CONCLUIDO'
          ? '<form><label>Atendimento / entrega<select name="atendimento">' +
            Object.entries(delivery)
              .map(
                ([key, text]) =>
                  '<option value="' + key + '">' + text + '</option>',
              )
              .join('') +
            '</select></label><button type="submit">Atualizar atendimento</button></form>'
          : '') +
        '<div class="catalog-actions">' +
        (reserved && !expired
          ? '<button type="button" data-confirm>Confirmar reserva</button>'
          : '') +
        (order.status !== 'CANCELADO'
          ? '<button type="button" data-cancel-order>Cancelar pedido</button>'
          : '') +
        '</div><p role="alert" data-detail-error></p>',
    );
    const update = overlay.querySelector('form');
    if (update) {
      update.elements.atendimento.value = order.atendimento;
      update.onsubmit = (event) => {
        event.preventDefault();
        D.saving(update, async () => {
          await SinstockAPI.request('/pedidos/' + id + '/atendimento', {
            method: 'PATCH',
            body: { atendimento: update.elements.atendimento.value },
          });
          overlay.remove();
          window.dispatchEvent(new Event('sinstock:commerce-changed'));
        });
      };
    }
    async function action(button, endpoint) {
      button.disabled = true;
      try {
        await SinstockAPI.request('/pedidos/' + id + endpoint, {
          method: 'PATCH',
        });
        overlay.remove();
        window.dispatchEvent(new Event('sinstock:commerce-changed'));
      } catch (error) {
        button.disabled = false;
        overlay.querySelector('[data-detail-error]').textContent =
          error.message;
      }
    }
    const confirm = overlay.querySelector('[data-confirm]'),
      cancel = overlay.querySelector('[data-cancel-order]');
    if (confirm) confirm.onclick = () => action(confirm, '/confirmar');
    if (cancel)
      cancel.onclick = () => {
        if (
          window.confirm(
            'Cancelar este pedido e reverter seu efeito no estoque?',
          )
        )
          action(cancel, '/cancelar');
      };
  }
  window.SinstockCommerce = { open, details, statuses, payments, delivery };
})();
