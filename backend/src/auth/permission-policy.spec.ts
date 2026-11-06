import { canAccess } from './permission-policy';
describe('Permission policy', () => {
  it.each([
    [1, {}, 'produtos', 'ler', true],
    [2, { admin: true }, 'filiais', 'editar', true],
    [2, { todas: true }, 'produtos', 'ler', true],
    [2, { operacoes: true }, 'produtos', 'ler', true],
    [
      2,
      { operacoes: true, produtos: { ler: false } },
      'produtos',
      'ler',
      false,
    ],
    [2, { produtos: true }, 'produtos', 'ler', true],
    [2, { produtos: { ler: true } }, 'produtos', 'editar', false],
    [2, { filiais: true }, 'filiais', 'editar', false],
    [2, '{invalid', 'produtos', 'ler', false],
    [2, JSON.stringify({ produtos: { ler: true } }), 'produtos', 'ler', true],
  ])(
    'preserves policy case %#',
    (perfil_id, permissoes, resource, action, expected) => {
      expect(canAccess({ perfil_id, permissoes }, resource, action)).toBe(
        expected,
      );
    },
  );
  it('fails closed without identity', () =>
    expect(canAccess(undefined, 'produtos', 'ler')).toBe(false));
});
