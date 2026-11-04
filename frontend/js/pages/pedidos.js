/* =========================================================
   SINSTOCK - PEDIDOS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTOS PRINCIPAIS
    ====================================================== */

    const orderSearch =
        document.querySelector(".order-search input");

    const orderFilters =
        document.querySelectorAll(".order-filters select");

    const statusFilter =
        orderFilters[0];

    const periodFilter =
        orderFilters[1];

    const tableBody =
        document.querySelector(".orders-table tbody");

    const pagination =
        document.querySelector(".pagination");

    const footerText =
        document.querySelector(".orders-footer > span");

    const newOrderButton =
        document.getElementById("openOrderModal");

    const dateElement =
        document.querySelector(".date span");

    const globalSearch =
        document.querySelector(".search-box input");

    const summaryNumbers =
        document.querySelectorAll(
            ".summary-information strong"
        );


    /* =====================================================
       CONFIGURAÇÃO DA PAGINAÇÃO
    ====================================================== */

    let currentPage = 1;

    const itemsPerPage = 5;


    /* =====================================================
       1. DATA ATUAL NA TOPBAR
    ====================================================== */

    function updateCurrentDate() {

        if (!dateElement) {
            return;
        }


        const today = new Date();


        const formattedDate =
            today.toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );


        dateElement.textContent =
            formattedDate;

    }


    updateCurrentDate();


    /* =====================================================
       2. SIDEBAR ATIVA
    ====================================================== */

    function setActiveSidebarItem() {

        const currentPageName =
            window.location.pathname
                .split("/")
                .pop();


        const menuItems =
            document.querySelectorAll(
                ".sidebar .menu-item"
            );


        menuItems.forEach(function (item) {

            item.classList.remove(
                "active"
            );


            const href =
                item.getAttribute("href");


            if (
                href &&
                href === currentPageName
            ) {

                item.classList.add(
                    "active"
                );

            }

        });

    }


    setActiveSidebarItem();


    /* =====================================================
       3. CTRL + K PARA BUSCA DA TOPBAR
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            const controlPressed =
                event.ctrlKey ||
                event.metaKey;


            if (
                controlPressed &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();


                if (globalSearch) {

                    globalSearch.focus();

                    globalSearch.select();

                }

            }

        }
    );


    /* =====================================================
       FUNÇÕES AUXILIARES
    ====================================================== */

    function normalizeText(text) {

        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim();

    }


    function parseDateBR(dateString) {

        if (!dateString) {
            return null;
        }


        const dateOnly =
            dateString
                .trim()
                .split(" ")[0];


        const parts =
            dateOnly.split("/");


        if (parts.length !== 3) {
            return null;
        }


        const day =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;

        const year =
            Number(parts[2]);


        return new Date(
            year,
            month,
            day
        );

    }


    /* =====================================================
       4. DESCOBRIR STATUS DA LINHA
    ====================================================== */

    function getRowStatus(row) {

        if (row.dataset.status) {

            return row.dataset.status;

        }


        const status =
            row.querySelector(
                ".order-status"
            );


        if (!status) {
            return "";
        }


        const text =
            normalizeText(
                status.textContent
            );


        if (
            text.includes("pendente")
        ) {

            return "pendente";

        }


        if (
            text.includes("separacao")
        ) {

            return "preparando";

        }


        if (
            text.includes("enviado")
        ) {

            return "enviado";

        }


        if (
            text.includes("concluido")
        ) {

            return "concluido";

        }


        if (
            text.includes("cancelado")
        ) {

            return "cancelado";

        }


        return "";

    }


    /* =====================================================
       5. FILTRO DE PERÍODO
    ====================================================== */

    function matchesPeriod(row) {

        if (
            !periodFilter ||
            periodFilter.value === ""
        ) {

            return true;

        }


        const dateCell =
            row.querySelector(
                "td:nth-child(3)"
            );


        if (!dateCell) {
            return true;
        }


        const orderDate =
            parseDateBR(
                dateCell.textContent
            );


        if (!orderDate) {
            return true;
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        orderDate.setHours(
            0,
            0,
            0,
            0
        );


        const period =
            normalizeText(
                periodFilter.value
            );


        if (
            period.includes("hoje")
        ) {

            return (
                orderDate.getTime() ===
                today.getTime()
            );

        }


        if (
            period.includes("7 dias")
        ) {

            const start =
                new Date(today);


            start.setDate(
                start.getDate() - 7
            );


            return (
                orderDate >= start &&
                orderDate <= today
            );

        }


        if (
            period.includes("30 dias")
        ) {

            const start =
                new Date(today);


            start.setDate(
                start.getDate() - 30
            );


            return (
                orderDate >= start &&
                orderDate <= today
            );

        }


        if (
            period.includes("este mes")
        ) {

            return (
                orderDate.getMonth() ===
                today.getMonth() &&

                orderDate.getFullYear() ===
                today.getFullYear()
            );

        }


        return true;

    }


    /* =====================================================
       6. PEGAR LINHAS FILTRADAS
    ====================================================== */

    function getFilteredRows() {

        const rows =
            Array.from(
                tableBody.querySelectorAll(
                    "tr"
                )
            );


        const search =
            orderSearch
                ? normalizeText(
                    orderSearch.value
                )
                : "";


        const selectedStatus =
            statusFilter
                ? normalizeText(
                    statusFilter.value
                )
                : "";


        return rows.filter(
            function (row) {

                const text =
                    normalizeText(
                        row.textContent
                    );


                const rowStatus =
                    normalizeText(
                        getRowStatus(row)
                    );


                const matchesSearch =
                    search === "" ||
                    text.includes(search);


                let matchesStatus =
                    true;


                if (
                    selectedStatus !== ""
                ) {

                    if (
                        selectedStatus.includes(
                            "separacao"
                        )
                    ) {

                        matchesStatus =
                            rowStatus ===
                            "preparando";

                    } else if (
                        selectedStatus.includes(
                            "concluido"
                        )
                    ) {

                        matchesStatus =
                            rowStatus ===
                            "concluido";

                    } else {

                        matchesStatus =
                            rowStatus.includes(
                                selectedStatus
                            );

                    }

                }


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPeriod(row)
                );

            }
        );

    }


    /* =====================================================
       7. ATUALIZAR TABELA / PAGINAÇÃO
    ====================================================== */

    function updateTable() {

        if (!tableBody) {
            return;
        }


        const allRows =
            Array.from(
                tableBody.querySelectorAll(
                    "tr"
                )
            );


        const filteredRows =
            getFilteredRows();


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    filteredRows.length /
                    itemsPerPage
                )
            );


        if (
            currentPage >
            totalPages
        ) {

            currentPage =
                totalPages;

        }


        allRows.forEach(
            function (row) {

                row.style.display =
                    "none";

            }
        );


        const start =
            (
                currentPage - 1
            ) *
            itemsPerPage;


        const end =
            start +
            itemsPerPage;


        const visibleRows =
            filteredRows.slice(
                start,
                end
            );


        visibleRows.forEach(
            function (row) {

                row.style.display = "";

            }
        );


        updateFooter(
            filteredRows.length,
            start,
            visibleRows.length
        );


        createPagination(
            totalPages
        );

    }


    /* =====================================================
       RODAPÉ DA TABELA
    ====================================================== */

    function updateFooter(
        total,
        start,
        visible
    ) {

        if (!footerText) {
            return;
        }


        if (total === 0) {

            footerText.textContent =
                "Nenhum pedido encontrado";

            return;

        }


        footerText.textContent =
            `Mostrando ${start + 1
            } a ${start + visible
            } de ${total
            } pedidos`;

    }


    /* =====================================================
       PAGINAÇÃO
    ====================================================== */

    function createPagination(
        totalPages
    ) {

        if (!pagination) {
            return;
        }


        pagination.innerHTML = "";


        const previous =
            document.createElement(
                "button"
            );


        previous.textContent = "‹";

        previous.disabled =
            currentPage === 1;


        previous.addEventListener(
            "click",
            function () {

                if (
                    currentPage > 1
                ) {

                    currentPage--;

                    updateTable();

                }

            }
        );


        pagination.appendChild(
            previous
        );


        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            /*
               Para não criar dezenas
               de botões
            */

            if (
                totalPages > 7 &&
                page > 3 &&
                page <
                totalPages - 1
            ) {

                if (page === 4) {

                    const dots =
                        document.createElement(
                            "button"
                        );


                    dots.textContent =
                        "...";


                    dots.disabled =
                        true;


                    pagination.appendChild(
                        dots
                    );

                }


                continue;

            }


            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                page;


            if (
                page === currentPage
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                function () {

                    currentPage =
                        page;


                    updateTable();

                }
            );


            pagination.appendChild(
                button
            );

        }


        const next =
            document.createElement(
                "button"
            );


        next.textContent =
            "›";


        next.disabled =
            currentPage ===
            totalPages;


        next.addEventListener(
            "click",
            function () {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    updateTable();

                }

            }
        );


        pagination.appendChild(
            next
        );

    }


    /* =====================================================
       EVENTOS DOS FILTROS
    ====================================================== */

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            function () {

                currentPage = 1;

                updateTable();

            }
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                updateTable();

            }
        );

    }


    if (periodFilter) {

        periodFilter.addEventListener(
            "change",
            function () {

                currentPage = 1;

                updateTable();

            }
        );

    }


    /* =====================================================
       8. MODAL NOVO PEDIDO
    ====================================================== */

    function createOrderModal() {

        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "order-modal-overlay";


        overlay.id =
            "newOrderModal";


        overlay.innerHTML = `

            <div class="order-modal">

                <div class="order-modal-header">

                    <div>

                        <h2>
                            Novo pedido
                        </h2>

                        <p>
                            Informe o cliente e adicione os produtos.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="close-order-modal"
                    >
                        ×
                    </button>

                </div>


                <form id="newOrderForm">

                    <div class="order-form-group">

                        <label>
                            Cliente *
                        </label>

                        <select
                            id="newOrderCustomer"
                            required
                        >

                            <option value="">
                                Selecione o cliente
                            </option>

                            <option value="João Lima">
                                João Lima
                            </option>

                            <option value="Maria Souza">
                                Maria Souza
                            </option>

                            <option value="Carlos Pereira">
                                Carlos Pereira
                            </option>

                            <option value="Ana Santos">
                                Ana Santos
                            </option>

                            <option value="Rafael Ferreira">
                                Rafael Ferreira
                            </option>

                        </select>

                    </div>


                    <div class="order-products-title">

                        <strong>
                            Produtos
                        </strong>


                        <button
                            type="button"
                            id="addOrderProduct"
                        >
                            + Adicionar produto
                        </button>

                    </div>


                    <div id="orderProducts">

                    </div>


                    <div class="order-form-row">

                        <div class="order-form-group">

                            <label>
                                Forma de pagamento *
                            </label>

                            <select
                                id="newOrderPayment"
                                required
                            >

                                <option value="">
                                    Selecione
                                </option>

                                <option value="PIX">
                                    PIX
                                </option>

                                <option value="Cartão">
                                    Cartão
                                </option>

                                <option value="Dinheiro">
                                    Dinheiro
                                </option>

                            </select>

                        </div>


                        <div class="order-form-group">

                            <label>
                                Desconto (R$)
                            </label>

                            <input
                                type="number"
                                id="newOrderDiscount"
                                min="0"
                                step="0.01"
                                value="0"
                            >

                        </div>

                    </div>


                    <div class="order-form-group">

                        <label>
                            Observação
                        </label>

                        <textarea
                            id="newOrderObservation"
                            rows="3"
                            placeholder="Informações adicionais..."
                        ></textarea>

                    </div>


                    <div class="order-total-box">

                        <div>

                            <span>
                                Subtotal
                            </span>

                            <strong id="orderSubtotal">
                                R$ 0,00
                            </strong>

                        </div>


                        <div>

                            <span>
                                Desconto
                            </span>

                            <strong id="orderDiscountValue">
                                R$ 0,00
                            </strong>

                        </div>


                        <div class="order-total-final">

                            <span>
                                Total
                            </span>

                            <strong id="orderTotal">
                                R$ 0,00
                            </strong>

                        </div>

                    </div>


                    <div class="order-modal-footer">

                        <button
                            type="button"
                            class="cancel-order-button"
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            class="save-order-button"
                        >
                            Criar pedido
                        </button>

                    </div>

                </form>

            </div>
        `;


        document.body.appendChild(
            overlay
        );


        return overlay;

    }


    const orderModal =
        createOrderModal();


    /* =====================================================
       PRODUTOS DO PEDIDO
    ====================================================== */

    const productsContainer =
        orderModal.querySelector(
            "#orderProducts"
        );


    const products = [

        {
            name:
                "Arroz Tipo 1",

            price:
                31.90
        },

        {
            name:
                "Feijão Carioca",

            price:
                10.50
        },

        {
            name:
                "Café Tradicional",

            price:
                22.90
        },

        {
            name:
                "Refrigerante Cola",

            price:
                10.90
        }

    ];


    function createProductRow() {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "order-product-row";


        const options =
            products
                .map(
                    function (product) {

                        return `

                            <option
                                value="${product.name}"
                                data-price="${product.price}"
                            >
                                ${product.name}
                            </option>

                        `;

                    }
                )
                .join("");


        row.innerHTML = `

            <select
                class="order-product-select"
            >

                <option
                    value=""
                    data-price="0"
                >
                    Selecione o produto
                </option>

                ${options}

            </select>


            <input
                type="number"
                class="order-product-quantity"
                min="1"
                value="1"
            >


            <div class="order-product-total">
                R$ 0,00
            </div>


            <button
                type="button"
                class="remove-order-product"
            >
                ×
            </button>

        `;


        productsContainer.appendChild(
            row
        );


        calculateOrderTotal();

    }


    createProductRow();


    /* =====================================================
       FORMATAR DINHEIRO
    ====================================================== */

    function formatCurrency(
        value
    ) {

        return value.toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );

    }


    /* =====================================================
       CALCULAR PEDIDO
    ====================================================== */

    function calculateOrderTotal() {

        const rows =
            productsContainer
                .querySelectorAll(
                    ".order-product-row"
                );


        let subtotal = 0;


        rows.forEach(
            function (row) {

                const select =
                    row.querySelector(
                        ".order-product-select"
                    );


                const quantity =
                    Number(
                        row.querySelector(
                            ".order-product-quantity"
                        ).value
                    ) || 0;


                const selectedOption =
                    select.options[
                    select.selectedIndex
                    ];


                const price =
                    Number(
                        selectedOption
                            .dataset
                            .price
                    ) || 0;


                const rowTotal =
                    price *
                    quantity;


                subtotal +=
                    rowTotal;


                row.querySelector(
                    ".order-product-total"
                ).textContent =
                    formatCurrency(
                        rowTotal
                    );

            }
        );


        const discount =
            Number(
                orderModal
                    .querySelector(
                        "#newOrderDiscount"
                    )
                    .value
            ) || 0;


        const total =
            Math.max(
                subtotal -
                discount,
                0
            );


        orderModal
            .querySelector(
                "#orderSubtotal"
            )
            .textContent =
            formatCurrency(
                subtotal
            );


        orderModal
            .querySelector(
                "#orderDiscountValue"
            )
            .textContent =
            formatCurrency(
                discount
            );


        orderModal
            .querySelector(
                "#orderTotal"
            )
            .textContent =
            formatCurrency(
                total
            );


        return {
            subtotal,
            discount,
            total
        };

    }


    /* =====================================================
       ADICIONAR PRODUTO
    ====================================================== */

    orderModal
        .querySelector(
            "#addOrderProduct"
        )
        .addEventListener(
            "click",
            createProductRow
        );


    /* =====================================================
       ALTERAÇÃO DE PRODUTO / QUANTIDADE
    ====================================================== */

    productsContainer.addEventListener(
        "change",
        calculateOrderTotal
    );


    productsContainer.addEventListener(
        "input",
        calculateOrderTotal
    );


    orderModal
        .querySelector(
            "#newOrderDiscount"
        )
        .addEventListener(
            "input",
            calculateOrderTotal
        );


    /* =====================================================
       REMOVER PRODUTO
    ====================================================== */

    productsContainer.addEventListener(
        "click",
        function (event) {

            if (
                !event.target
                    .classList
                    .contains(
                        "remove-order-product"
                    )
            ) {

                return;

            }


            const rows =
                productsContainer
                    .querySelectorAll(
                        ".order-product-row"
                    );


            if (
                rows.length === 1
            ) {

                showToast(
                    "O pedido precisa ter pelo menos um produto.",
                    "warning"
                );

                return;

            }


            event.target
                .closest(
                    ".order-product-row"
                )
                .remove();


            calculateOrderTotal();

        }
    );


    /* =====================================================
       ABRIR E FECHAR MODAL
    ====================================================== */

    function openOrderModal() {

        orderModal
            .classList
            .add("active");

    }


    function closeOrderModal() {

        orderModal
            .classList
            .remove("active");

    }


    newOrderButton.addEventListener(
        "click",
        function () {

            orderModal.classList.add("active");

        }
    )


    orderModal
        .querySelector(
            ".close-order-modal"
        )
        .addEventListener(
            "click",
            closeOrderModal
        );


    orderModal
        .querySelector(
            ".cancel-order-button"
        )
        .addEventListener(
            "click",
            closeOrderModal
        );


    orderModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                orderModal
            ) {

                closeOrderModal();

            }

        }
    );


    /* =====================================================
       PEGAR PRÓXIMO NÚMERO DO PEDIDO
    ====================================================== */

    function getNextOrderNumber() {

        const codes =
            Array.from(
                tableBody.querySelectorAll(
                    ".order-number"
                )
            )
                .map(
                    function (element) {

                        return Number(
                            element
                                .textContent
                                .replace(
                                    /\D/g,
                                    ""
                                )
                        ) || 0;

                    }
                );


        const maximum =
            Math.max(
                ...codes,
                1000
            );


        return maximum + 1;

    }


    /* =====================================================
       INICIAIS DO CLIENTE
    ====================================================== */

    function getInitials(
        name
    ) {

        return name
            .split(" ")
            .filter(Boolean)
            .map(
                word => word[0]
            )
            .join("")
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    /* =====================================================
       ALTERAR NÚMEROS DOS CARDS
    ====================================================== */

    function changeSummaryCard(
        index,
        amount
    ) {

        if (
            !summaryNumbers[index]
        ) {

            return;

        }


        const current =
            Number(
                summaryNumbers[index]
                    .textContent
                    .replace(
                        /\D/g,
                        ""
                    )
            ) || 0;


        summaryNumbers[index]
            .textContent =
            Math.max(
                current +
                amount,
                0
            );

    }


    /* =====================================================
       9. CRIAR PEDIDO
    ====================================================== */

    orderModal
        .querySelector(
            "#newOrderForm"
        )
        .addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const customer =
                    orderModal
                        .querySelector(
                            "#newOrderCustomer"
                        )
                        .value;


                const payment =
                    orderModal
                        .querySelector(
                            "#newOrderPayment"
                        )
                        .value;


                const productRows =
                    productsContainer
                        .querySelectorAll(
                            ".order-product-row"
                        );


                let totalItems = 0;

                let hasProduct =
                    false;


                productRows.forEach(
                    function (row) {

                        const product =
                            row.querySelector(
                                ".order-product-select"
                            ).value;


                        const quantity =
                            Number(
                                row.querySelector(
                                    ".order-product-quantity"
                                ).value
                            ) || 0;


                        if (
                            product !== "" &&
                            quantity > 0
                        ) {

                            hasProduct =
                                true;


                            totalItems +=
                                quantity;

                        }

                    }
                );


                if (!hasProduct) {

                    showToast(
                        "Adicione pelo menos um produto ao pedido.",
                        "warning"
                    );

                    return;

                }


                const totals =
                    calculateOrderTotal();


                const number =
                    getNextOrderNumber();


                const today =
                    new Date()
                        .toLocaleDateString(
                            "pt-BR"
                        );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.dataset.status =
                    "pendente";


                row.innerHTML = `

                    <td>

                        <strong class="order-number">
                            #${number}
                        </strong>

                    </td>


                    <td>

                        <div class="customer">

                            <div class="customer-avatar">
                                ${getInitials(customer)}
                            </div>

                            <div>

                                <strong>
                                    ${customer}
                                </strong>

                                <span>
                                    ${totalItems} item(ns)
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${today}
                    </td>


                    <td>

                        <strong class="order-value">
                            ${formatCurrency(
                    totals.total
                )}
                        </strong>

                    </td>


                    <td>
                        ${payment}
                    </td>


                    <td>

                        <span class="order-status pending">
                            Pendente
                        </span>

                    </td>


                    <td>

                        <button class="order-actions">
                            ⋮
                        </button>

                    </td>

                `;


                tableBody.prepend(
                    row
                );


                /*
                   CARD:
                   0 = Total
                   1 = Pendentes
                   2 = Separação
                   3 = Concluídos
                */

                changeSummaryCard(
                    0,
                    1
                );


                changeSummaryCard(
                    1,
                    1
                );


                this.reset();


                productsContainer.innerHTML =
                    "";


                createProductRow();


                closeOrderModal();


                currentPage = 1;

                updateTable();


                showToast(
                    `Pedido #${number} criado com sucesso!`,
                    "success"
                );

            }
        );


    /* =====================================================
       10. MENU DE AÇÕES
    ====================================================== */

    let actionMenu = null;

    let selectedRow = null;


    function createActionMenu() {

        const menu =
            document.createElement(
                "div"
            );


        menu.className =
            "order-action-menu";


        menu.innerHTML = `

            <button
                type="button"
                data-action="details"
            >
                Ver detalhes
            </button>


            <button
                type="button"
                data-action="preparing"
            >
                Marcar em separação
            </button>


            <button
                type="button"
                data-action="sent"
            >
                Marcar como enviado
            </button>


            <button
                type="button"
                data-action="completed"
            >
                Concluir pedido
            </button>


            <button
                type="button"
                data-action="cancel"
                class="danger"
            >
                Cancelar pedido
            </button>

        `;


        document.body.appendChild(
            menu
        );


        return menu;

    }


    function closeActionMenu() {

        if (actionMenu) {

            actionMenu
                .classList
                .remove("show");

        }

    }


    /* =====================================================
       CLIQUE NO ⋮
    ====================================================== */

    tableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".order-actions"
                );


            if (!button) {
                return;
            }


            event.stopPropagation();


            selectedRow =
                button.closest("tr");


            if (!actionMenu) {

                actionMenu =
                    createActionMenu();

            }


            const rect =
                button.getBoundingClientRect();


            actionMenu.style.top =
                `${rect.bottom + 6}px`;


            actionMenu.style.right =
                `${window.innerWidth -
                rect.right
                }px`;


            actionMenu
                .classList
                .toggle("show");

        }
    );


    /* =====================================================
       ALTERAR STATUS
    ====================================================== */

    function updateOrderStatus(
        row,
        newStatus
    ) {

        if (!row) {
            return;
        }


        const oldStatus =
            getRowStatus(row);


        if (
            oldStatus === newStatus
        ) {

            return;

        }


        const statusElement =
            row.querySelector(
                ".order-status"
            );


        /*
           Atualiza cards
        */

        if (
            oldStatus ===
            "pendente"
        ) {

            changeSummaryCard(
                1,
                -1
            );

        }


        if (
            oldStatus ===
            "preparando"
        ) {

            changeSummaryCard(
                2,
                -1
            );

        }


        if (
            oldStatus ===
            "concluido"
        ) {

            changeSummaryCard(
                3,
                -1
            );

        }


        if (
            newStatus ===
            "pendente"
        ) {

            changeSummaryCard(
                1,
                1
            );

        }


        if (
            newStatus ===
            "preparando"
        ) {

            changeSummaryCard(
                2,
                1
            );

        }


        if (
            newStatus ===
            "concluido"
        ) {

            changeSummaryCard(
                3,
                1
            );

        }


        const statusData = {

            pendente: {
                text:
                    "Pendente",

                className:
                    "pending"
            },

            preparando: {
                text:
                    "Em separação",

                className:
                    "preparing"
            },

            enviado: {
                text:
                    "Enviado",

                className:
                    "sent"
            },

            concluido: {
                text:
                    "Concluído",

                className:
                    "completed"
            },

            cancelado: {
                text:
                    "Cancelado",

                className:
                    "cancelled"
            }

        };


        const data =
            statusData[newStatus];


        row.dataset.status =
            newStatus;


        statusElement.className =
            `order-status ${data.className}`;


        statusElement.textContent =
            data.text;


        updateTable();

    }


    /* =====================================================
       AÇÕES DO MENU
    ====================================================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                actionMenu &&
                actionMenu.contains(
                    event.target
                )
            ) {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const orderNumber =
                    selectedRow
                        ?.querySelector(
                            ".order-number"
                        )
                        ?.textContent;


                if (
                    action ===
                    "details"
                ) {

                    const customer =
                        selectedRow
                            .querySelector(
                                ".customer strong"
                            )
                            .textContent;


                    const value =
                        selectedRow
                            .querySelector(
                                ".order-value"
                            )
                            .textContent;


                    const status =
                        selectedRow
                            .querySelector(
                                ".order-status"
                            )
                            .textContent;


                    alert(
                        `${orderNumber}\n\n` +
                        `Cliente: ${customer}\n` +
                        `Valor: ${value}\n` +
                        `Status: ${status}`
                    );

                }


                if (
                    action ===
                    "preparing"
                ) {

                    updateOrderStatus(
                        selectedRow,
                        "preparando"
                    );


                    showToast(
                        `${orderNumber} está em separação.`,
                        "info"
                    );

                }


                if (
                    action ===
                    "sent"
                ) {

                    updateOrderStatus(
                        selectedRow,
                        "enviado"
                    );


                    showToast(
                        `${orderNumber} marcado como enviado.`,
                        "info"
                    );

                }


                if (
                    action ===
                    "completed"
                ) {

                    updateOrderStatus(
                        selectedRow,
                        "concluido"
                    );


                    showToast(
                        `${orderNumber} concluído com sucesso.`,
                        "success"
                    );

                }


                if (
                    action ===
                    "cancel"
                ) {

                    const confirmation =
                        confirm(
                            `Deseja cancelar ${orderNumber}?`
                        );


                    if (
                        confirmation
                    ) {

                        updateOrderStatus(
                            selectedRow,
                            "cancelado"
                        );


                        showToast(
                            `${orderNumber} foi cancelado.`,
                            "warning"
                        );

                    }

                }


                closeActionMenu();

                return;

            }


            closeActionMenu();

        }
    );


    /* =====================================================
       11. TOAST
    ====================================================== */

    function showToast(
        message,
        type = "info"
    ) {

        const oldToast =
            document.querySelector(
                ".orders-toast"
            );


        if (oldToast) {

            oldToast.remove();

        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `orders-toast ${type}`;


        toast.textContent =
            message;


        document.body.appendChild(
            toast
        );


        setTimeout(
            function () {

                toast.classList.add(
                    "show"
                );

            },
            20
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );


                setTimeout(
                    function () {

                        toast.remove();

                    },
                    300
                );

            },
            3000
        );

    }


    /* =====================================================
       INICIAR TABELA
    ====================================================== */

    updateTable();

});