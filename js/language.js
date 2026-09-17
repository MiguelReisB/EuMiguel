// Plota os dados de datalanguage.json nas estruturas HTML referentes
const containerLinguas = document.querySelector('.Linguas');
let dados = {};
let rawData = [];

function carregarDados() {
   
    fetch('datalanguage.json')
        .then(response => response.json()) 
        .then(data => {
            rawData = data;
            dados = Object.assign({}, ...data);
            const idiomaSalvo = localStorage.getItem('idioma') || 'pt';
            aplicarDadosNoHTML(idiomaSalvo);
            renderizarProjetos(idiomaSalvo);
        })
        .catch(error => console.error("Erro ao carregar o arquivo JSON:", error));
}

function alterarIdioma(lang) {
    localStorage.setItem('idioma', lang);
    aplicarDadosNoHTML(lang);
    renderizarProjetos(lang);
}

if (containerLinguas) {
    containerLinguas.addEventListener('click', function(event) {
        const botao = event.target.closest('button');
        if (botao && botao.dataset.lang) {
            alterarIdioma(botao.dataset.lang);
        }
    });
}

function aplicarDadosNoHTML(lang) {
    if (Object.keys(dados).length === 0) return;
    const elementos = document.querySelectorAll('[data-translate-key]');
    elementos.forEach(elemento => {
        const key = elemento.dataset.translateKey;
        const fullKey = `${key}.${lang}`;
        if (dados[fullKey]) {
            elemento.innerHTML = dados[fullKey];
        }
    });
}

function renderizarProjetos(lang) {
    const cardContainer = document.getElementById("CardsContainer");
    if (!cardContainer) return;

    cardContainer.innerHTML = '';

    const labels = {
        'pt': { ver: 'Ver Projeto', repo: 'Repositório no GitHub' },
        'en': { ver: 'View Project', repo: 'GitHub Repository' },
        'es': { ver: 'Ver Proyecto', repo: 'Repositorio en GitHub' }
    };
    const textoBotao = labels[lang] || labels['pt'];

    const projetos = rawData.filter(item => item[`titulocard.${lang}`]);

    projetos.forEach(dado => {
        const link1 = dado[`link1.${lang}`] ?? null;   // página do projeto
        const link2 = dado[`link2.${lang}`] ?? null;   // repositório

        const botaoVer   = link1 ? `<a href="${link1}" target="_blank" class="link1">${textoBotao.ver}</a>` : '';
        const botaoRepo  = link2 ? `<a href="${link2}" target="_blank" class="link2">${textoBotao.repo}</a>` : '';

        const linksHTML = (botaoVer || botaoRepo)
            ? `<div class="card-links">${botaoVer}${botaoRepo}</div>`
            : '';   // string vazia → não será inserida

        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <img src="${dado[`iconecard.${lang}`]}" alt="${dado[`titulocard.${lang}`]}">
            <h3 class="titulo-card">${dado[`titulocard.${lang}`]}</h3>
            <p>${dado[`descricaocard.${lang}`]}</p>
            <div class="tecnologias"><i><p>${dado[`tecnologias.${lang}`]}</p></i></div>
            ${linksHTML}
        `;
        cardContainer.appendChild(div);
    });
}

carregarDados();