// Tudo referente ao idioma da página fica aqui
// Plota os dados de datalanguage.json nas estruturas HTML referentes
const containerLinguas = document.querySelector('.Linguas');
let dados = {};
let rawData = [];

function inicializar(lang) {
    aplicarDadosNoHTML(lang);   
    aplicarVerMais(lang);       
    iniciarAccordion(lang);      
    renderizarProjetos(lang);
    rotearPagina(lang);   
}

function carregarDados() {
   
    fetch('datalanguage.json')
        .then(response => response.json()) 
        .then(data => {
            rawData = data;
            dados = Object.assign({}, ...data);
            const idiomaSalvo = localStorage.getItem('idioma') || 'pt';
            inicializar(idiomaSalvo);
        })
        .catch(error => console.error("Erro ao carregar o arquivo JSON:", error));
}

function alterarIdioma(lang) {
    localStorage.setItem('idioma', lang);
    aplicarDadosNoHTML(lang);
    renderizarProjetos(lang);
    rotearPagina(lang);
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

function aplicarVerMais(lang) {
    document.querySelectorAll('.TimelineToggle .verMaisTimeline').forEach(span => {
        const texto = dados[`verMais.${lang}`] || dados[`verMais.pt`];
        span.textContent = texto;
    });
}

function iniciarAccordion(lang) {
    document.querySelectorAll('.TimelineToggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const aberto = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!aberto));
            const detalhes = btn.nextElementSibling;
            if (detalhes) detalhes.classList.toggle('aberto', !aberto);
            const span = btn.querySelector('.verMaisTimeline');
            if (span) {
                const novoTexto = aberto
                    ? (dados[`verMais.${lang}`] || dados[`verMais.pt`])
                    : (dados[`verMenos.${lang}`] || dados[`verMenos.pt`]);
                span.textContent = novoTexto;
            }
        });
    });
}

function renderizarProjetos(lang) {
    const cardContainer = document.getElementById("CardsContainer");
    if (!cardContainer) return;

    cardContainer.innerHTML = '';

    const labels = {
        'pt': { ver: 'Ver Projeto', repo: 'Repositório no GitHub', detalhes: 'Detalhes do Projeto' },
        'en': { ver: 'View Project', repo: 'GitHub Repository', detalhes: 'Project Details' },
        'es': { ver: 'Ver Proyecto', repo: 'Repositorio en GitHub', detalhes: 'Detalles del Proyecto' }
    };
    const textoBotao = labels[lang] || labels['pt'];
    const projetos = rawData.filter(item => item[`titulocard.${lang}`]);

    projetos.forEach(dado => {
        const link1 = dado[`link1.${lang}`] ?? null;
        const link2 = dado[`link2.${lang}`] ?? null;

        const botaoVer   = link1 ? `<a href="${link1}" target="_blank" class="link1">${textoBotao.ver}</a>` : '';
        const botaoRepo  = link2 ? `<a href="${link2}" target="_blank" class="link2">${textoBotao.repo}</a>` : '';
        
        const botaoDetalhes = dado.id 
            ? `<a href="?projeto=${dado.id}" class="link1 btn-detalhes" onclick="event.preventDefault(); history.pushState({}, '', '?projeto=${dado.id}'); rotearPagina('${lang}');">${textoBotao.detalhes}</a>` 
            : '';

        const linksHTML = (botaoVer || botaoRepo || botaoDetalhes)
            ? `<div class="card-links">${botaoDetalhes} ${botaoVer} ${botaoRepo}</div>`
            : '';

        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <img class="preview" src="${dado[`iconecard.${lang}`]}" alt="${dado[`titulocard.${lang}`]}">
            <h3 class="titulo-card">${dado[`titulocard.${lang}`]}</h3>
            <p>${dado[`descricaocard.${lang}`]}</p>
            <div class="tecnologias">
                <h4 class="tecnologiasUsadas">${dado[`tecnologiasUsadas.${lang}`]}</h4>
                ${getTechIcons(dado[`tecnologias.${lang}`])}
            </div>
            ${linksHTML}
        `;
        cardContainer.appendChild(div);
    });
}

function getTechIcons(techString) {
    if (!techString) return '';

    const techIconMap = {
        'Flutter': 'flutter.svg',
        'Dart': 'dart.svg',
        'Supabase': 'supabase.svg',
        'Python': 'python.svg',
        'HTML': 'html5.svg',
        'CSS': 'css3.svg',
        'JavaScript': 'javascript.svg',
        'Java': 'java.svg',
        'C++': 'c++.svg',
        'Node.js': 'nodejs.svg',
        'MySQL': 'mysql.svg',
        'PostgreSQL': 'postgresql.svg',
        'Git': 'git.svg',
        'GitHub': 'github.svg',
        'Bootstrap': 'bootstrap.svg',
        'Colab': 'colab.svg',
        'JSON': 'json.svg',
        'TKinter': 'tk.svg',
    };

    const textoLimpo = techString.split('|')[0];

    const termos = textoLimpo
        .split(/[,/]| e | and | y /i)
        .map(t => t.trim())
        .filter(Boolean);

    return termos.map(t => {
        const chaveEncontrada = Object.keys(techIconMap).find(
            key => key.toLowerCase() === t.toLowerCase()
        );
        if (chaveEncontrada) {
            const file = techIconMap[chaveEncontrada];
            return `<img src="assets/icons/${file}" alt="${t}" title="${t}" class="tecnologiaIcone" width="26" height="26" loading="lazy" />`;
        } else {
            return `<span class="tech-text">${t}</span>`;
        }
    }).join('');
}

function rotearPagina(lang) {
    const params = new URLSearchParams(window.location.search);
    const projetoId = params.get('projeto');

    const filhosMain = document.querySelectorAll('main > *');
    const visaoProjeto = document.getElementById('VisaoProjeto');

    if (projetoId && visaoProjeto) {
        filhosMain.forEach(elemento => {
            if (elemento.id !== 'VisaoProjeto') {
                elemento.style.display = 'none';
            }
        });
        visaoProjeto.style.display = 'block';
        carregarDetalhesProjeto(projetoId, lang);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        filhosMain.forEach(elemento => {
            if (elemento.id !== 'VisaoProjeto') {
                elemento.style.display = '';
            }
        });
        if (visaoProjeto) visaoProjeto.style.display = 'none';
    }
}

function carregarDetalhesProjeto(id, lang) {
    const projeto = rawData.find(item => item.id === id && item[`titulocard.${lang}`]);
    if (!projeto) return;

    document.getElementById('DetalheTitulo').textContent = projeto[`titulocard.${lang}`] || '';
    document.getElementById('DetalheImagem').src = projeto[`previewProjeto.${lang}`] || projeto[`iconecard.${lang}`] || '';
    document.getElementById('DetalheDesafio').textContent = projeto[`detalheDesafio.${lang}`] || '';
    document.getElementById('DetalheSolucao').textContent = projeto[`detalheSolucao.${lang}`] || '';
    document.getElementById('DetalheResultado').textContent = projeto[`detalheResultado.${lang}`] || '';
    document.getElementById('DetalheTecnologias').textContent = projeto[`tecnologias.${lang}`] || '';
    document.getElementById('DetalheCliente').textContent = projeto[`detalheCliente.${lang}`] || '';
    document.getElementById('DetalheConceito').textContent = projeto[`detalheConceito.${lang}`] || '';

    const containerLinks = document.getElementById('DetalheLinks');
    containerLinks.innerHTML = '';
    
    const link1 = projeto[`link1.${lang}`];
    const link2 = projeto[`link2.${lang}`];

    if (link1) {
        containerLinks.innerHTML += `<a href="${link1}" target="_blank" class="link1">Acessar Projeto</a>`;
    }
    if (link2) {
        containerLinks.innerHTML += `<a href="${link2}" target="_blank" class="link2">Repositório no GitHub</a>`;
    }
}

document.getElementById('VoltarProjetos')?.addEventListener('click', () => {
    history.pushState({}, '', window.location.pathname);
    const idiomaSalvo = localStorage.getItem('idioma') || 'pt';
    rotearPagina(idiomaSalvo);
});

window.addEventListener('popstate', () => {
    const idiomaSalvo = localStorage.getItem('idioma') || 'pt';
    rotearPagina(idiomaSalvo);
});

carregarDados();