(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id),
    statusNames = {
      ABERTO: 'Aberto',
      EM_ANDAMENTO: 'Em andamento',
      RESOLVIDO: 'Resolvido',
      FECHADO: 'Fechado',
      CANCELADO: 'Cancelado',
    };
  let user,
    faqs = [],
    page = 1,
    sequence = 0;
  document.querySelectorAll('.help-tab').forEach(
    (tab) =>
      (tab.onclick = () => {
        document
          .querySelectorAll('.help-tab,.help-tab-content')
          .forEach((node) => node.classList.remove('active'));
        tab.classList.add('active');
        $(tab.dataset.tab).classList.add('active');
      }),
  );
  async function faq() {
    faqs = await D.get('/chamados/faq', { busca: $('helpSearch').value });
    $('faqList').innerHTML =
      faqs
        .map(
          (item) =>
            '<details class="live-faq"><summary>' +
            D.text(item.pergunta) +
            '</summary><p>' +
            D.text(item.resposta) +
            '</p>' +
            (user.perfil_id === 1
              ? '<div class="catalog-actions"><button type="button" data-faq="' +
                item.id +
                '">Editar</button><button type="button" data-delete-faq="' +
                item.id +
                '">Desativar</button></div>'
              : '') +
            '</details>',
        )
        .join('') || '<p>Nenhuma orientação encontrada.</p>';
  }
  async function tickets(pagina = page) {
    const callId = ++sequence;
    page = pagina;
    try {
      const result = await D.get('/chamados', {
        pagina,
        limite: D.pageSize(),
        busca: $('ticketSearch').value,
        status: $('ticketStatusFilter').value,
      });
      if (callId !== sequence) return;
      $('ticketsTableBody').innerHTML = result.dados
        .map(
          (item) =>
            '<tr><td>' +
            D.text(item.codigo) +
            '</td><td>' +
            D.text(item.assunto) +
            '</td><td>' +
            D.text(item.usuarios?.nome || '—') +
            '</td><td>' +
            D.text(item.prioridade) +
            '</td><td>' +
            D.text(statusNames[item.status]) +
            '</td><td>' +
            D.text(new Date(item.data_abertura).toLocaleString('pt-BR')) +
            '</td><td><button type="button" data-ticket="' +
            item.id +
            '">Ver conversa</button></td></tr>',
        )
        .join('');
      if (!result.dados.length)
        D.message($('ticketsTableBody'), 'Nenhum chamado encontrado.', 7);
      D.paginate($('ticketPagination'), result, tickets);
    } catch (error) {
      if (callId === sequence)
        D.message($('ticketsTableBody'), error.message, 7);
    }
  }
  async function upload(id, file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      throw new Error('O anexo deve ter até 2 MB.');
    const body = new FormData();
    body.append('arquivo', file);
    return SinstockAPI.request('/chamados/' + id + '/anexos', {
      method: 'POST',
      body,
    });
  }
  function create() {
    const requestId = crypto.randomUUID();
    let created;
    const overlay = D.dialog(
      'Novo chamado',
      '<form id="ticketForm"><label>Assunto *<input id="ticketSubject" name="titulo" required maxlength="150"></label>' +
        '<label>Categoria<select id="ticketCategory" name="categoria"><option>Estoque</option><option>Login e conta</option><option>Vendas</option><option>Fornecedores</option><option>Relatórios</option><option>Outros</option></select></label>' +
        '<label>Prioridade<select id="ticketPriority" name="prioridade"><option value="BAIXA">Baixa</option><option value="MEDIA" selected>Média</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></label>' +
        '<label>Descrição *<textarea id="ticketDescription" name="descricao" required maxlength="10000" rows="5"></textarea></label>' +
        '<label>Tela relacionada<input id="ticketPage" name="pagina" maxlength="100"></label><label>Anexo (PNG, JPEG ou PDF, até 2 MB)<input id="ticketAttachment" name="arquivo" type="file" accept=".png,.jpg,.jpeg,.pdf"></label>' +
        '<button type="submit">Registrar chamado</button></form>',
    );
    overlay.id = 'ticketModal';
    const form = overlay.querySelector('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const file = form.elements.arquivo.files[0];
        if (file && file.size > 2 * 1024 * 1024)
          throw new Error('O anexo deve ter até 2 MB.');
        if (!created) {
          created = await SinstockAPI.request('/chamados', {
            method: 'POST',
            body: {
              request_id: requestId,
              titulo: form.elements.titulo.value.trim(),
              categoria: form.elements.categoria.value,
              prioridade: form.elements.prioridade.value,
              descricao: form.elements.descricao.value.trim(),
              pagina: form.elements.pagina.value,
            },
          });
          ['titulo', 'descricao', 'categoria', 'prioridade', 'pagina'].forEach(
            (name) => {
              form.elements[name].disabled = true;
            },
          );
        }
        try {
          await upload(created.id, file);
        } catch (error) {
          throw new Error(
            'Chamado ' +
              created.codigo +
              ' registrado. O anexo falhou: ' +
              error.message +
              ' Tente anexar novamente ou remova o arquivo.',
          );
        }
        overlay.remove();
        await tickets();
        SinstockUI.notify(
          created.email_enviado
            ? 'Chamado registrado; confirmação enviada por e-mail.'
            : 'Chamado registrado. A confirmação por e-mail está indisponível.',
        );
      });
    };
  }
  $('openTicketModal').onclick = $('openTicketFromHelp').onclick = create;
  $('helpSearch').addEventListener(
    'input',
    D.debounce(() =>
      faq().catch((error) => {
        $('helpError').textContent = error.message;
      }),
    ),
  );
  $('ticketSearch').addEventListener(
    'input',
    D.debounce(() => tickets(1)),
  );
  $('ticketStatusFilter').onchange = () => tickets(1);
  function editFaq(id) {
    const item = faqs.find((row) => row.id === id);
    const overlay = D.dialog(
      item ? 'Editar orientação' : 'Nova orientação',
      '<form><label>Pergunta *<input name="pergunta" maxlength="255" required></label><label>Resposta *<textarea name="resposta" maxlength="20000" rows="6" required></textarea></label><label>Ordem<input name="ordem" type="number" min="0" value="0"></label><button type="submit">Salvar orientação</button></form>',
    );
    const form = overlay.querySelector('form');
    if (item)
      ['pergunta', 'resposta', 'ordem'].forEach((name) => {
        form.elements[name].value = item[name] || '';
      });
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        await SinstockAPI.request(
          '/chamados/faq' + (item ? '/' + item.id : ''),
          {
            method: item ? 'PATCH' : 'POST',
            body: {
              pergunta: form.elements.pergunta.value,
              resposta: form.elements.resposta.value,
              ordem: Number(form.elements.ordem.value),
            },
          },
        );
        overlay.remove();
        await faq();
      });
    };
  }
  $('newFaq').onclick = () => editFaq();
  $('faqList').onclick = async (event) => {
    const edit = event.target.closest('[data-faq]'),
      remove = event.target.closest('[data-delete-faq]');
    if (edit) editFaq(Number(edit.dataset.faq));
    if (remove && confirm('Desativar esta orientação?')) {
      try {
        await SinstockAPI.request('/chamados/faq/' + remove.dataset.deleteFaq, {
          method: 'DELETE',
        });
        await faq();
      } catch (error) {
        SinstockUI.notify(error.message);
      }
    }
  };
  async function conversation(id) {
    const ticket = await D.get('/chamados/' + id);
    const closed = ['FECHADO', 'CANCELADO'].includes(ticket.status);
    const overlay = D.dialog(
      ticket.codigo,
      '<h3>' +
        D.text(ticket.assunto) +
        '</h3><p class="support-text">' +
        D.text(ticket.descricao) +
        '</p><p>Status: ' +
        D.text(statusNames[ticket.status]) +
        '</p><div class="support-messages"></div><div class="support-attachments"></div>' +
        (!closed
          ? '<form id="replyForm"><label>Mensagem *<textarea name="mensagem" maxlength="5000" required></textarea></label><label>Anexo (até 2 MB)<input name="arquivo" type="file" accept=".png,.jpg,.jpeg,.pdf"></label><button type="submit">Enviar mensagem</button></form>'
          : '<p>Chamado encerrado.</p>') +
        '<form id="ticketStatusForm"><label>Status<select name="status"></select></label><button type="submit">Atualizar status</button></form>',
    );
    function render(data) {
      overlay.querySelector('.support-messages').innerHTML =
        '<h3>Conversa</h3>' +
        data.mensagens
          .map(
            (message) =>
              '<article><strong>' +
              D.text(message.autor.nome) +
              '</strong><small> · ' +
              D.text(new Date(message.criado_em).toLocaleString('pt-BR')) +
              '</small><p class="support-text">' +
              D.text(message.mensagem) +
              '</p></article>',
          )
          .join('') +
        (data.mensagens.length ? '' : '<p>Sem mensagens adicionais.</p>');
      overlay.querySelector('.support-attachments').innerHTML =
        '<h3>Anexos</h3>' +
          data.anexos
            .map(
              (file) =>
                '<button type="button" data-attachment="' +
                file.id +
                '" data-filename="' +
                D.text(file.nome) +
                '">' +
                D.text(file.nome) +
                '</button>',
            )
            .join('') || '';
    }
    render(ticket);
    const statusForm = overlay.querySelector('#ticketStatusForm'),
      reply = overlay.querySelector('#replyForm');
    const allowed =
      user.perfil_id === 1
        ? Object.entries(statusNames)
        : [
            ['FECHADO', 'Fechado'],
            ['CANCELADO', 'Cancelado'],
          ];
    statusForm.elements.status.replaceChildren(
      ...allowed.map(([key, label]) => new Option(label, key)),
    );
    if (user.perfil_id === 1) statusForm.elements.status.value = ticket.status;
    statusForm.onsubmit = (event) => {
      event.preventDefault();
      D.saving(statusForm, async () => {
        await SinstockAPI.request('/chamados/' + id + '/status', {
          method: 'PATCH',
          body: { status: statusForm.elements.status.value },
        });
        overlay.remove();
        await tickets();
      });
    };
    if (reply)
      reply.onsubmit = (event) => {
        event.preventDefault();
        D.saving(reply, async () => {
          const file = reply.elements.arquivo.files[0];
          if (file?.size > 2 * 1024 * 1024)
            throw new Error('O anexo deve ter até 2 MB.');
          await upload(id, file);
          await SinstockAPI.request('/chamados/' + id + '/mensagens', {
            method: 'POST',
            body: { mensagem: reply.elements.mensagem.value },
          });
          reply.reset();
          render(await D.get('/chamados/' + id));
        });
      };
    overlay.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-attachment]');
      if (!button) return;
      button.disabled = true;
      try {
        const result = await SinstockAPI.request(
          '/chamados/anexos/' + button.dataset.attachment,
          { responseType: 'blob' },
        );
        const url = URL.createObjectURL(result.blob),
          anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = button.dataset.filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        SinstockUI.notify(error.message);
      } finally {
        button.disabled = false;
      }
    });
    const interval = setInterval(async () => {
      if (!overlay.isConnected || !overlay.classList.contains('active')) {
        clearInterval(interval);
        return;
      }
      try {
        render(await D.get('/chamados/' + id));
      } catch {
        /* Explicit sends show errors; polling can wait for connectivity. */
      }
    }, 10000);
  }
  $('ticketsTableBody').onclick = (event) => {
    const button = event.target.closest('[data-ticket]');
    if (button)
      conversation(Number(button.dataset.ticket)).catch((error) =>
        SinstockUI.notify(error.message),
      );
  };
  SinstockSession.ready
    .then(async (current) => {
      if (!current) return;
      user = current;
      const settings = await D.get('/configuracoes/publicas');
      const email = settings.email_suporte || settings.empresa.email;
      $('supportContact').innerHTML = email
        ? '<a href="mailto:' + D.text(email) + '">' + D.text(email) + '</a>'
        : '<p>Use os chamados para falar com a administração.</p>';
      await Promise.all([faq(), tickets()]);
    })
    .catch((error) => {
      $('helpError').textContent = error.message;
    });
})();
