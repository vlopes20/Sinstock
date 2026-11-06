export type PermissionUser = { perfil_id: number; permissoes?: unknown };

export function isAdministrator(user?: PermissionUser): boolean {
  const permissions = normalizedPermissions(user?.permissoes);
  return (
    !!user &&
    (user.perfil_id === 1 ||
      permissions.admin === true ||
      permissions.todas === true)
  );
}

function normalizedPermissions(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function canAccess(
  user: PermissionUser | undefined,
  resource: string,
  action: string,
): boolean {
  if (!user) return false;
  if (isAdministrator(user)) return true;
  if (resource === 'filiais' && action !== 'ler') return false;
  const permissions = normalizedPermissions(user.permissoes);
  const configured = permissions[resource];
  const actionAllowed =
    configured !== null &&
    typeof configured === 'object' &&
    (configured as Record<string, unknown>)[action] === true;
  return (
    configured === true ||
    actionAllowed ||
    (configured === undefined && permissions.operacoes === true)
  );
}
