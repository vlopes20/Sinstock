/* =========================================
   ELEMENTOS
========================================= */

const productModal =
    document.getElementById(
        "productModal"
    );

const openProductModal =
    document.getElementById(
        "openProductModal"
    );

const closeProductModal =
    document.getElementById(
        "closeProductModal"
    );

const cancelProduct =
    document.getElementById(
        "cancelProduct"
    );

const productForm =
    document.getElementById(
        "productForm"
    );


/* =========================================
   ABRIR MODAL
========================================= */

function openModal() {

    productForm.reset();

    document
        .getElementById(
            "productId"
        )
        .value = "";


    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
            "Novo produto";


    productModal.classList.add(
        "active"
    );

}


openProductModal.addEventListener(
    "click",
    openModal
);


/* =========================================
   FECHAR
========================================= */

function closeModal() {

    productModal.classList.remove(
        "active"
    );

}


closeProductModal.addEventListener(
    "click",
    closeModal
);


cancelProduct.addEventListener(
    "click",
    closeModal
);


productModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === productModal
        ) {

            closeModal();

        }

    }
);


/* =========================================
   FILTROS
========================================= */

const productSearch =
    document.getElementById(
        "productSearch"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const statusFilter =
    document.getElementById(
        "productStatusFilter"
    );

const stockFilter =
    document.getElementById(
        "stockFilter"
    );


function filterProducts() {

    const rows =
        document.querySelectorAll(
            "#productsTableBody tr"
        );


    const search =
        productSearch.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const status =
        statusFilter.value;


    const stock =
        stockFilter.value;


    rows.forEach(function (row) {

        const text =
            row.textContent
                .toLowerCase();


        const rowCategory =
            row.dataset.category;


        const rowStatus =
            row.dataset.status;


        const rowStock =
            row.dataset.stock;


        const matchesSearch =
            text.includes(search);


        const matchesCategory =
            category === "" ||
            category === rowCategory;


        const matchesStatus =
            status === "" ||
            status === rowStatus;


        const matchesStock =
            stock === "" ||
            stock === rowStock;


        if (
            matchesSearch &&
            matchesCategory &&
            matchesStatus &&
            matchesStock
        ) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}


productSearch.addEventListener(
    "input",
    filterProducts
);


categoryFilter.addEventListener(
    "change",
    filterProducts
);


statusFilter.addEventListener(
    "change",
    filterProducts
);


stockFilter.addEventListener(
    "change",
    filterProducts
);


/* =========================================
   SALVAR PRODUTO
========================================= */

productForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const product = {

            nome:
                document.getElementById(
                    "productName"
                ).value,

            descricao:
                document.getElementById(
                    "productDescription"
                ).value,

            sku:
                document.getElementById(
                    "productSku"
                ).value,

            codigoBarras:
                document.getElementById(
                    "productBarcode"
                ).value,

            categoria:
                document.getElementById(
                    "productCategory"
                ).value,

            fornecedor:
                document.getElementById(
                    "productSupplier"
                ).value,

            custo:
                Number(
                    document.getElementById(
                        "productCost"
                    ).value
                ),

            preco:
                Number(
                    document.getElementById(
                        "productPrice"
                    ).value
                ),

            estoqueMinimo:
                Number(
                    document.getElementById(
                        "minimumStock"
                    ).value
                ),

            estoqueInicial:
                Number(
                    document.getElementById(
                        "initialStock"
                    ).value
                ),

            validade:
                document.getElementById(
                    "productExpiration"
                ).value,

            unidade:
                document.getElementById(
                    "productUnit"
                ).value,

            status:
                document.getElementById(
                    "productStatus"
                ).value,

            observacao:
                document.getElementById(
                    "productObservation"
                ).value

        };


        /* VALIDA PREÇOS */

        if (
            product.preco <
            product.custo
        ) {

            const confirmacao =
                confirm(
                    "O preço de venda está abaixo do preço de custo. Deseja continuar?"
                );


            if (!confirmacao) {
                return;
            }

        }


        console.log(
            "Produto:",
            product
        );


        alert(
            "Produto cadastrado com sucesso!"
        );


        productForm.reset();


        closeModal();

    }
);