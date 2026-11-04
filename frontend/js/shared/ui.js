/* Comportamentos comuns às páginas; não implementa autenticação. */
(function () {
    "use strict";
    let timer;
    const toast = document.createElement("div");
    toast.className = "shared-toast";
    toast.setAttribute("role", "status");
    window.SinstockUI = {
        notify(message) {
            if (!toast.isConnected) document.body.append(toast);
            clearTimeout(timer);
            toast.textContent = message;
            timer = setTimeout(() => { toast.textContent = ""; }, 6500);
        },
        escape(value) {
            const span = document.createElement("span");
            span.textContent = String(value);
            return span.innerHTML;
        }
    };
    document.addEventListener("DOMContentLoaded", () => {
        const sidebar = document.querySelector(".sidebar");
        const main = document.querySelector("main");
        const topbar = document.querySelector(".topbar");
        if (!sidebar || !main || !topbar) return;
        main.id = "main-content";
        main.tabIndex = -1;
        const skip = document.createElement("a");
        skip.href = "#main-content";
        skip.className = "skip-link";
        skip.textContent = "Pular para o conteúdo";
        document.body.prepend(skip);
        const notice = document.createElement("div");
        notice.className = "demo-notice";
        notice.textContent = "Login conectado ao servidor. As telas de estoque, vendas e relatórios ainda exibem dados de demonstração.";
        topbar.after(notice);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "mobile-menu-toggle";
        toggle.innerHTML = '<i class="converted-icon" data-lucide="menu" aria-hidden="true"></i>';
        toggle.setAttribute("aria-label", "Abrir navegação");
        sidebar.id = "app-sidebar";
        toggle.setAttribute("aria-controls", sidebar.id);
        toggle.setAttribute("aria-expanded", "false");
        topbar.prepend(toggle);
        const close = document.createElement("button");
        close.type = "button";
        close.className = "mobile-menu-close";
        close.innerHTML = '<i class="converted-icon" data-lucide="x" aria-hidden="true"></i>';
        close.setAttribute("aria-label", "Fechar navegação");
        sidebar.prepend(close);
        if (window.lucide) window.lucide.createIcons();
        const backdrop = document.createElement("button");
        backdrop.type = "button";
        backdrop.className = "menu-backdrop";
        backdrop.tabIndex = -1;
        backdrop.setAttribute("aria-label", "Fechar navegação");
        document.body.append(backdrop);
        let previousOverflow = "";
        function closeMenu(restore = true) {
            if (!sidebar.classList.contains("mobile-open")) return;
            sidebar.classList.remove("mobile-open");
            backdrop.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            main.inert = false;
            document.body.style.overflow = previousOverflow;
            if (restore) toggle.focus();
        }
        toggle.addEventListener("click", () => {
            previousOverflow = document.body.style.overflow;
            sidebar.classList.add("mobile-open");
            backdrop.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            main.inert = true;
            document.body.style.overflow = "hidden";
            close.focus();
        });
        close.addEventListener("click", () => closeMenu());
        backdrop.addEventListener("click", () => closeMenu());
        window.addEventListener("resize", () => { if (window.innerWidth > 850) closeMenu(false); });
        const page = location.pathname.split("/").pop();
        // Controles ainda não implementados ficam identificados, não silenciosos.
        const pending = [...document.querySelectorAll(".product-actions,.supplier-actions,.sale-actions,.user-action-button,.ticket-actions")];
        if (page !== "pedidos.html" && page !== "estoque.html") pending.push(...document.querySelectorAll(".pagination button"));
        pending.forEach(button => {
            button.disabled = true;
            button.title = "Disponível em uma próxima etapa do protótipo";
            button.setAttribute("aria-label", "Ação ainda não implementada");
        });
        document.querySelectorAll(".notification-number").forEach(badge => { badge.hidden = true; });
        sidebar.querySelectorAll("a").forEach(link => {
            const active = link.getAttribute("href") === page;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
        const panels = [];
        function addMenu(trigger, label, links) {
            if (!trigger) return;
            const panel = document.createElement("div");
            panel.className = "shared-dropdown";
            panel.hidden = true;
            panel.id = `shared-menu-${panels.length}`;
            trigger.setAttribute("aria-controls", panel.id);
            trigger.setAttribute("aria-expanded", "false");
            const title = document.createElement("strong");
            title.textContent = label;
            panel.append(title);
            links.forEach(([text, href]) => {
                const link = document.createElement("a");
                link.href = href;
                link.textContent = text;
                panel.append(link);
            });
            document.body.append(panel);
            panels.push({ trigger, panel });
            trigger.addEventListener("click", () => {
                const open = panel.hidden;
                panels.forEach(item => { item.panel.hidden = true; item.trigger.setAttribute("aria-expanded", "false"); });
                panel.hidden = !open;
                trigger.setAttribute("aria-expanded", String(open));
                if (open) panel.querySelector("a").focus();
            });
        }
        if (page) {
            if (page !== "dashboard.html") addMenu(document.querySelector(".notification"), "Alertas de demonstração", [["Consultar saldos e mínimos", "estoque.html"]]);
            if (page !== "dashboard.html") addMenu(document.querySelector(".user"), "Minha conta", [["Configurações", "configuracoes.html"]]);
        }
        document.addEventListener("click", event => panels.forEach(item => {
            if (!item.panel.contains(event.target) && !item.trigger.contains(event.target)) {
                item.panel.hidden = true;
                item.trigger.setAttribute("aria-expanded", "false");
            }
        }));
        document.querySelectorAll(".notification, .user").forEach(element => {
            element.tabIndex = 0;
            element.setAttribute("role", "button");
            element.setAttribute("aria-label", element.matches(".user") ? "Menu do usuário" : "Notificações de demonstração");
            element.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") { event.preventDefault(); element.click(); }
            });
        });
        const search = document.querySelector(".search-box input");
        if (search) {
            search.setAttribute("aria-label", "Busca global ainda não integrada");
            if (page !== "dashboard.html") search.addEventListener("keydown", event => {
                if (event.key === "Enter") window.SinstockUI.notify("A busca global ainda não está integrada. Use os filtros da página.");
            });
        }
        const modalSelector = '[class*="modal-overlay"]';
        const prepared = new WeakSet();
        const origins = new WeakMap();
        let activeModal = null;
        function refreshModals() {
            document.querySelectorAll(modalSelector).forEach(modal => {
                if (!prepared.has(modal)) {
                    prepared.add(modal);
                    modal.setAttribute("role", "dialog");
                    modal.setAttribute("aria-modal", "true");
                    modal.setAttribute("aria-label", modal.querySelector("h2")?.textContent.trim() || "Formulário");
                    modal.tabIndex = -1;
                }
                const open = modal.classList.contains("active");
                modal.setAttribute("aria-hidden", String(!open));
                if (open && activeModal !== modal) {
                    origins.set(modal, document.activeElement);
                    activeModal = modal;
                    (focusable(modal)[0] || modal).focus();
                } else if (!open && activeModal === modal) {
                    activeModal = null;
                    origins.get(modal)?.focus();
                }
            });
        }
        refreshModals();
        new MutationObserver(refreshModals).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
        function focusable(container) {
            return [...container.querySelectorAll('a[href],button,input:not([type="hidden"]),select,textarea,[tabindex="0"]')]
                .filter(element => !element.disabled && element.getClientRects().length);
        }
        function trapFocus(event, container) {
            const elements = focusable(container);
            if (!elements.length) { event.preventDefault(); container.focus(); return; }
            const first = elements[0], last = elements[elements.length - 1];
            if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
                event.preventDefault(); first.focus();
            }
        }
        document.addEventListener("keydown", event => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && search && !activeModal) {
                event.preventDefault(); search.focus();
            }
            if (event.key === "Escape") {
                closeMenu();
                panels.forEach(item => {
                    if (!item.panel.hidden) { item.panel.hidden = true; item.trigger.setAttribute("aria-expanded", "false"); item.trigger.focus(); }
                });
                if (activeModal) { event.preventDefault(); activeModal.classList.remove("active"); }
            }
            if (event.key === "Tab") {
                if (sidebar.classList.contains("mobile-open")) trapFocus(event, sidebar);
                else if (activeModal) trapFocus(event, activeModal);
            }
        });
        document.addEventListener("keydown", event => {
            if (activeModal && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    });
})();
