(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const D = SinstockData,
      search = document.querySelector('.search-box input'),
      bell = document.querySelector('.notification');
    if (!search && !bell) return;
    let ready = false;
    function setBadge(count) {
      const badge = bell?.querySelector('.notification-number');
      if (badge) {
        badge.hidden = !count;
        badge.textContent = count > 99 ? '99+' : count;
      }
    }
    async function unread() {
      try {
        setBadge((await D.get('/notificacoes', { limite: 1 })).nao_lidas);
      } catch {
        /* The drawer displays connection errors when opened. */
      }
    }
    async function notifications(pagina = 1, overlay) {
      overlay ||= D.dialog('Notificações', '<p>Carregando...</p>');
      const content = overlay.querySelector('.catalog-content');
      try {
        const result = await D.get('/notificacoes', {
          pagina,
          limite: D.pageSize(),
        });
        if (!overlay.isConnected) return;
        setBadge(result.nao_lidas);
        content.innerHTML =
          (SinstockSession.user?.perfil_id === 1
            ? '<div class="catalog-tools"><button type="button" data-scan>Atualizar alertas</button></div>'
            : '') +
          '<div class="notification-list">' +
          result.dados
            .map(
              (item) =>
                '<article><strong>' +
                D.text(item.titulo) +
                '</strong><p>' +
                D.text(item.mensagem) +
                '</p><small>' +
                D.text(new Date(item.criado_em).toLocaleString('pt-BR')) +
                '</small>' +
                (item.lida
                  ? '<span> · Lida</span>'
                  : '<button type="button" data-read="' +
                    item.id +
                    '">Marcar como lida</button>') +
                '</article>',
            )
            .join('') +
          (result.dados.length
            ? ''
            : '<p>Nenhuma notificação encontrada.</p>') +
          '</div><div class="catalog-pagination"></div>';
        D.paginate(
          content.querySelector('.catalog-pagination'),
          result,
          (page) => notifications(page, overlay),
        );
        content.onclick = async (event) => {
          const read = event.target.closest('[data-read]'),
            scan = event.target.closest('[data-scan]');
          if (!read && !scan) return;
          const button = read || scan;
          button.disabled = true;
          try {
            await SinstockAPI.request(
              read
                ? '/notificacoes/' + read.dataset.read + '/ler'
                : '/notificacoes/executar-varredura',
              { method: read ? 'PATCH' : 'POST' },
            );
            await notifications(pagina, overlay);
          } catch (error) {
            button.disabled = false;
            SinstockUI.notify(error.message);
          }
        };
      } catch (error) {
        content.textContent = error.message;
      }
    }
    if (bell)
      bell.onclick = () => {
        if (ready) notifications();
      };
    if (search)
      search.addEventListener('keydown', async (event) => {
        if (event.key !== 'Enter' || !ready) return;
        event.preventDefault();
        const term = search.value.trim();
        if (term.length < 2) {
          SinstockUI.notify('Digite pelo menos dois caracteres.');
          return;
        }
        const overlay = D.dialog('Busca: ' + term, '<p>Pesquisando...</p>');
        try {
          const data = await D.get('/busca-global', {
            termo: term,
            limite: D.pageSize(),
          });
          const groups = [
            [
              'Produtos',
              data.resultados.produtos,
              (item) => [
                item.nome,
                'produtos.html?busca=' +
                  encodeURIComponent(item.codigo_barras || item.nome),
              ],
            ],
            [
              'Fornecedores',
              data.resultados.fornecedores,
              (item) => [
                item.nome_juridico,
                'fornecedores.html?busca=' + encodeURIComponent(item.cnpj),
              ],
            ],
            [
              'Lotes',
              data.resultados.lotes,
              (item) => [
                item.numero_lote + ' · ' + item.produto_nome,
                'estoque.html?busca=' + encodeURIComponent(item.produto_nome),
              ],
            ],
            [
              'Documentos',
              data.resultados.notas_fiscais,
              (item) => [
                item.numero_nf + ' · ' + item.fornecedor_nome,
                'estoque.html?nota=' +
                  encodeURIComponent(item.numero_nf) +
                  (item.filial_id ? '&filial_id=' + item.filial_id : ''),
              ],
            ],
          ];
          if (overlay.isConnected)
            overlay.querySelector('.catalog-content').innerHTML = groups
              .map(
                ([name, items, link]) =>
                  '<h3>' +
                  name +
                  '</h3>' +
                  (items.length
                    ? '<ul>' +
                      items
                        .map((item) => {
                          const [label, url] = link(item);
                          return (
                            '<li><a href="' +
                            D.text(url) +
                            '">' +
                            D.text(label) +
                            '</a></li>'
                          );
                        })
                        .join('') +
                      '</ul>'
                    : '<p>Nenhum resultado.</p>'),
              )
              .join('');
        } catch (error) {
          if (overlay.isConnected)
            overlay.querySelector('.catalog-content').textContent =
              error.message;
        }
      });
    SinstockSession.ready.then((user) => {
      ready = !!user;
      if (user) unread();
    });
    window.addEventListener('focus', () => {
      if (ready) unread();
    });
  });
})();
