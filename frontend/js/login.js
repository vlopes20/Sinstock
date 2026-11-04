const loginForm = document.getElementById("loginForm");

const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");

const usuarioError = document.getElementById("usuarioError");
const senhaError = document.getElementById("senhaError");

const togglePassword = document.getElementById("togglePassword");

const loginMessage = document.getElementById("loginMessage");


/* =========================
   MOSTRAR / ESCONDER SENHA
========================= */

togglePassword.addEventListener("click", function () {

    const senhaVisivel =
        senhaInput.type === "text";

    if (senhaVisivel) {

        senhaInput.type = "password";

        togglePassword.setAttribute(
            "aria-label",
            "Mostrar senha"
        );

    } else {

        senhaInput.type = "text";

        togglePassword.setAttribute(
            "aria-label",
            "Ocultar senha"
        );
    }

});


/* =========================
   LIMPAR ERROS
========================= */

function limparErros() {

    usuarioError.textContent = "";
    senhaError.textContent = "";
    loginMessage.textContent = "";

    usuarioInput
        .closest(".input-box")
        .classList.remove("error");

    senhaInput
        .closest(".input-box")
        .classList.remove("error");
}


/* =========================
   VALIDAR LOGIN
========================= */

function validarFormulario() {

    limparErros();

    let formularioValido = true;


    if (usuarioInput.value.trim() === "") {

        usuarioError.textContent =
            "Informe seu usuário.";

        usuarioInput
            .closest(".input-box")
            .classList.add("error");

        formularioValido = false;
    }


    if (senhaInput.value.trim() === "") {

        senhaError.textContent =
            "Informe sua senha.";

        senhaInput
            .closest(".input-box")
            .classList.add("error");

        formularioValido = false;
    }


    return formularioValido;
}


/* =========================
   SUBMIT
========================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!validarFormulario()) {
            return;
        }


        const dadosLogin = {

            usuario:
                usuarioInput.value.trim(),

            senha:
                senhaInput.value
        };


        console.log(
            "Dados enviados:",
            dadosLogin
        );


        /*
        ======================================
        QUANDO CRIARMOS O BACK-END:

        const resposta = await fetch(
            "http://localhost:3000/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        dadosLogin
                    )
            }
        );

        const dados =
            await resposta.json();

        ======================================
        */


        loginMessage.style.color =
            "#16a34a";

        loginMessage.textContent =
            "Validação realizada com sucesso.";

    }
);