(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const localServer = ['5500', '5173', '8080'].includes(location.port);
  // Set apiBaseUrl here (or window.SINSTOCK_CONFIG before this script) for a separate API host.
  const settings = {
    apiBaseUrl: localServer
      ? `${location.protocol}//${location.hostname}:3000`
      : location.origin,
    ...window.SINSTOCK_CONFIG,
  };
  window.SinstockConfig = Object.freeze({
    apiBaseUrl: settings.apiBaseUrl.replace(/\/$/, ''),
    url: (relative) => new URL(relative, root).href,
  });
})();
