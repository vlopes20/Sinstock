(() => {
  'use strict';
  const D = SinstockData,
    $ = (id) => document.getElementById(id);
  let user,
    profiles = [],
    users = [],
    settings,
    preferences;
  const companyFields = {
    nome: 'companyName',
    cnpj: 'companyCnpj',
    email: 'companyEmail',
    telefone: 'companyPhone',
    endereco: 'companyAddress',
    cidade: 'companyCity',
    estado: 'companyState',
  };
  const resources = {
    dashboard: 'Dashboard',
    produtos: 'Produtos',
    categorias: 'Categorias',
    fornecedores: 'Fornecedores',
    filiais: 'Filiais',
    clientes: 'Clientes',
    'saldos-estoque': 'Saldos',
    movimentacoes: 'Movimentações',
    'notas-fiscais-entrada': 'Recebimentos',
    pedidos: 'Vendas e pedidos',
    relatorios: 'Relatórios',
    notificacoes: 'Notificações',
    chamados: 'Suporte',
    'busca-global': 'Busca global',
  };
  document.querySelectorAll('.settings-tab').forEach(
    (tab) =>
      (tab.onclick = () => {
        document
          .querySelectorAll('.settings-tab,.settings-content')
          .forEach((node) => node.classList.remove('active'));
        tab.classList.add('active');
        $(tab.dataset.tab).classList.add('active');
      }),
  );
  async function reauthenticate() {
    SinstockSession.clear();
    location.assign(SinstockConfig.url('index.html'));
  }
  function bind(id, work) {
    $(id).onsubmit = (event) => {
      event.preventDefault();
      D.saving($(id), work);
    };
  }
  bind('companyForm', async () => {
    const body = {};
    Object.entries(companyFields).forEach(([key, id]) => {
      body[key] = $(id).value.trim() || null;
    });
    await SinstockAPI.request('/configuracoes/empresa', {
      method: 'PATCH',
      body,
    });
    SinstockUI.notify('Dados da empresa salvos.');
  });
  bind('stockSettingsForm', async () => {
    await SinstockAPI.request('/configuracoes/estoque', {
      method: 'PATCH',
      body: {
        dias_validade: Number($('expirationDays').value),
        estoque_minimo_padrao: Number($('defaultMinimumStock').value),
        bloquear_negativo: true,
      },
    });
    SinstockUI.notify('Padrões de estoque salvos.');
  });
  async function savePreferences(body) {
    preferences = await SinstockAPI.request('/configuracoes/preferencias', {
      method: 'PATCH',
      body,
    });
    user.preferencias = preferences;
    SinstockUI.notify('Preferências salvas.');
  }
  bind('notificationPreferences', () =>
    savePreferences({
      notificar_estoque: $('lowStockAlert').checked,
      notificar_validade: $('expirationAlert').checked,
    }),
  );
  bind('systemForm', () =>
    savePreferences({
      itens_por_pagina: Number($('itemsPerPage').value),
      logout_inativo: $('automaticLogout').checked,
    }),
  );
  bind('passwordForm', async () => {
    if ($('newPassword').value !== $('confirmPassword').value)
      throw new Error('A confirmação da senha não confere.');
    await SinstockAPI.request('/auth/password', {
      method: 'PATCH',
      body: {
        senha_atual: $('currentPassword').value,
        nova_senha: $('newPassword').value,
      },
    });
    await reauthenticate();
  });
  async function listUsers() {
    users = await D.get('/users');
    $('usersTableBody').innerHTML = users
      .map(
        (item) =>
          '<tr><td>' +
          D.text(item.nome) +
          '</td><td>' +
          D.text(item.email) +
          '</td><td>' +
          D.text(item.perfis.nome) +
          '</td><td>' +
          (item.ativo ? 'Ativo' : 'Inativo') +
          '</td><td>' +
          D.text(
            item.ultimo_acesso
              ? new Date(item.ultimo_acesso).toLocaleString('pt-BR')
              : 'Sem acesso registrado',
          ) +
          '</td><td><div class="catalog-actions"><button type="button" data-edit-user="' +
          item.id +
          '">Editar</button><button type="button" data-toggle-user="' +
          item.id +
          '">' +
          (item.ativo ? 'Desativar' : 'Ativar') +
          '</button></div></td></tr>',
      )
      .join('');
  }
  function editUser(id) {
    const item = users.find((row) => row.id === id);
    const overlay = D.dialog(
      item ? 'Editar usuário' : 'Novo usuário',
      '<form id="userForm">' +
        '<label>Nome *<input name="nome" maxlength="100" required></label><label>E-mail *<input name="email" type="email" maxlength="100" required></label>' +
        '<label>Telefone<input name="telefone" type="tel" maxlength="20"></label><label>Perfil *<select name="perfil" required></select></label>' +
        '<label>' +
        (item ? 'Nova senha (deixe em branco para manter)' : 'Senha *') +
        '<input name="senha" type="password" minlength="8" maxlength="72" autocomplete="new-password"' +
        (item ? '' : ' required') +
        '></label><button type="submit">Salvar usuário</button></form>',
    );
    overlay.id = 'userModal';
    const form = overlay.querySelector('form');
    D.options(form.elements.perfil, profiles, (row) => row.nome);
    if (item) {
      ['nome', 'email', 'telefone'].forEach((name) => {
        form.elements[name].value = item[name] || '';
      });
      form.elements.perfil.value = item.perfil_id;
    }
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const body = {
          nome: form.elements.nome.value.trim(),
          email: form.elements.email.value.trim(),
          telefone: form.elements.telefone.value.trim(),
          perfil_id: Number(form.elements.perfil.value),
        };
        if (form.elements.senha.value) body.senha = form.elements.senha.value;
        await SinstockAPI.request('/users' + (item ? '/' + item.id : ''), {
          method: item ? 'PATCH' : 'POST',
          body,
        });
        overlay.remove();
        if (item?.id === user.id) {
          await reauthenticate();
          return;
        }
        await listUsers();
        SinstockUI.notify('Usuário salvo.');
      });
    };
  }
  $('openUserModal').onclick = () => editUser();
  $('usersTableBody').onclick = async (event) => {
    const edit = event.target.closest('[data-edit-user]'),
      toggle = event.target.closest('[data-toggle-user]');
    if (edit) editUser(Number(edit.dataset.editUser));
    if (toggle && confirm('Alterar o status deste usuário?')) {
      toggle.disabled = true;
      try {
        await SinstockAPI.request(
          '/users/' + toggle.dataset.toggleUser + '/status',
          { method: 'PATCH' },
        );
        await listUsers();
      } catch (error) {
        toggle.disabled = false;
        SinstockUI.notify(error.message);
      }
    }
  };
  function permissions() {
    const profile = profiles.find(
      (row) => row.id === Number($('permissionProfile').value),
    );
    if (!profile) return;
    let perms = profile.permissoes;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch {
        perms = {};
      }
    }
    $('permissionRows').innerHTML = Object.entries(resources)
      .map(
        ([key, label]) =>
          '<tr><td>' +
          label +
          '</td>' +
          ['ler', 'criar', 'editar', 'excluir']
            .map((action) => {
              const blocked =
                key === 'filiais' && action !== 'ler' && profile.id !== 1;
              const allowed =
                profile.id === 1 ||
                (!blocked &&
                  (perms?.[key] === true ||
                    perms?.[key]?.[action] === true ||
                    (perms?.[key] === undefined && perms?.operacoes === true)));
              return (
                '<td><input type="checkbox" data-resource="' +
                key +
                '" data-action="' +
                action +
                '" aria-label="' +
                label +
                ': ' +
                action +
                '"' +
                (allowed ? ' checked' : '') +
                (profile.id === 1 || blocked ? ' disabled' : '') +
                '></td>'
              );
            })
            .join('') +
          '</tr>',
      )
      .join('');
    $('permissionsForm').querySelector('[type="submit"]').disabled =
      profile.id === 1;
  }
  $('permissionProfile').onchange = permissions;
  const newProfile = document.createElement('button');
  newProfile.type = 'button';
  newProfile.textContent = 'Novo perfil';
  $('permissionProfile').after(newProfile);
  newProfile.onclick = () => {
    const overlay = D.dialog(
      'Novo perfil',
      '<form><label>Nome do perfil *<input name="nome" required maxlength="50"></label><p>Após criar, configure as permissões deste perfil.</p><button type="submit">Criar perfil</button></form>',
    );
    const form = overlay.querySelector('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, async () => {
        const profile = await SinstockAPI.request('/perfis', {
          method: 'POST',
          body: { nome: form.elements.nome.value, permissoes: {} },
        });
        profiles.push(profile);
        D.options($('permissionProfile'), profiles, (row) => row.nome);
        $('permissionProfile').value = profile.id;
        permissions();
        overlay.remove();
      });
    };
  };
  bind('permissionsForm', async () => {
    const profile = profiles.find(
        (row) => row.id === Number($('permissionProfile').value),
      ),
      perms = {};
    $('permissionRows')
      .querySelectorAll('input')
      .forEach((input) => {
        (perms[input.dataset.resource] ||= {})[input.dataset.action] =
          input.checked;
      });
    const updated = await SinstockAPI.request('/perfis/' + profile.id, {
      method: 'PATCH',
      body: { nome: profile.nome, permissoes: perms },
    });
    profiles = profiles.map((row) => (row.id === updated.id ? updated : row));
    permissions();
    SinstockUI.notify('Permissões salvas e aplicadas pela API.');
  });
  function codeForm(title, first, work) {
    const overlay = D.dialog(
      title,
      '<form><label>Senha atual *<input name="senha" type="password" required maxlength="72" autocomplete="current-password"></label>' +
        '<div data-code hidden><label>Código de seis dígitos *<input name="codigo" inputmode="numeric" pattern="[0-9]{6}" maxlength="6"></label></div>' +
        '<p role="status" data-message></p><button type="submit">' +
        first +
        '</button></form>',
    );
    const form = overlay.querySelector('form');
    form.onsubmit = (event) => {
      event.preventDefault();
      D.saving(form, () => work(form, overlay));
    };
    return overlay;
  }
  $('enableEmail2fa').onclick = () => {
    let challenge;
    codeForm(
      'Ativar segundo fator por e-mail',
      'Enviar código',
      async (form, overlay) => {
        if (!challenge) {
          challenge = await SinstockAPI.request('/auth/2fa/email/setup', {
            method: 'POST',
            body: { senha_atual: form.elements.senha.value },
          });
          form.querySelector('[data-code]').hidden = false;
          form.elements.codigo.required = true;
          form.querySelector('[data-message]').textContent =
            'Código enviado. Validade de cinco minutos.';
          form.querySelector('[type="submit"]').textContent =
            'Confirmar ativação';
        } else {
          await SinstockAPI.request('/auth/2fa/email/enable', {
            method: 'POST',
            body: {
              challenge_id: challenge.challengeId,
              codigo: form.elements.codigo.value,
            },
          });
          overlay.remove();
          await reauthenticate();
        }
      },
    );
  };
  $('enableTotp2fa').onclick = async () => {
    try {
      const result = await SinstockAPI.request('/auth/2fa/generate', {
        method: 'POST',
      });
      const overlay = D.dialog(
        'Ativar aplicativo autenticador',
        '<p>Escaneie o QR Code no seu aplicativo e confirme o código.</p><img alt="QR Code do autenticador" class="totp-qr">' +
          '<p>Chave manual: <code>' +
          D.text(result.secret) +
          '</code></p><form><label>Código *<input name="codigo" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><button type="submit">Ativar</button></form>',
      );
      overlay.querySelector('img').src = result.qrCodeDataUrl;
      const form = overlay.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        D.saving(form, async () => {
          await SinstockAPI.request('/auth/2fa/enable', {
            method: 'POST',
            body: { codigo: form.elements.codigo.value },
          });
          overlay.remove();
          await reauthenticate();
        });
      };
    } catch (error) {
      SinstockUI.notify(error.message);
    }
  };
  $('disable2fa').onclick = () => {
    let challenge;
    const email = user.two_factor_method === 'EMAIL';
    const overlay = codeForm(
      'Desativar segundo fator',
      email ? 'Enviar código' : 'Confirmar desativação',
      async (form, modal) => {
        if (email && !challenge) {
          challenge = await SinstockAPI.request(
            '/auth/2fa/email/disable-code',
            {
              method: 'POST',
              body: { senha_atual: form.elements.senha.value },
            },
          );
          form.querySelector('[data-code]').hidden = false;
          form.elements.codigo.required = true;
          form.querySelector('[type="submit"]').textContent =
            'Confirmar desativação';
          form.querySelector('[data-message]').textContent =
            'Código enviado ao seu e-mail.';
        } else {
          await SinstockAPI.request('/auth/2fa/disable', {
            method: 'POST',
            body: {
              senha_atual: form.elements.senha.value,
              codigo: form.elements.codigo.value,
              challenge_id: challenge?.challengeId,
            },
          });
          modal.remove();
          await reauthenticate();
        }
      },
    );
    if (!email) {
      overlay.querySelector('[data-code]').hidden = false;
      overlay.querySelector('[name="codigo"]').required = true;
    }
  };
  SinstockSession.ready
    .then(async (current) => {
      if (!current) return;
      user = current;
      [settings, preferences] = await Promise.all([
        D.get('/configuracoes/publicas'),
        D.get('/configuracoes/preferencias'),
      ]);
      user.preferencias = preferences;
      Object.entries(companyFields).forEach(([key, id]) => {
        $(id).value = settings.empresa[key] || '';
        $(id).readOnly = user.perfil_id !== 1;
      });
      $('expirationDays').value = settings.estoque.dias_validade;
      $('defaultMinimumStock').value = settings.estoque.estoque_minimo_padrao;
      $('lowStockAlert').checked = preferences.notificar_estoque;
      $('expirationAlert').checked = preferences.notificar_validade;
      $('automaticLogout').checked = preferences.logout_inativo;
      $('itemsPerPage').value = preferences.itens_por_pagina;
      $('twoFactorStatus').textContent = user.isTwoFactorEnable
        ? 'Ativo: ' +
          (user.two_factor_method === 'EMAIL'
            ? 'e-mail'
            : 'aplicativo autenticador')
        : 'Desativado.';
      $('enableEmail2fa').hidden = $('enableTotp2fa').hidden =
        user.isTwoFactorEnable;
      $('disable2fa').hidden = !user.isTwoFactorEnable;
      if (user.perfil_id === 1) {
        profiles = await D.get('/perfis');
        D.options($('permissionProfile'), profiles, (row) => row.nome);
        $('permissionProfile').value =
          profiles.find((row) => row.id !== 1)?.id || 1;
        permissions();
        await listUsers();
      }
    })
    .catch((error) => {
      $('settingsError').textContent = error.message;
    });
})();
