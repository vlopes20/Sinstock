(() => {
  'use strict';
  async function scan(onCode) {
    document
      .querySelectorAll('[data-camera-dialog]')
      .forEach((node) => node.remove());
    const overlay = document.createElement('div');
    overlay.dataset.cameraDialog = '';
    overlay.className = 'catalog-modal-overlay active';
    overlay.innerHTML =
      '<div class="product-modal"><div class="product-modal-header"><h2>Ler código pela câmera</h2><button type="button" data-close>Fechar</button></div>' +
      '<div class="catalog-content"><p>Aponte a câmera para o código de barras do produto.</p><video playsinline muted autoplay class="barcode-preview"></video><p role="status"></p></div></div>';
    document.body.append(overlay);
    const video = overlay.querySelector('video'),
      status = overlay.querySelector('[role="status"]');
    let controls,
      stopped = false,
      delivered = false;
    function stop() {
      stopped = true;
      controls?.stop();
      video.srcObject?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    const observer = new MutationObserver(() => {
      if (!overlay.isConnected || !overlay.classList.contains('active')) {
        stop();
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    overlay.querySelector('[data-close]').onclick = () => {
      stop();
      overlay.remove();
    };
    overlay.onclick = (event) => {
      if (event.target === overlay) {
        stop();
        overlay.remove();
      }
    };
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.ZXingBrowser)
        throw new Error('UNAVAILABLE');
      const reader = new ZXingBrowser.BrowserMultiFormatReader();
      controls = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: 'environment' } } },
        video,
        (result, error, activeControls) => {
          if (!result || stopped || delivered) return;
          delivered = true;
          activeControls.stop();
          stop();
          overlay.remove();
          Promise.resolve(onCode(result.getText())).catch((error) =>
            SinstockUI.notify(error.message),
          );
        },
      );
      if (stopped) controls.stop();
      else
        status.textContent =
          'Câmera ativa. A leitura preenche o código encontrado.';
    } catch (error) {
      stop();
      status.textContent =
        error.name === 'NotAllowedError'
          ? 'O acesso à câmera não foi autorizado. Você pode liberar o acesso no navegador ou digitar o código.'
          : 'Não foi possível iniciar a câmera. Confira o dispositivo e use HTTPS ou localhost. O código também pode ser digitado.';
    }
  }
  window.SinstockScanner = { scan };
})();
