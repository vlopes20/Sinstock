/* =========================================
   ELEMENTOS DO MODAL
========================================= */

const supplierModal =
    document.getElementById(
        "supplierModal"
    );

const openSupplierModal =
    document.getElementById(
        "openSupplierModal"
    );

const closeSupplierModal =
    document.getElementById(
        "closeSupplierModal"
    );

const cancelSupplier =
    document.getElementById(
        "cancelSupplier"
    );

const supplierForm =
    document.getElementById(
        "supplierForm"
    );


/* =========================================
   ABRIR MODAL
========================================= */

function openModal() {

    supplierForm.reset();


    document
        .getElementById("supplierId")
        .value = "";


    document
        .getElementById(
            "supplierModalTitle"
        )
        .textContent =
            "Novo fornecedor";


    supplierModal.classList.add(
        "active"
    );

}


openSupplierModal.addEventListener(
    "click",
    openModal
);


/* =========================================
   FECHAR MODAL
========================================= */

function closeModal() {

    supplierModal.classList.remove(
        "active"
    );

}


closeSupplierModal.addEventListener(
    "click",
    closeModal
);


cancelSupplier.addEventListener(
    "click",
    closeModal
);


supplierModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            supplierModal
        ) {

            closeModal();

        }

    }
);


/* =========================================
   BUSCA / FILTROS
========================================= */

const supplierSearch =
    document.getElementById(
        "supplierSearch"
    );

const supplierCategoryFilter =
    document.getElementById(
        "supplierCategoryFilter"
    );

const supplierStatusFilter =
    document.getElementById(
        "supplierStatusFilter"
    );


function filterSuppliers() {

    const search =
        supplierSearch.value
            .toLowerCase()
            .trim();


    const category =
        supplierCategoryFilter.value;


    const status =
        supplierStatusFilter.value;


    const rows =
        document.querySelectorAll(
            "#suppliersTableBody tr"
        );


    rows.forEach(function (row) {

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


        row.style.display =
            matchesSearch &&
            matchesCategory &&
            matchesStatus
                ? ""
                : "none";

    });

}


supplierSearch.addEventListener(
    "input",
    filterSuppliers
);


supplierCategoryFilter.addEventListener(
    "change",
    filterSuppliers
);


supplierStatusFilter.addEventListener(
    "change",
    filterSuppliers
);


/* =========================================
   MÁSCARA CNPJ
========================================= */

const supplierCnpj =
    document.getElementById(
        "supplierCnpj"
    );


supplierCnpj.addEventListener(
    "input",
    function () {

        let value =
            this.value.replace(
                /\D/g,
                ""
            );


        value =
            value.substring(0, 14);


        value =
            value.replace(
                /^(\d{2})(\d)/,
                "$1.$2"
            );


        value =
            value.replace(
                /^(\d{2})\.(\d{3})(\d)/,
                "$1.$2.$3"
            );


        value =
            value.replace(
                /\.(\d{3})(\d)/,
                ".$1/$2"
            );


        value =
            value.replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );


        this.value = value;

    }
);


/* =========================================
   SALVAR
========================================= */

supplierForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const supplier = {

            razaoSocial:
                document.getElementById(
                    "companyName"
                ).value,

            nomeFantasia:
                document.getElementById(
                    "tradeName"
                ).value,

            cnpj:
                supplierCnpj.value,

            inscricaoEstadual:
                document.getElementById(
                    "stateRegistration"
                ).value,

            contato:
                document.getElementById(
                    "contactPerson"
                ).value,

            email:
                document.getElementById(
                    "supplierEmail"
                ).value,

            telefone:
                document.getElementById(
                    "supplierPhone"
                ).value,

            categoria:
                document.getElementById(
                    "supplierCategory"
                ).value,

            prazoEntrega:
                Number(
                    document.getElementById(
                        "deliveryTime"
                    ).value
                ),

            condicaoPagamento:
                document.getElementById(
                    "paymentTerms"
                ).value,

            endereco:
                document.getElementById(
                    "supplierAddress"
                ).value,

            cidade:
                document.getElementById(
                    "supplierCity"
                ).value,

            uf:
                document.getElementById(
                    "supplierState"
                ).value,

            cep:
                document.getElementById(
                    "supplierZip"
                ).value,

            status:
                document.getElementById(
                    "supplierStatus"
                ).value,

            observacoes:
                document.getElementById(
                    "supplierNotes"
                ).value

        };


        console.log(
            "Fornecedor:",
            supplier
        );


        alert(
            "Fornecedor cadastrado com sucesso!"
        );


        supplierForm.reset();


        closeModal();

    }
);