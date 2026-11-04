/* Modelo de demonstração. Sem autenticação, API ou acesso ao MySQL. */
(function (root) {
    "use strict";
    const KEY = "sinstock.demo.stock.v1";
    const seed = () => ({
        version: 1,
        products: [
            { id: "00124", name: "Arroz Tipo 1", category: "alimentos", quantity: 32, minimum: 10, cost: 25.90 },
            { id: "00125", name: "Feijão Carioca", category: "alimentos", quantity: 4, minimum: 10, cost: 8.50 },
            { id: "00126", name: "Café Tradicional", category: "alimentos", quantity: 0, minimum: 8, cost: 17.90 },
            { id: "00127", name: "Refrigerante Cola", category: "bebidas", quantity: 58, minimum: 15, cost: 7.20 }
        ],
        movements: []
    });

    function validate(state) {
        const expected = seed().products;
        if (!state || state.version !== 1 || !Array.isArray(state.products) ||
            state.products.length !== expected.length || !Array.isArray(state.movements)) {
            throw new Error("Dados locais incompatíveis. Use outra origem/perfil de navegador para uma demonstração nova; os dados existentes não foram apagados.");
        }
        state.products.forEach((product, index) => {
            const original = expected[index];
            if (!product || product.id !== original.id || product.name !== original.name ||
                product.category !== original.category || product.minimum !== original.minimum ||
                product.cost !== original.cost || !Number.isSafeInteger(product.quantity) || product.quantity < 0) {
                throw new Error("Dados locais de estoque inválidos. Nenhum dado foi sobrescrito.");
            }
        });
        state.movements.forEach(movement => {
            if (!movement || !expected.some(p => p.id === movement.productId) ||
                !["entrada", "saida", "ajuste"].includes(movement.type) ||
                !Number.isSafeInteger(movement.delta) || !Number.isSafeInteger(movement.balance) || movement.balance < 0 ||
                !["id", "date", "reason", "supplier", "reference", "createdAt"].every(key => typeof movement[key] === "string")) {
                throw new Error("Histórico local inválido. Nenhum dado foi sobrescrito.");
            }
        });
        return state;
    }

    function load(storage) {
        const raw = storage.getItem(KEY);
        if (raw === null) return seed();
        try { return validate(JSON.parse(raw)); }
        catch (error) {
            if (error instanceof SyntaxError) throw new Error("Não foi possível ler o estoque local. Os dados foram preservados.");
            throw error;
        }
    }

    function apply(state, input, now = new Date()) {
        validate(state);
        const next = JSON.parse(JSON.stringify(state));
        const product = next.products.find(item => item.id === input.productId);
        if (!product) throw new Error("Selecione um produto válido.");
        if (!["entrada", "saida", "ajuste"].includes(input.type)) throw new Error("Selecione o tipo de movimentação.");
        const quantity = Number(input.quantity);
        if (!["string", "number"].includes(typeof input.quantity) || String(input.quantity).trim() === "" || !Number.isSafeInteger(quantity) || quantity < 0 ||
            (input.type !== "ajuste" && quantity === 0)) {
            throw new Error("Informe uma quantidade inteira positiva. No ajuste, zero é permitido.");
        }
        const date = String(input.date || "");
        const parsed = new Date(date + "T12:00:00Z");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
            throw new Error("Informe uma data válida.");
        }
        const reason = String(input.reason || "").trim();
        const supplier = String(input.supplier || "").trim();
        const reference = String(input.reference || "").trim();
        if (!reason || reason.length > 200) throw new Error("Informe um motivo com até 200 caracteres.");
        if (supplier.length > 120 || reference.length > 100) throw new Error("Fornecedor ou referência excede o tamanho permitido.");
        if (input.type === "entrada" && (!supplier || !reference)) {
            throw new Error("Uma entrada exige fornecedor e referência de nota fiscal ou pedido.");
        }
        const delta = input.type === "ajuste" ? quantity - product.quantity : input.type === "saida" ? -quantity : quantity;
        const balance = product.quantity + delta;
        if (balance < 0) throw new Error(`Saldo insuficiente. Disponível: ${product.quantity} unidade(s).`);
        if (!Number.isSafeInteger(balance)) throw new Error("Quantidade excede o limite permitido.");
        if (delta === 0) throw new Error("O ajuste informado não altera o saldo.");
        product.quantity = balance;
        next.movements.unshift({
            id: `${now.getTime()}-${next.movements.length + 1}`,
            productId: product.id, type: input.type, delta, balance, date, reason, supplier, reference,
            createdAt: now.toISOString()
        });
        return next;
    }

    function saveMovement(storage, input) {
        // Só devolve sucesso após a gravação. Uma falha preserva a tela/formulário.
        const next = apply(load(storage), input);
        storage.setItem(KEY, JSON.stringify(next));
        return next;
    }

    function status(product) {
        return product.quantity === 0 ? "sem-estoque" : product.quantity <= product.minimum ? "baixo" : "normal";
    }
    const api = { KEY, seed, validate, load, apply, saveMovement, status };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.SinstockStock = api;
})(typeof window !== "undefined" ? window : globalThis);
