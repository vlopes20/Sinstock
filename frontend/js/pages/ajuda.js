/* =========================================
   ABAS
========================================= */

const helpTabs =
    document.querySelectorAll(
        ".help-tab"
    );

const helpContents =
    document.querySelectorAll(
        ".help-tab-content"
    );


helpTabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            helpTabs.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            helpContents.forEach(
                function (content) {

                    content.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add(
                "active"
            );


            const target =
                this.dataset.tab;


            document
                .getElementById(target)
                .classList.add("active");

        }
    );

});


/* =========================================
   FAQ
========================================= */

const faqItems =
    document.querySelectorAll(
        ".faq-item"
    );


faqItems.forEach(function (item) {

    const question =
        item.querySelector(
            ".faq-question"
        );


    question.addEventListener(
        "click",
        function () {

            item.classList.toggle(
                "active"
            );

        }
    );

});


/* =========================================
   PESQUISA DA AJUDA
========================================= */

const helpSearch =
    document.getElementById(
        "helpSearch"
    );

const noResults =
    document.getElementById(
        "noHelpResults"
    );


function filterFAQ(searchValue = "") {

    const search =
        searchValue
            .toLowerCase()
            .trim();


    let visible = 0;


    faqItems.forEach(function (item) {

        const text =
            item.textContent
                .toLowerCase();


        if (
            search === "" ||
            text.includes(search)
        ) {

            item.style.display = "";

            visible++;

        } else {

            item.style.display =
                "none";

        }

    });


    noResults.style.display =
        visible === 0
            ? "block"
            : "none";

}


helpSearch.addEventListener(
    "input",
    function () {

        filterFAQ(
            this.value
        );

    }
);


/* =========================================
   CATEGORIAS
========================================= */

const categoryCards =
    document.querySelectorAll(
        ".help-category-card"
    );


categoryCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                const category =
                    this.dataset.category;


                /* abre aba central */

                helpTabs.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                helpContents.forEach(
                    function (content) {

                        content.classList.remove(
                            "active"
                        );

                    }
                );


                helpTabs[0]
                    .classList.add(
                        "active"
                    );


                document
                    .getElementById(
                        "helpCenter"
                    )
                    .classList.add(
                        "active"
                    );


                let visible = 0;


                faqItems.forEach(
                    function (item) {

                        if (
                            item.dataset.category ===
                            category
                        ) {

                            item.style.display =
                                "";

                            visible++;

                        } else {

                            item.style.display =
                                "none";

                        }

                    }
                );


                noResults.style.display =
                    visible === 0
                        ? "block"
                        : "none";

            }
        );

    }
);


/* =========================================
   MODAL CHAMADO
========================================= */

const ticketModal =
    document.getElementById(
        "ticketModal"
    );


function openTicketModal() {

    ticketModal.classList.add(
        "active"
    );

}


function closeTicketModal() {

    ticketModal.classList.remove(
        "active"
    );

}


document
    .getElementById(
        "openTicketModal"
    )
    .addEventListener(
        "click",
        openTicketModal
    );


document
    .getElementById(
        "openTicketFromHelp"
    )
    .addEventListener(
        "click",
        openTicketModal
    );


document
    .getElementById(
        "openTicketFromTickets"
    )
    .addEventListener(
        "click",
        openTicketModal
    );


document
    .getElementById(
        "closeTicketModal"
    )
    .addEventListener(
        "click",
        closeTicketModal
    );


document
    .getElementById(
        "cancelTicket"
    )
    .addEventListener(
        "click",
        closeTicketModal
    );


ticketModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            ticketModal
        ) {

            closeTicketModal();

        }

    }
);


/* =========================================
   CRIAR CHAMADO
========================================= */

const ticketForm =
    document.getElementById(
        "ticketForm"
    );


ticketForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const subject =
            document.getElementById(
                "ticketSubject"
            ).value;


        const category =
            document.getElementById(
                "ticketCategory"
            ).value;


        const priority =
            document.getElementById(
                "ticketPriority"
            ).value;


        const description =
            document.getElementById(
                "ticketDescription"
            ).value;


        const page =
            document.getElementById(
                "ticketPage"
            ).value;


        const ticket = {

            assunto:
                subject,

            categoria:
                category,

            prioridade:
                priority,

            descricao:
                description,

            pagina:
                page

        };


        console.log(
            "Novo chamado:",
            ticket
        );


        /* CRIA NÚMERO TEMPORÁRIO */

        const number =
            Math.floor(
                Math.random() *
                9000
            ) +
            1000;


        const ticketCode =
            `#SUP-${number}`;


        /* DATA */

        const date =
            new Date()
                .toLocaleDateString(
                    "pt-BR"
                );


        /* CLASSE PRIORIDADE */

        let priorityClass =
            "normal";


        if (
            priority === "Alta"
        ) {

            priorityClass =
                "high";

        }


        if (
            priority === "Baixa"
        ) {

            priorityClass =
                "low";

        }


        /* ADICIONAR NA TABELA */

        const tableBody =
            document.getElementById(
                "ticketsTableBody"
            );


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>

                <strong class="ticket-code">
                    ${ticketCode}
                </strong>

            </td>


            <td>
                ${subject}
            </td>


            <td>
                ${category}
            </td>


            <td>

                <span class="priority ${priorityClass}">
                    ${priority}
                </span>

            </td>


            <td>
                ${date}
            </td>


            <td>

                <span class="ticket-status analysis">
                    Aberto
                </span>

            </td>


            <td>

                <button class="ticket-actions">
                    ⋮
                </button>

            </td>
        `;


        tableBody.prepend(
            row
        );


        ticketForm.reset();


        closeTicketModal();


        alert(
            `Chamado ${ticketCode} aberto com sucesso!`
        );

    }
);