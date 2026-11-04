/* =========================================
   ABAS
========================================= */

const salesTabs =
    document.querySelectorAll(".sales-tab");

const salesContents =
    document.querySelectorAll(
        ".sales-tab-content"
    );


salesTabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            salesTabs.forEach(function (item) {

                item.classList.remove("active");

            });


            salesContents.forEach(
                function (content) {

                    content.classList.remove("active");

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
   FILTROS
========================================= */

const salesSearch =
    document.getElementById("salesSearch");

const paymentFilter =
    document.getElementById(
        "paymentFilter"
    );

const salesStatusFilter =
    document.getElementById(
        "salesStatusFilter"
    );

const salesRows =
    document.querySelectorAll(
        "#salesTableBody tr"
    );


function filterSales() {

    const search =
        salesSearch.value
            .toLowerCase()
            .trim();


    const payment =
        paymentFilter.value;


    const status =
        salesStatusFilter.value;


    salesRows.forEach(function (row) {

        const text =
            row.textContent
                .toLowerCase();


        const rowPayment =
            row.dataset.payment;


        const rowStatus =
            row.dataset.status;


        const matchesSearch =
            text.includes(search);


        const matchesPayment =
            payment === "" ||
            rowPayment === payment;


        const matchesStatus =
            status === "" ||
            rowStatus === status;


        row.style.display =
            matchesSearch &&
            matchesPayment &&
            matchesStatus
                ? ""
                : "none";

    });

}


salesSearch.addEventListener(
    "input",
    filterSales
);


paymentFilter.addEventListener(
    "change",
    filterSales
);


salesStatusFilter.addEventListener(
    "change",
    filterSales
);


/* =========================================
   MODAL
========================================= */

const saleModal =
    document.getElementById(
        "saleModal"
    );

const openSaleModal =
    document.getElementById(
        "openSaleModal"
    );

const closeSaleModal =
    document.getElementById(
        "closeSaleModal"
    );

const cancelSale =
    document.getElementById(
        "cancelSale"
    );


function openModal() {

    saleModal.classList.add("active");

}


function closeModal() {

    saleModal.classList.remove("active");

}


openSaleModal.addEventListener(
    "click",
    openModal
);


closeSaleModal.addEventListener(
    "click",
    closeModal
);


cancelSale.addEventListener(
    "click",
    closeModal
);


saleModal.addEventListener(
    "click",
    function (event) {

        if (event.target === saleModal) {
            closeModal();
        }

    }
);


/* =========================================
   PRODUTOS
========================================= */

const saleProducts =
    document.getElementById(
        "saleProducts"
    );

const addSaleProduct =
    document.getElementById(
        "addSaleProduct"
    );


function createProductRow() {

    const row =
        document.createElement("div");


    row.classList.add(
        "sale-product-row"
    );


    row.innerHTML = `
        <select class="sale-product-select">

            <option
                value=""
                data-price="0"
            >
                Selecione o produto
            </option>

            <option
                value="Arroz Tipo 1"
                data-price="25.90"
            >
                Arroz Tipo 1
            </option>

            <option
                value="Feijão Carioca"
                data-price="8.50"
            >
                Feijão Carioca
            </option>

            <option
                value="Refrigerante Cola"
                data-price="10.90"
            >
                Refrigerante Cola
            </option>

        </select>


        <input
            class="sale-product-quantity"
            type="number"
            min="1"
            value="1"
        >


        <div class="sale-product-price">
            R$ 0,00
        </div>


        <button
            type="button"
            class="remove-sale-product"
        >
            ×
        </button>
    `;


    saleProducts.appendChild(row);


    updateSaleTotal();

}


addSaleProduct.addEventListener(
    "click",
    createProductRow
);


/* =========================================
   REMOVER PRODUTO
========================================= */

saleProducts.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "remove-sale-product"
            )
        ) {

            const rows =
                document.querySelectorAll(
                    ".sale-product-row"
                );


            if (rows.length > 1) {

                event.target
                    .closest(".sale-product-row")
                    .remove();


                updateSaleTotal();

            }

        }

    }
);


/* =========================================
   CÁLCULO
========================================= */

const saleDiscount =
    document.getElementById(
        "saleDiscount"
    );


function formatCurrency(value) {

    return value.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function updateSaleTotal() {

    const rows =
        document.querySelectorAll(
            ".sale-product-row"
        );


    let subtotal = 0;


    rows.forEach(function (row) {

        const select =
            row.querySelector(
                ".sale-product-select"
            );


        const quantity =
            Number(
                row.querySelector(
                    ".sale-product-quantity"
                ).value
            ) || 0;


        const option =
            select.options[
                select.selectedIndex
            ];


        const price =
            Number(
                option.dataset.price
            ) || 0;


        const total =
            price * quantity;


        subtotal += total;


        row.querySelector(
            ".sale-product-price"
        ).textContent =
            formatCurrency(total);

    });


    const discount =
        Number(
            saleDiscount.value
        ) || 0;


    const total =
        Math.max(
            subtotal - discount,
            0
        );


    document.getElementById(
        "saleSubtotal"
    ).textContent =
        formatCurrency(subtotal);


    document.getElementById(
        "saleDiscountValue"
    ).textContent =
        formatCurrency(discount);


    document.getElementById(
        "saleTotal"
    ).textContent =
        formatCurrency(total);

}


/* =========================================
   ALTERAÇÕES NOS PRODUTOS
========================================= */

saleProducts.addEventListener(
    "change",
    updateSaleTotal
);


saleProducts.addEventListener(
    "input",
    updateSaleTotal
);


saleDiscount.addEventListener(
    "input",
    updateSaleTotal
);


/* =========================================
   FINALIZAR VENDA
========================================= */

const newSaleForm =
    document.getElementById(
        "newSaleForm"
    );


newSaleForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const items = [];


        document
            .querySelectorAll(
                ".sale-product-row"
            )
            .forEach(function (row) {

                const product =
                    row.querySelector(
                        ".sale-product-select"
                    ).value;


                const quantity =
                    row.querySelector(
                        ".sale-product-quantity"
                    ).value;


                if (product !== "") {

                    items.push({
                        produto: product,
                        quantidade: quantity
                    });

                }

            });


        if (items.length === 0) {

            alert(
                "Adicione pelo menos um produto."
            );

            return;

        }


        const sale = {

            cliente:
                document.getElementById(
                    "saleCustomer"
                ).value,

            produtos:
                items,

            desconto:
                saleDiscount.value,

            pagamento:
                document.getElementById(
                    "salePayment"
                ).value

        };


        console.log(
            "Nova venda:",
            sale
        );


        alert(
            "Venda registrada com sucesso!"
        );


        closeModal();

    }
);


updateSaleTotal();