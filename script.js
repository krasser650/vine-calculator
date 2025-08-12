function calcDellCof() {
    let sugar = Number(document.getElementById('sugar_id').value);
    let alcohol = Number(document.getElementById('alcohol_id').value);
    let result = document.getElementById('result_id');
    if (sugar > 0 && alcohol > 0 && result) {
        const res = sugar + (alcohol * 4.5)
        if (res >= 80) {
            result.textContent = 'Коєфіціент : ' + res.toFixed(2);
            result.style.color = "black";

        } else {
            result.textContent = 'Коєфіціент : ' + res.toFixed(2);
            result.style.color = "red";
        }
    } else {
        result.textContent = "Коєфіціент : не розраховано";
    }
}

function calcAlcohol() {
    let sugar = Number(document.getElementById('sugar_id').value);
    let alcohol = Number(document.getElementById('alcohol_id').value);

    let sugarVine = Number(document.getElementById('sugar-vine_id').value);
    let amountVine = Number(document.getElementById('amount-wine_id').value);
    let alcoholBlend = Number(document.getElementById('alcohol-blend_id').value);
    let total = document.getElementById('total_id');

    if (sugarVine > 0 && amountVine > 0 && alcoholBlend > 0 && sugar > 0 && alcohol > 0 && total) {
        const result = ((alcohol - ((sugarVine - sugar) * 0.56)) / (alcoholBlend - alcohol)) * amountVine;
        if (result > 0) {
            total.textContent = 'Необхідно додати : ' + result.toFixed(3) + ' л.';
        } else {
            total.textContent = 'Необхідно додати : не розраховано';
        }
    } else {
        alert("Деякі поля мають неправильні дані. Перевірте значення та спробуйте знову");
    }
}

function resetAll() {
    const form = document.getElementById('form_id');
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '0';
    });
    let total = document.getElementById('total_id');
    let result = document.getElementById('result_id');
    if (total && result) {
        total.textContent = 'Необхідно додати : не розраховано';
        result.textContent = 'Результат : не розраховано';
    }
}
