/* =========================================
   ABAS
========================================= */

const reportTabs =
    document.querySelectorAll(
        ".report-tab"
    );

const reportContents =
    document.querySelectorAll(
        ".report-tab-content"
    );


reportTabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            reportTabs.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            reportContents.forEach(
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
                this.dataset.reportTab;


            document
                .getElementById(target)
                .classList.add("active");

        }
    );

});


/* =========================================
   FILTROS
========================================= */

const periodFilter =
    document.getElementById(
        "periodFilter"
    );

const startDate =
    document.getElementById(
        "startDate"
    );

const endDate =
    document.getElementById(
        "endDate"
    );

const reportCategory =
    document.getElementById(
        "reportCategory"
    );


document
    .getElementById(
        "applyReportFilters"
    )
    .addEventListener(
        "click",
        function () {

            if (
                startDate.value &&
                endDate.value &&
                startDate.value >
                    endDate.value
            ) {

                alert(
                    "A data inicial não pode ser maior que a data final."
                );

                return;
            }


            console.log({

                periodo:
                    periodFilter.value,

                inicio:
                    startDate.value,

                fim:
                    endDate.value,

                categoria:
                    reportCategory.value

            });


            alert(
                "Filtros aplicados."
            );

        }
    );


/* =========================================
   LIMPAR FILTROS
========================================= */

document
    .getElementById(
        "clearReportFilters"
    )
    .addEventListener(
        "click",
        function () {

            periodFilter.value = "30";

            startDate.value = "";

            endDate.value = "";

            reportCategory.value = "";

        }
    );


/* =========================================
   PEGAR TABELA ATIVA
========================================= */

function getActiveReportTable() {

    const activeContent =
        document.querySelector(
            ".report-tab-content.active"
        );


    return activeContent.querySelector(
        ".report-table"
    );

}


/* =========================================
   EXPORTAR CSV
========================================= */

document
    .getElementById(
        "exportReport"
    )
    .addEventListener(
        "click",
        function () {

            const table =
                getActiveReportTable();


            if (!table) {

                alert(
                    "Não existe uma tabela para exportar nesta seção."
                );

                return;
            }


            const rows =
                table.querySelectorAll(
                    "tr"
                );


            const csv = [];


            rows.forEach(
                function (row) {

                    const columns =
                        row.querySelectorAll(
                            "th, td"
                        );


                    const values = [];


                    columns.forEach(
                        function (column) {

                            let value =
                                column
                                    .innerText
                                    .trim()
                                    .replace(
                                        /"/g,
                                        '""'
                                    );


                            values.push(
                                `"${value}"`
                            );

                        }
                    );


                    csv.push(
                        values.join(";")
                    );

                }
            );


            const blob =
                new Blob(
                    [
                        "\uFEFF" +
                        csv.join("\n")
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;

            link.download =
                "relatorio-sinstock.csv";


            link.click();


            URL.revokeObjectURL(
                url
            );

        }
    );


/* =========================================
   IMPRIMIR / GERAR PDF
========================================= */

document
    .getElementById(
        "printReport"
    )
    .addEventListener(
        "click",
        function () {

            window.print();

        }
    );