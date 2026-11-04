/* =========================================
   ABAS
========================================= */

const tabs =
    document.querySelectorAll(".stock-tab");

const tabContents =
    document.querySelectorAll(
        ".stock-tab-content"
    );


tabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            tabs.forEach(function (item) {
                item.classList.remove("active");
            });


            tabContents.forEach(
                function (content) {

                    content.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add("active");


            const target =
                this.dataset.tab;


            document
                .getElementById(target)
                .classList.add("active");

        }
    );

});


/* =========================================
   BUSCA E FILTROS
========================================= */

const searchInput =
    document.getElementById(
        "stockSearch"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const statusFilter =
    document.getElementById(
        "stockStatusFilter"
    );

const stockRows =
    document.querySelectorAll(
        "#stockTableBody tr"
    );


function filterStock() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const status =
        statusFilter.value;


    stockRows.forEach(function (row) {

        const text =
            row.textContent
                .toLowerCase();


        const rowCategory =
            row.dataset.category;


        const rowStatus =
            row.dataset.status;


        const matchesSearch =
            text.includes(search);


        const matchesCategory =
            category === "" ||
            category === rowCategory;


        const matchesStatus =
            status === "" ||
            status === rowStatus;


        if (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        ) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}


searchInput.addEventListener(
    "input",
    filterStock
);


categoryFilter.addEventListener(
    "change",
    filterStock
);


statusFilter.addEventListener(
    "change",
    filterStock
);


/* =========================================
   MODAL
========================================= */

const modal =
    document.getElementById(
        "movementModal"
    );

const openModalButton =
    document.getElementById(
        "openMovementModal"
    );

const closeModalButton =
    document.getElementById(
        "closeMovementModal"
    );

const cancelMovement =
    document.getElementById(
        "cancelMovement"
    );


function openModal() {

    modal.classList.add("active");

}


function closeModal() {

    modal.classList.remove("active");

}


openModalButton.addEventListener(
    "click",
    openModal
);


closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelMovement.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {
            closeModal();
        }

    }
);


/* =========================================
   TIPO DE MOVIMENTAÇÃO
========================================= */

const movementOptions =
    document.querySelectorAll(
        ".movement-option"
    );

const movementType =
    document.getElementById(
        "movementType"
    );


movementOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                movementOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                movementType.value =
                    this.dataset.type;

            }
        );

    }
);


/* =========================================
   DATA ATUAL
========================================= */

const movementDate =
    document.getElementById(
        "movementDate"
    );


movementDate.value =
    new Date()
        .toISOString()
        .split("T")[0];


/* =========================================
   FORMULÁRIO
========================================= */

const movementForm =
    document.getElementById(
        "movementForm"
    );


movementForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const movement = {

            tipo:
                movementType.value,

            produto:
                document.getElementById(
                    "movementProduct"
                ).value,

            quantidade:
                document.getElementById(
                    "movementQuantity"
                ).value,

            data:
                movementDate.value,

            motivo:
                document.getElementById(
                    "movementReason"
                ).value,

            referencia:
                document.getElementById(
                    "movementReference"
                ).value,

            observacao:
                document.getElementById(
                    "movementObservation"
                ).value

        };


        console.log(
            "Movimentação:",
            movement
        );


        alert(
            "Movimentação registrada!"
        );


        movementForm.reset();


        movementDate.value =
            new Date()
                .toISOString()
                .split("T")[0];


        closeModal();

    }
);