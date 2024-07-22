document.addEventListener('DOMContentLoaded', function() {
    const calcularBtn = document.getElementById('calcularBtn');
    if (calcularBtn) {
        calcularBtn.addEventListener('click', calcularIMC);
        carregarHistoricoIMC();
    } else if (window.location.pathname.includes('resultado.html')) {
        mostrarResultado();
        criarGraficos();
    }
});

function calcularIMC() {
    const altura = parseFloat(document.getElementById('altura').value);
    const peso = parseFloat(document.getElementById('peso').value);
    const idade = parseInt(document.getElementById('idade').value);

    if (altura > 0 && peso > 0 && idade > 0) {
        const imc = peso / (altura * altura);
        salvarHistoricoIMC(altura, peso, idade, imc);
        sessionStorage.setItem('IMC', imc.toFixed(2));
        sessionStorage.setItem('Idade', idade);
        window.location.href = 'resultado.html';
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

function salvarHistoricoIMC(altura, peso, idade, imc) {
    const historico = JSON.parse(localStorage.getItem('historicoIMC')) || [];
    historico.push({ altura, peso, idade, imc, data: new Date().toISOString() });
    localStorage.setItem('historicoIMC', JSON.stringify(historico));
}

function carregarHistoricoIMC() {
    const historico = JSON.parse(localStorage.getItem('historicoIMC')) || [];
    const historicoSelect = document.getElementById('historicoSelect');
    historicoSelect.innerHTML = '<option>Selecione um resultado anterior</option>';
    historico.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Data: ${new Date(item.data).toLocaleDateString()} - IMC: ${item.imc.toFixed(2)}`;
        historicoSelect.appendChild(option);
    });
}

function mostrarResultado() {
    const imc = parseFloat(sessionStorage.getItem('IMC'));
    const idade = parseInt(sessionStorage.getItem('Idade'));
    const faixaEtaria = obterFaixaEtaria(idade);
    const faixaIMC = obterFaixaIMC(imc);
    const recomendacao = recomendacoes[faixaIMC][faixaEtaria];

    document.getElementById('imcResult').innerHTML = `Seu IMC é ${imc.toFixed(2)}`;
    document.getElementById('recommendation').innerHTML = recomendacao;
}

function criarGraficos() {
    const imc = parseFloat(sessionStorage.getItem('IMC'));
    const historico = JSON.parse(localStorage.getItem('historicoIMC')) || [];
    const ctx = document.getElementById('imcChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seu IMC', 'IMC Ideal'],
            datasets: [{
                label: 'IMC',
                data: [imc, 22],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    if (historico.length > 1) {
        const evolucaoCtx = document.getElementById('evolucaoChart').getContext('2d');
        new Chart(evolucaoCtx, {
            type: 'line',
            data: {
                labels: historico.map(item => new Date(item.data).toLocaleDateString()),
                datasets: [{
                    label: 'Evolução do IMC',
                    data: historico.map(item => item.imc),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });
    }
}

function obterFaixaEtaria(idade) {
    if (idade < 20) {
        return "jovem";
    } else if (idade <= 60) {
        return "adulto";
    } else {
        return "idoso";
    }
}

function obterFaixaIMC(imc) {
    if (imc < 18.5) {
        return "abaixo";
    } else if (imc <= 24.9) {
        return "normal";
    } else if (imc <= 29.9) {
        return "sobrepeso";
    } else {
        return "obesidade";
    }
}

const recomendacoes = {
    "abaixo": {
        "jovem": "Atenção, você está abaixo do peso ideal. Considere consultar um especialista.",
        "adulto": "Atenção, você está abaixo do peso ideal. É aconselhável verificar sua dieta e saúde geral.",
        "idoso": "É importante cuidar da sua nutrição para manter a saúde."
    },
    "normal": {
        "jovem": "Excelente! Você está dentro da faixa de peso ideal. Mantenha um estilo de vida saudável.",
        "adulto": "Ótimo! Você está mantendo um peso saudável. Continue assim!",
        "idoso": "Você está bem! Continue cuidando de sua saúde e bem-estar."
    },
    "sobrepeso": {
        "jovem": "Você está um pouco acima do peso ideal. Considere ajustes na alimentação e mais atividade física.",
        "adulto": "É importante focar em um estilo de vida mais saudável para alcançar o peso ideal.",
        "idoso": "Monitorar seu peso é crucial. Ajuda profissional pode ser benéfica."
    },
    "obesidade": {
        "jovem": "É essencial buscar orientação médica para reduzir o risco de problemas de saúde.",
        "adulto": "Consulte um especialista para ajuda com plano de saúde e perda de peso eficaz.",
        "idoso": "A obesidade é um fator de risco significativo para várias doenças. Assistência médica é recomendada."
    }
};
