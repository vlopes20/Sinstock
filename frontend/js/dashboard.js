function atualizarData() {
    const hoje = new Date();

    const dia = String(hoje.getDate()).padStart(2, "0");

    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    const mes = meses[hoje.getMonth()];
    const ano = hoje.getFullYear();

    document.getElementById("dataAtual").textContent =
        `${dia} de ${mes} de ${ano}`;
}

atualizarData();

setInterval(atualizarData, 60000);

lucide.createIcons();