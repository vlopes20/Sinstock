/* =========================================================
   SINSTOCK - DASHBOARD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const searchInput =
        document.querySelector(".search-box input");

    const notification =
        document.querySelector(".notification");

    const user =
        document.querySelector(".user");

    const dateElement =
        document.querySelector(".date span");

    const periodSelect =
        document.querySelector(".card-header select");

    const chartLine =
        document.querySelector(".chart-line");

    const chartFill =
        document.querySelector(".chart-fill");

    const chartSvg =
        document.querySelector(".chart svg");

    const chartDays =
        document.querySelector(".chart-days");

    const totalValue =
        document.querySelector(".total-value strong");

    const totalPercentage =
        document.querySelector(".total-value span");


    /* =====================================================
       1. DATA ATUAL
    ====================================================== */

    function updateCurrentDate() {

        if (!dateElement) {
            return;
        }


        const today =
            new Date();


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
       2. ITEM ATIVO DA SIDEBAR
    ====================================================== */

    function setActiveSidebarItem() {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop();


        const menuItems =
            document.querySelectorAll(
                ".sidebar .menu-item"
            );


        menuItems.forEach(function (item) {

            const href =
                item.getAttribute("href");


            item.classList.remove(
                "active"
            );


            if (
                href &&
                href === currentPage
            ) {

                item.classList.add(
                    "active"
                );

            }

        });

    }


    setActiveSidebarItem();


    /* =====================================================
       3. CTRL + K PARA BUSCA
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


                if (searchInput) {

                    searchInput.focus();

                    searchInput.select();

                }

            }

        }
    );


    /* =====================================================
       4. BUSCA
    ====================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Enter"
                ) {
                    return;
                }


                const search =
                    this.value
                        .trim();


                if (search === "") {

                    showToast(
                        "Digite algo para pesquisar.",
                        "warning"
                    );

                    return;

                }


                /*
                =============================================
                FUTURAMENTE:

                Aqui podemos consultar o backend:

                GET /api/busca?q=arroz

                const response = await fetch(
                    `/api/busca?q=${search}`
                );

                =============================================
                */


                console.log(
                    "Pesquisa:",
                    search
                );


                showToast(
                    `Buscando por "${search}"...`,
                    "info"
                );

            }
        );

    }


    /* =====================================================
       5. NOTIFICAÇÕES
    ====================================================== */

    let notificationMenu = null;


    function createNotificationMenu() {

        const menu =
            document.createElement("div");


        menu.className =
            "dashboard-dropdown notification-dropdown";


        menu.innerHTML = `

            <div class="dropdown-header">

                <strong>
                    Notificações
                </strong>

                <span>
                    3 novas
                </span>

            </div>


            <a
                href="estoque.html"
                class="notification-item"
            >

                <div class="notification-dropdown-icon warning">
                    !
                </div>

                <div>

                    <strong>
                        Estoque baixo
                    </strong>

                    <span>
                        8 produtos estão abaixo do estoque mínimo.
                    </span>

                </div>

            </a>


            <a
                href="pedidos.html"
                class="notification-item"
            >

                <div class="notification-dropdown-icon pending">
                    ◷
                </div>

                <div>

                    <strong>
                        Pedidos pendentes
                    </strong>

                    <span>
                        5 pedidos aguardam aprovação.
                    </span>

                </div>

            </a>


            <a
                href="produtos.html"
                class="notification-item"
            >

                <div class="notification-dropdown-icon info">
                    ◇
                </div>

                <div>

                    <strong>
                        Validade próxima
                    </strong>

                    <span>
                        4 produtos vencem em breve.
                    </span>

                </div>

            </a>


            <div class="dropdown-footer">

                <a href="estoque.html">
                    Ver todos os alertas
                </a>

            </div>

        `;


        document.body.appendChild(
            menu
        );


        return menu;

    }


    function positionDropdown(
        dropdown,
        reference
    ) {

        const rect =
            reference.getBoundingClientRect();


        dropdown.style.top =
            `${rect.bottom + 12}px`;


        dropdown.style.right =
            `${window.innerWidth - rect.right}px`;

    }


    if (notification) {

        notification.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                closeUserMenu();


                if (!notificationMenu) {

                    notificationMenu =
                        createNotificationMenu();

                }


                positionDropdown(
                    notificationMenu,
                    notification
                );


                notificationMenu
                    .classList
                    .toggle("show");

            }
        );

    }


    function closeNotificationMenu() {

        if (notificationMenu) {

            notificationMenu
                .classList
                .remove("show");

        }

    }


    /* =====================================================
       6. MENU DO USUÁRIO
    ====================================================== */

    let userMenu = null;


    function createUserMenu() {

        const menu =
            document.createElement("div");


        menu.className =
            "dashboard-dropdown user-dropdown";


        menu.innerHTML = `

            <div class="user-dropdown-header">

                <strong>
                    Minha conta
                </strong>

                <span>
                    Usuário conectado
                </span>

            </div>


            <a href="configuracoes.html">
                ⚙ Configurações
            </a>


            <button
                type="button"
                id="dashboardLogout"
            >
                ↪ Sair
            </button>

        `;


        document.body.appendChild(
            menu
        );


        const logoutButton =
            menu.querySelector(
                "#dashboardLogout"
            );


        logoutButton.addEventListener(
            "click",
            logout
        );


        return menu;

    }


    if (user) {

        user.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                closeNotificationMenu();


                if (!userMenu) {

                    userMenu =
                        createUserMenu();

                }


                positionDropdown(
                    userMenu,
                    user
                );


                userMenu
                    .classList
                    .toggle("show");

            }
        );

    }


    function closeUserMenu() {

        if (userMenu) {

            userMenu
                .classList
                .remove("show");

        }

    }


    /* =====================================================
       FECHAR MENUS AO CLICAR FORA
    ====================================================== */

    document.addEventListener(
        "click",
        function () {

            closeNotificationMenu();

            closeUserMenu();

        }
    );


    window.addEventListener(
        "resize",
        function () {

            closeNotificationMenu();

            closeUserMenu();

        }
    );


    /* =====================================================
       7. LOGOUT
    ====================================================== */

    function logout() { SinstockSession.logout(); }


    /* =====================================================
       8. DADOS FICTÍCIOS DO GRÁFICO
    ====================================================== */

    const chartData = {

        "Últimos 7 dias": {

            values: [
                3200,
                5200,
                3100,
                6100,
                5200,
                7400,
                8700
            ],

            labels: [
                "27 Ago",
                "28 Ago",
                "29 Ago",
                "30 Ago",
                "31 Ago",
                "01 Set",
                "02 Set"
            ],

            total:
                "R$ 45.680,50",

            variation:
                "+9,3%"

        },


        "Últimos 30 dias": {

            values: [
                5800,
                7200,
                6200,
                7900,
                6800,
                8500,
                9200
            ],

            labels: [
                "Sem 1",
                "Sem 2",
                "Sem 3",
                "Sem 4",
                "Sem 5",
                "Sem 6",
                "Hoje"
            ],

            total:
                "R$ 164.830,20",

            variation:
                "+12,1%"

        },


        "Este mês": {

            values: [
                4200,
                5500,
                4900,
                6700,
                7600,
                7100,
                8900
            ],

            labels: [
                "01",
                "05",
                "10",
                "15",
                "20",
                "25",
                "Hoje"
            ],

            total:
                "R$ 128.950,70",

            variation:
                "+7,8%"

        }

    };


    /* =====================================================
       9. ATUALIZAR GRÁFICO
    ====================================================== */

    function updateChart(period) {

        if (
            !chartLine ||
            !chartFill ||
            !chartSvg
        ) {

            return;

        }


        const data =
            chartData[period];


        if (!data) {
            return;
        }


        const width =
            700;


        const height =
            250;


        const paddingX =
            20;


        const paddingTop =
            20;


        const usableWidth =
            width -
            paddingX * 2;


        const usableHeight =
            200;


        const maximum =
            Math.max(
                ...data.values,
                10000
            );


        const points =
            data.values.map(
                function (
                    value,
                    index
                ) {

                    const x =
                        paddingX +
                        (
                            usableWidth /
                            (
                                data.values.length -
                                1
                            )
                        ) *
                        index;


                    const y =
                        paddingTop +
                        usableHeight -
                        (
                            value /
                            maximum
                        ) *
                        usableHeight;


                    return {
                        x,
                        y
                    };

                }
            );


        let linePath = "";


        points.forEach(
            function (
                point,
                index
            ) {

                if (index === 0) {

                    linePath +=
                        `M ${point.x} ${point.y}`;

                } else {

                    linePath +=
                        ` L ${point.x} ${point.y}`;

                }

            }
        );


        chartLine.setAttribute(
            "d",
            linePath
        );


        const first =
            points[0];


        const last =
            points[
                points.length - 1
            ];


        const fillPath = `

            ${linePath}

            L ${last.x} ${height}

            L ${first.x} ${height}

            Z
        `;


        chartFill.setAttribute(
            "d",
            fillPath
        );


        /* REMOVE PONTOS ANTIGOS */

        chartSvg
            .querySelectorAll(
                ".dynamic-chart-point"
            )
            .forEach(
                function (point) {

                    point.remove();

                }
            );


        /* CRIA NOVOS PONTOS */

        points.forEach(
            function (
                point,
                index
            ) {

                const circle =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );


                circle.setAttribute(
                    "cx",
                    point.x
                );


                circle.setAttribute(
                    "cy",
                    point.y
                );


                circle.setAttribute(
                    "r",
                    index ===
                    points.length - 1
                        ? 7
                        : 6
                );


                circle.classList.add(
                    "dynamic-chart-point"
                );


                chartSvg.appendChild(
                    circle
                );

            }
        );


        /* DATAS */

        if (chartDays) {

            chartDays.innerHTML = "";


            data.labels.forEach(
                function (
                    label,
                    index
                ) {

                    const span =
                        document.createElement(
                            "span"
                        );


                    span.textContent =
                        label;


                    if (
                        index ===
                        data.labels.length - 1
                    ) {

                        span.classList.add(
                            "active-date"
                        );

                    }


                    chartDays.appendChild(
                        span
                    );

                }
            );

        }


        /* TOTAL */

        if (totalValue) {

            totalValue.textContent =
                data.total;

        }


        if (totalPercentage) {

            totalPercentage.textContent =
                data.variation;

        }

    }


    /* =====================================================
       TROCAR PERÍODO
    ====================================================== */

    if (periodSelect) {

        periodSelect.addEventListener(
            "change",
            function () {

                updateChart(
                    this.value
                );

            }
        );

    }


    /* =====================================================
       10. ALERTAS RÁPIDOS CLICÁVEIS
    ====================================================== */

    const alertItems =
        document.querySelectorAll(
            ".alert-item"
        );


    alertItems.forEach(
        function (
            item,
            index
        ) {

            item.addEventListener(
                "click",
                function () {

                    if (index === 0) {

                        window.location.href =
                            "estoque.html";

                    }


                    if (index === 1) {

                        window.location.href =
                            "pedidos.html";

                    }


                    if (index === 2) {

                        window.location.href =
                            "pedidos.html";

                    }

                }
            );

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
                ".dashboard-toast"
            );


        if (oldToast) {

            oldToast.remove();

        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `dashboard-toast ${type}`;


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

});