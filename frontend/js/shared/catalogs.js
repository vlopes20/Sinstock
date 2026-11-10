(() => {
  'use strict';
  const schemas = {
    categorias: {
      title: 'Categorias',
      fields: [
        ['nome', 'Nome', true],
        ['descricao', 'Descrição'],
      ],
    },
    filiais: {
      title: 'Filiais',
      fields: [
        ['nome', 'Nome', true],
        ['endereco', 'Endereço'],
      ],
    },
    clientes: {
      title: 'Clientes',
      fields: [
        ['nome', 'Nome', true],
        ['cpf_cnpj', 'CPF/CNPJ'],
        ['telefone', 'Telefone'],
        ['email', 'E-mail', false, 'email'],
      ],
    },
  };
  let overlay;
  async function open(resource) {
    const D = SinstockData,
      schema = schemas[resource];
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.className = 'product-modal-overlay active catalog-modal-overlay';
    overlay.innerHTML =
      '<div class="product-modal"><div class="product-modal-header"><h2>' +
      schema.title +
      '</h2><button type="button" data-close aria-label="Fechar">Fechar</button></div>' +
      '<div class="catalog-content"><form id="catalogForm"><input type="hidden" name="id">' +
      schema.fields
        .map(
          ([name, label, required, type]) =>
            '<div class="product-form-group"><label for="catalog-' +
            name +
            '">' +
            label +
            (required ? ' *' : '') +
            '</label><input id="catalog-' +
            name +
            '" name="' +
            name +
            '" type="' +
            (type || 'text') +
            '"' +
            (required ? ' required' : '') +
            '></div>',
        )
        .join('') +
      '<div class="catalog-actions"><button type="submit" class="save-product-button">Salvar</button><button type="button" data-new>Novo cadastro</button></div></form>' +
      '<label for="catalogSearch">Buscar</label><input id="catalogSearch" type="search" placeholder="Buscar cadastro">' +
      '<div class="catalog-table-container"><table><thead><tr><th>Nome</th><th>Informações</th><th>Ações</th></tr></thead><tbody></tbody></table></div>' +
      '<div class="catalog-pagination"></div></div></div>';
    document.body.append(overlay);
    const current = overlay,
      form = current.querySelector('form'),
      body = current.querySelector('tbody'),
      search = current.querySelector('#catalogSearch');
    const readonly =
      resource === 'filiais' && SinstockSession.user?.perfil_id !== 1;
    form.hidden = readonly;
    current.querySelector('[data-close]').onclick = () =>
      current.classList.remove('active');
    current.onclick = (event) => {
      if (event.target === current) current.classList.remove('active');
    };
    current.querySelector('[data-new]').onclick = () => {
      form.reset();
      form.elements.id.value = '';
      form.elements.nome.focus();
    };
    let sequence = 0,
      entries = [];
    async function load(pagina = 1) {
      const callId = ++sequence;
      D.message(body, 'Carregando...', 3);
      try {
        const response = await D.get('/' + resource, {
          busca: search.value,
          pagina,
          limite: D.pageSize(),
        });
        if (callId !== sequence || !current.isConnected) return;
        entries = D.rows(response);
        const visible =
          resource === 'clientes'
            ? entries
            : entries.filter((item) =>
                JSON.stringify(item)
                  .toLocaleLowerCase('pt-BR')
                  .includes(search.value.toLocaleLowerCase('pt-BR')),
              );
        body.innerHTML = visible
          .map(
            (item) =>
              '<tr><td>' +
              D.text(item.nome) +
              '</td><td>' +
              D.text(
                item.email ||
                  item.endereco ||
                  item.descricao ||
                  item.telefone ||
                  '—',
              ) +
              '</td><td>' +
              (readonly
                ? 'Consulta'
                : '<button type="button" data-edit="' +
                  item.id +
                  '">Editar</button> <button type="button" data-delete="' +
                  item.id +
                  '">Excluir</button>') +
              '</td></tr>',
          )
          .join('');
        if (!visible.length) D.message(body, 'Nenhum cadastro encontrado.', 3);
        D.paginate(
          current.querySelector('.catalog-pagination'),
          response,
          load,
        );
      } catch (error) {
        if (callId === sequence) D.message(body, error.message, 3);
      }
    }
    search.addEventListener(
      'input',
      D.debounce(() => load()),
    );
    body.onclick = async (event) => {
      const edit = event.target.closest('[data-edit]'),
        remove = event.target.closest('[data-delete]');
      if (edit) {
        const item = entries.find(
          (row) => row.id === Number(edit.dataset.edit),
        );
        form.elements.id.value = item.id;
        schema.fields.forEach(([name]) => {
          form.elements[name].value = item[name] ?? '';
        });
        form.elements.nome.focus();
      }
      if (
        remove &&
        confirm('Excluir este cadastro? Registros vinculados são preservados.')
      ) {
        remove.disabled = true;
        try {
          await SinstockAPI.request(
            '/' + resource + '/' + remove.dataset.delete,
            { method: 'DELETE' },
          );
          await load();
          window.dispatchEvent(new Event('sinstock:catalog-changed'));
        } catch (error) {
          SinstockUI.notify(error.message);
          remove.disabled = false;
        }
      }
    };
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const id = form.elements.id.value,
          values = {};
        schema.fields.forEach(([name]) => {
          const value = form.elements[name].value.trim();
          if (value) values[name] = value;
          else if (id) values[name] = null;
        });
        await SinstockAPI.request('/' + resource + (id ? '/' + id : ''), {
          method: id ? 'PATCH' : 'POST',
          body: values,
        });
        form.reset();
        form.elements.id.value = '';
        await load();
        SinstockUI.notify('Cadastro salvo.');
        window.dispatchEvent(new Event('sinstock:catalog-changed'));
      });
    };
    await load();
  }
  window.SinstockCatalogs = { open };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-catalog]');
    if (button && schemas[button.dataset.catalog])
      open(button.dataset.catalog).catch((error) =>
        SinstockUI.notify(error.message),
      );
  });
})();
