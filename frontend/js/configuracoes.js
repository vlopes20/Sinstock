/* =========================================
   ABAS
========================================= */

const settingsTabs =
    document.querySelectorAll(
        ".settings-tab"
    );

const settingsContents =
    document.querySelectorAll(
        ".settings-content"
    );


settingsTabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            settingsTabs.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            settingsContents.forEach(
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
   DADOS DA EMPRESA
========================================= */

const companyForm =
    document.getElementById(
        "companyForm"
    );


companyForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const company = {

            nome:
                document.getElementById(
                    "companyName"
                ).value,

            cnpj:
                document.getElementById(
                    "companyCnpj"
                ).value,

            email:
                document.getElementById(
                    "companyEmail"
                ).value,

            telefone:
                document.getElementById(
                    "companyPhone"
                ).value,

            endereco:
                document.getElementById(
                    "companyAddress"
                ).value,

            cidade:
                document.getElementById(
                    "companyCity"
                ).value,

            estado:
                document.getElementById(
                    "companyState"
                ).value

        };


        console.log(
            "Empresa:",
            company
        );


        alert(
            "Dados da empresa atualizados!"
        );

    }
);


/* =========================================
   MODAL USUÁRIO
========================================= */

const userModal =
    document.getElementById(
        "userModal"
    );


function openUserModal() {

    userModal.classList.add(
        "active"
    );

}


function closeUserModal() {

    userModal.classList.remove(
        "active"
    );

}


document
    .getElementById(
        "openUserModal"
    )
    .addEventListener(
        "click",
        openUserModal
    );


document
    .getElementById(
        "closeUserModal"
    )
    .addEventListener(
        "click",
        closeUserModal
    );


document
    .getElementById(
        "cancelUser"
    )
    .addEventListener(
        "click",
        closeUserModal
    );


userModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            userModal
        ) {

            closeUserModal();

        }

    }
);


/* =========================================
   CADASTRAR USUÁRIO
========================================= */

const userForm =
    document.getElementById(
        "userForm"
    );


userForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "newUserName"
            ).value;


        const email =
            document.getElementById(
                "newUserEmail"
            ).value;


        const role =
            document.getElementById(
                "newUserRole"
            ).value;


        const status =
            document.getElementById(
                "newUserStatus"
            ).value;


        const initials =
            name
                .split(" ")
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();


        const tableBody =
            document.getElementById(
                "usersTableBody"
            );


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>

                <div class="settings-user">

                    <div class="settings-avatar">
                        ${initials}
                    </div>

                    <strong>
                        ${name}
                    </strong>

                </div>

            </td>


            <td>
                ${email}
            </td>


            <td>

                <span class="role-badge stock">
                    ${role}
                </span>

            </td>


            <td>

                <span class="user-status ${
                    status === "Ativo"
                        ? "active"
                        : "inactive"
                }">
                    ${status}
                </span>

            </td>


            <td>
                Nunca
            </td>


            <td>

                <button class="user-action-button">
                    ⋮
                </button>

            </td>
        `;


        tableBody.appendChild(
            row
        );


        userForm.reset();


        closeUserModal();


        alert(
            "Usuário cadastrado com sucesso!"
        );

    }
);


/* =========================================
   PERMISSÕES
========================================= */

document
    .getElementById(
        "savePermissions"
    )
    .addEventListener(
        "click",
        function () {

            alert(
                "Permissões atualizadas!"
            );

        }
    );


/* =========================================
   CONFIGURAÇÕES ESTOQUE
========================================= */

document
    .getElementById(
        "stockSettingsForm"
    )
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const settings = {

                alertaEstoqueBaixo:
                    document.getElementById(
                        "lowStockAlert"
                    ).checked,

                bloquearEstoqueNegativo:
                    document.getElementById(
                        "negativeStockBlock"
                    ).checked,

                alertaValidade:
                    document.getElementById(
                        "expirationAlert"
                    ).checked,

                diasValidade:
                    document.getElementById(
                        "expirationDays"
                    ).value,

                estoqueMinimo:
                    document.getElementById(
                        "defaultMinimumStock"
                    ).value

            };


            console.log(
                settings
            );


            alert(
                "Configurações de estoque atualizadas!"
            );

        }
    );


/* =========================================
   ALTERAÇÃO DE SENHA
========================================= */

document
    .getElementById(
        "passwordForm"
    )
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "As novas senhas não coincidem."
                );

                return;
            }


            if (
                newPassword.length < 8
            ) {

                alert(
                    "A nova senha deve ter pelo menos 8 caracteres."
                );

                return;
            }


            alert(
                "Senha alterada com sucesso!"
            );


            this.reset();

        }
    );


/* =========================================
   PREFERÊNCIAS
========================================= */

document
    .getElementById(
        "systemForm"
    )
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const preferences = {

                idioma:
                    document.getElementById(
                        "systemLanguage"
                    ).value,

                moeda:
                    document.getElementById(
                        "systemCurrency"
                    ).value,

                formatoData:
                    document.getElementById(
                        "dateFormat"
                    ).value,

                itensPagina:
                    document.getElementById(
                        "itemsPerPage"
                    ).value

            };


            console.log(
                preferences
            );


            alert(
                "Preferências salvas!"
            );

        }
    );


/* =========================================
   EXPORTAR
========================================= */

document
    .getElementById(
        "exportSystemData"
    )
    .addEventListener(
        "click",
        function () {

            alert(
                "A exportação será integrada ao backend."
            );

        }
    );