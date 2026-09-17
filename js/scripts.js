// Função do cursor customizado 
/* Ponto branco com mix-blend-mode: difference no CSS. Apenas segue o mouse e o CSS cuida da inversão de cor
conforme o que estiver por baixo (fundo claro ou escuro). */

const cursorDot = document.getElementById('CursorDot'); 

if (cursorDot && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    if (window.gsap) {
        const xTo = gsap.quickTo(cursorDot, "x", { duration: 0.15, ease: "power3" });
        const yTo = gsap.quickTo(cursorDot, "y", { duration: 0.15, ease: "power3" });
        gsap.ticker.add(() => {
            xTo(mouseX);
            yTo(mouseY);
        });
    } else {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });
    }
} else if (cursorDot) {
    cursorDot.style.display = 'none';
}


// Função para revelar o Miguel Robô por baixo do Miguel humano :O
const heroImagem = document.querySelector('.HeroImagem');

if (heroImagem) {
    const isTouch = window.matchMedia('(hover: none)').matches;
    let targetX = -9999, targetY = -9999;
    let currentX = -9999, currentY = -9999;

    function definirAlvo(x, y) {
        const rect = heroImagem.getBoundingClientRect();
        targetX = x - rect.left;
        targetY = y - rect.top;
    }

    function lerp(a, b, n) { return a + (b - a) * n; }

    function loopSuavizacao() {
        currentX = lerp(currentX, targetX, 0.15);
        currentY = lerp(currentY, targetY, 0.15);
        heroImagem.style.setProperty('--x', currentX + 'px');
        heroImagem.style.setProperty('--y', currentY + 'px');
        requestAnimationFrame(loopSuavizacao);
    }
    loopSuavizacao();

    heroImagem.addEventListener('mousemove', (e) => definirAlvo(e.clientX, e.clientY));
    heroImagem.addEventListener('mouseleave', () => { targetX = -9999; targetY = -9999; });
    heroImagem.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        definirAlvo(t.clientX, t.clientY);
    });

    if (isTouch) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    varrerAutomaticamente();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(heroImagem);
    }

    function varrerAutomaticamente() {
        const rect = heroImagem.getBoundingClientRect();
        const duracao = 1800;
        const inicio = performance.now();
        function passo(agora) {
            const progresso = Math.min((agora - inicio) / duracao, 1);
            targetX = progresso * rect.width;
            targetY = rect.height / 2;
            if (progresso < 1) {
                requestAnimationFrame(passo);
            } else {
                setTimeout(() => { targetX = -9999; }, 400);
            }
        }
        requestAnimationFrame(passo);
    }
}


// Cascata de caracteres (naipe Matrix)
/* Cada coluna desce continuamente. É desenhado a cada frame o topo da coluna (mais forte) e um rastro de caracteres anteriores com opacidade decrescente.
Perto do mouse, os caracteres são empurrados pra longe do cursor (abre um vão). */

(function () {
    const canvas = document.getElementById('MatrixRain');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const CARACTERES = 'アイウエオカキクケコサシスセソ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]⦓⦔⸹꡴∅∰';
    const TAMANHO_RASTRO = 40;
    const RAIO_MOUSE = 100;
    const FORCA_EMPURRAO = 90;

    let largura, altura, fontSize, colunas, drops, dpr;
    let mouseX = -9999, mouseY = -9999;

    function corLinkRGB() {
        const hex = getComputedStyle(document.documentElement)
            .getPropertyValue('--cor-link').trim() || '#007bff';
        const h = hex.replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const bigint = parseInt(full, 16);
        return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
    }

        function redimensionar() {
        const rect = canvas.parentElement.getBoundingClientRect();
        dpr = window.devicePixelRatio || 1;

        const novaLargura = rect.width;
        const novaAltura = rect.height;

        canvas.width = novaLargura * dpr;
        canvas.height = novaAltura * dpr;
        canvas.style.width = novaLargura + 'px';
        canvas.style.height = novaAltura + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Para não resetar a renderização da cascata toda vez que houver um toque na tela de dispostivos móveis
        const larguraMudou = Math.abs(novaLargura - (largura || 0)) > 5;

        largura = novaLargura;
        altura = novaAltura;
        fontSize = Math.max(20, Math.min(20, largura / 45));

        if (larguraMudou || !colunas) {
            colunas = Math.floor(largura / fontSize);
            drops = Array.from({ length: colunas }, () => Math.random() * -50);
        }
    }
    function caractereAleatorio() {
        return CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
    }

    function desenhar() {
        ctx.clearRect(0, 0, largura, altura);
        const rgb = corLinkRGB();

        for (let i = 0; i < colunas; i++) {
            const baseX = i * fontSize + fontSize / 2;
            const headY = drops[i] * fontSize;

            for (let k = 0; k < TAMANHO_RASTRO; k++) {
                const y = headY - k * fontSize;
                if (y < 0 || y > altura) continue;

                let x = baseX;

                // Distorção: empurra o caractere pra longe do cursor 
                const dx = x - mouseX;
                const dy = y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < RAIO_MOUSE && dist > 0.01) {
                    const forca = (1 - dist / RAIO_MOUSE) * FORCA_EMPURRAO;
                    x += (dx / dist) * forca;
                }

                const alpha = k === 0 ? 0.95 : Math.max(0, 0.55 - (k / TAMANHO_RASTRO) * 0.55);
                if (alpha <= 0) continue;

                ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(caractereAleatorio(), x, y);
            }

            drops[i] += 0.35;
            if (headY > altura + TAMANHO_RASTRO * fontSize && Math.random() > 0.975) {
                drops[i] = Math.random() * -20;
            }
        }

        requestAnimationFrame(desenhar);
    }

    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(redimensionar, 200);
    });

    redimensionar();
    desenhar();
})();


// Árvore / Constelação (como você preferir chamar) das minhas skills
/* Hub central -> vertentes -> ferramentas.
// Ferramentas que pertencem a mais de uma vertente (ex: JavaScript em Front-end E Linguagens) recebem uma linha diagonal extra até a
categoria secundária, sem mudar de posição na órbita. */

(function () {
    const canvas = document.getElementById('StackConstelacao');
    const tooltip = document.getElementById('ConstelacaoTooltip');
    if (!canvas || !tooltip) return;

    const ctx = canvas.getContext('2d');

    // Vertentes, na ordem em que aparecem na órbita
    const CATEGORIAS = [
        { chave: 'Línguas', label:'Línguas / Languages'},
        { chave: 'FrontEnd', label: 'Front-end / Web' },
        { chave: 'BackEnd', label: 'Back-end' },
        { chave: 'Mobile', label: 'Mobile' },
        { chave: 'Database', label: 'Database / Dados' },
        { chave: 'Linguagens', label: 'Linguagens / Programming' },
        { chave: 'DevFerramentas', label: 'Dev / Ferramentas' },
        { chave: 'Testes', label: 'Testes / Tests' },
        { chave: 'Cloud', label: 'Cloud / BaaS' },
        { chave: 'Office', label: 'Office / Produtividade' },
    ];

    // Local que eu edito as ferramentas
    // categoria = vertente onde ela fica posicionada (primária)
    // extras = outras vertentes que também se ligam a ela (gera as diagonais tracejadas)
    const FERRAMENTAS = [
        {nome: 'Português', fluencia: 'fluente', icone: 'assets/icons/brazil.png', categoria: 'Línguas'},
        {nome: 'English', fluencia: 'avancado', icone: 'assets/icons/usa.png', categoria: 'Línguas'},
        {nome: 'Español', fluencia: 'basico', icone: 'assets/icons/spain.png', categoria: 'Línguas'},

        { nome: 'HTML5', nivel: 'dominio', icone: 'assets/icons/html5.svg', categoria: 'FrontEnd' },
        { nome: 'CSS3', nivel: 'dominio', icone: 'assets/icons/css3.svg', categoria: 'FrontEnd' },
        { nome: 'JavaScript', nivel: 'dominio', icone: 'assets/icons/javascript.svg', categoria: 'FrontEnd', extras: ['Linguagens'] },
        { nome: 'Bootstrap', nivel: 'conhecimento', icone: 'assets/icons/bootstrap.svg', categoria: 'FrontEnd' },

        { nome: 'Node.js', nivel: 'conhecimento', icone: 'assets/icons/nodejs.svg', categoria: 'BackEnd' },
        { nome: 'Java', nivel: 'conhecimento', icone: 'assets/icons/java.svg', categoria: 'BackEnd', extras: ['Linguagens'] },
        { nome: 'Spring Boot', nivel: 'conhecimento', icone: 'assets/icons/springboot.svg', categoria: 'BackEnd' },

        { nome: 'Flutter', nivel: 'dominio', icone: 'assets/icons/flutter.svg', categoria: 'Mobile' },
        { nome: 'Dart', nivel: 'dominio', icone: 'assets/icons/dart.svg', categoria: 'Mobile', extras: ['Linguagens'] },

        { nome: 'SQL', nivel: 'conhecimento', icone: 'assets/icons/sql.svg', categoria: 'Database' },
        { nome: 'MySQL', nivel: 'conhecimento', icone: 'assets/icons/mysql.svg', categoria: 'Database' },
        { nome: 'PostgreSQL', nivel: 'conhecimento', icone: 'assets/icons/postgresql.svg', categoria: 'Database' },
        { nome: 'Supabase', nivel: 'dominio', icone: 'assets/icons/supabase.svg', categoria: 'Cloud', extras: ['Database'] },

        { nome: 'Python', nivel: 'dominio', icone: 'assets/icons/python.svg', categoria: 'Linguagens' },
        { nome: 'C++', nivel: 'conhecimento', icone: 'assets/icons/c++.svg', categoria: 'Linguagens', extras: ['BackEnd'] },

        { nome: 'Git', nivel: 'dominio', icone: 'assets/icons/git.svg', categoria: 'DevFerramentas' },
        { nome: 'GitHub', nivel: 'dominio', icone: 'assets/icons/github.svg', categoria: 'DevFerramentas' },
        { nome: 'VS Code', nivel: 'dominio', icone: 'assets/icons/vscode.svg', categoria: 'DevFerramentas' },
        { nome: 'IntelliJ', nivel: 'dominio', icone: 'assets/icons/intellij.svg', categoria: 'DevFerramentas' },

        { nome: 'JUnit', nivel: 'conhecimento', icone: 'assets/icons/junit5.svg', categoria: 'Testes' },

        { nome: 'Office 365', nivel: 'dominio', icone: 'assets/icons/office365.svg', categoria: 'Office' },
    ];
    const TEXTO_STATUS = {
        dominio: 'NivelDominio',
        conhecimento: 'NivelConhecimento',
        fluente: 'FluenciaFluente',
        avancado: 'FluenciaAvancado',
        basico: 'FluenciaBasico'
    };

    function textoStatusTraduzido(valor) {
        const idioma = localStorage.getItem('idioma') || 'pt';
        const chave = TEXTO_STATUS[valor];
        return (chave && dados[`${chave}.${idioma}`]) || valor;
    }

    let largura, altura, escala, dpr;
    let nos = [];
    let linhasExtras = []; // diagonais (ferramenta -> categoria secundária)
    let mouseX = -9999, mouseY = -9999, mouseXTela = 0, mouseYTela = 0;
    let noAtivo = null;

    function corLinkRGB() {
        const hex = getComputedStyle(document.documentElement)
            .getPropertyValue('--cor-link').trim() || '#007bff';
        const h = hex.replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const bigint = parseInt(full, 16);
        return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
    }

    // Carrega os ícones uma única vez
    const cacheIcones = {};
    FERRAMENTAS.forEach((f) => {
        if (!cacheIcones[f.icone]) {
            const img = new Image();
            img.src = f.icone;
            cacheIcones[f.icone] = img;
        }
    });

    function redimensionar() {
        const rect = canvas.getBoundingClientRect();
        dpr = window.devicePixelRatio || 1;
        largura = rect.width;
        altura = rect.height;
        canvas.width = largura * dpr;
        canvas.height = altura * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        escala = Math.min(largura, altura) / 760;
    }

    function desenhar(tempo) {
        ctx.clearRect(0, 0, largura, altura);
        const rgb = corLinkRGB();
        const cx = largura / 2, cy = altura / 2;
        nos = [];
        linhasExtras = [];

        const raioCategoria = 210 * escala;
        const raioFerramenta = 140 * escala;

        // Círculo central
        const hub = { x: cx, y: cy + Math.sin(tempo / 1800) * 3 * escala, raioBase: 32 * escala, tipo: 'hub', nome: 'Minha Stack' };
        nos.push(hub);

        // Categorias, uma por vertente, distribuídas em círculo 
        const mapaCategorias = {};
        CATEGORIAS.forEach((cat, i) => {
            const angulo = (i / CATEGORIAS.length) * Math.PI * 2 - Math.PI / 2;
            const balanco = Math.sin(tempo / 1400 + i) * 4 * escala;
            const x = cx + Math.cos(angulo) * (raioCategoria + balanco);
            const y = cy + Math.sin(angulo) * (raioCategoria + balanco);
            const no = { x, y, raioBase: 17 * escala, tipo: 'categoria', nome: cat.label, chave: cat.chave, angulo, pai: hub };
            nos.push(no);
            mapaCategorias[cat.chave] = no;
        });

        // Ferramentas, agrupadas pela categoria primária
        const porCategoria = {};
        FERRAMENTAS.forEach((f) => {
            (porCategoria[f.categoria] = porCategoria[f.categoria] || []).push(f);
        });

        Object.entries(porCategoria).forEach(([chaveCat, lista]) => {
            const catNode = mapaCategorias[chaveCat];
            if (!catNode) return;
            const spread = Math.PI / 3;

            lista.forEach((f, j) => {
                const anguloBase = catNode.angulo - spread / 2 + (j / Math.max(lista.length - 1, 1)) * spread;
                const balanco = Math.sin(tempo / 1000 + j * 2) * 5 * escala;
                const fx = catNode.x + Math.cos(anguloBase) * (raioFerramenta + balanco);
                const fy = catNode.y + Math.sin(anguloBase) * (raioFerramenta + balanco);

                const noFerramenta = {
                    x: fx, y: fy, raioBase: 10 * escala, tipo: 'ferramenta',
                    nome: f.nome, nivel: f.nivel, fluencia: f.fluencia, icone: f.icone, pai: catNode
                };
                nos.push(noFerramenta);

                // Diagonais: liga direto às categorias extras 
                (f.extras || []).forEach((chaveExtra) => {
                    const catExtra = mapaCategorias[chaveExtra];
                    if (catExtra) linhasExtras.push({ de: noFerramenta, para: catExtra });
                });
            });
        });

        // Pra detectar o hover
        noAtivo = null;
        let menorDist = Infinity;
        nos.forEach((no) => {
            const d = Math.hypot(no.x - mouseX, no.y - mouseY);
            if (d < no.raioBase + 10 * escala && d < menorDist) {
                menorDist = d;
                noAtivo = no;
            }
        });

        // Linhas da árvore (ou constelação) (hub->categoria, categoria->ferramenta)
        nos.forEach((no) => {
            if (!no.pai) return;
            const destacada = noAtivo === no || noAtivo === no.pai;
            ctx.beginPath();
            ctx.moveTo(no.pai.x, no.pai.y);
            ctx.lineTo(no.x, no.y);
            ctx.strokeStyle = `rgba(${rgb}, ${destacada ? 0.9 : 0.22})`;
            ctx.lineWidth = destacada ? 2 : 1;
            ctx.stroke();
        });

        // Linhas diagonais (ferramenta -> categoria extra)
        linhasExtras.forEach(({ de, para }) => {
            const destacada = noAtivo === de || noAtivo === para;
            ctx.beginPath();
            ctx.moveTo(de.x, de.y);
            ctx.lineTo(para.x, para.y);
            ctx.strokeStyle = `rgba(${rgb}, ${destacada ? 0.85 : 0.15})`;
            ctx.lineWidth = destacada ? 1.8 : 1;
            ctx.setLineDash([4, 4]); // tracejado, pra diferenciar da árvore principal
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Nós(das ferramentas e categorias)
        nos.forEach((no) => {
            const ativo = noAtivo === no;
            const raio = no.raioBase * (ativo ? 1.25 : 1);

            // Legenda fixa (sempre visível, sem depender de hover)
            if (no.tipo === 'categoria') {
                ctx.font = `${(no.tipo === 'categoria' ? 17 : 10) * escala}px sans-serif`;
                ctx.fillStyle = `rgba(${rgb}, 0.9)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(no.nome, no.x, no.y + raio + 4 * escala);
            }

            if (no.tipo === 'hub' || no.tipo === 'categoria') {
                ctx.beginPath();
                ctx.arc(no.x, no.y, raio, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, ${ativo ? 1 : 0.85})`;
                ctx.fill();
                return;
            }

            const img = cacheIcones[no.icone];
            if (img && img.complete && img.naturalWidth > 0) {
                const tamanho = raio * 4.2;
                ctx.save();
                const colorido = no.nivel === 'dominio' || no.fluencia === 'fluente' || no.fluencia === 'avancado';
                ctx.filter = colorido ? 'none' : 'grayscale(1) opacity(0.55)'
                ctx.drawImage(img, no.x - tamanho / 2, no.y - tamanho / 2, tamanho, tamanho);
                ctx.restore();

                if (ativo) {
                    ctx.beginPath();
                    ctx.arc(no.x, no.y, tamanho / 2 + 4 * escala, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${rgb}, 0.8)`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            } else {
                ctx.beginPath();
                ctx.arc(no.x, no.y, raio, 0, Math.PI * 2);
                no.nivel === 'dominio' ? ctx.fill() : ctx.stroke();
            }
        });

        // Tooltip (nível que eu possuo em determinada ferramenta)
        if (noAtivo && noAtivo.tipo !== 'hub') {
            tooltip.innerHTML = noAtivo.tipo === 'categoria'
                ? noAtivo.nome
                : `${noAtivo.nome}<span class="nivel">${textoStatusTraduzido(noAtivo.fluencia || noAtivo.nivel)}</span>`;
            tooltip.classList.add('ativa');

            // Prende a tooltip dentro da tela, evitando que corte nas bordas em telas pequenas
            const margem = 12;
            const larguraTooltip = tooltip.offsetWidth;
            const xClamp = Math.max(
                larguraTooltip / 2 + margem,
                Math.min(window.innerWidth - larguraTooltip / 2 - margem, mouseXTela)
            );
            tooltip.style.left = xClamp + 'px';
            tooltip.style.top = mouseYTela + 'px';
        } else {
            tooltip.classList.remove('ativa');
        }

        requestAnimationFrame(desenhar);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mouseXTela = e.clientX;
        mouseYTela = e.clientY;
    });
    canvas.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(redimensionar, 200);
    });

    redimensionar();
    requestAnimationFrame(desenhar);
})();


// barra de progresso
const progressBar = document.getElementById('ScrollProgressBar');

function atualizarProgresso() {
    if (!progressBar) return;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollAtual = window.scrollY;
    const porcentagem = alturaTotal > 0 ? (scrollAtual / alturaTotal) * 100 : 0;
    progressBar.style.width = porcentagem + '%';
}

window.addEventListener('scroll', atualizarProgresso);
window.addEventListener('resize', atualizarProgresso);
atualizarProgresso();

// Acordeão dos itens da timeline
document.querySelectorAll('.TimelineToggle').forEach((btn) => {
    btn.addEventListener('click', () => {
        const aberto = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!aberto));

        const detalhes = btn.nextElementSibling;
        if (detalhes) detalhes.classList.toggle('aberto', !aberto);
    });
});

// Coloca o ano atual no copyright do rodapé
 const anoAtualEl = document.getElementById('AnoAtual');
if (anoAtualEl) {
    anoAtualEl.textContent = new Date().getFullYear();
}

// GSAP: Efeitos de scroll
window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // --- Timeline: revela cada marco conforme entra na tela ---
    gsap.utils.toArray('.TimelineItem').forEach((item) => {
        gsap.from(item, {
            opacity: 0,
            y: 100,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Fade-in genérico: títulos e blocos estáticos de cada seção
    const alvosFadeIn = [
        '.TituloSecao',
        '.HeroTexto',
        '.HeroImagem',
        '.ContainerSecaoSobre',
        '.Projetos',
        '.StrongTrajetoria',
        '.ContatoContainer',
        '.RodapeColuna'
    ];
    gsap.utils.toArray(alvosFadeIn.join(', ')).forEach((el) => {
        gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Projetos: fade-in nos cards quando são plotados (delegado, já que os cards são criados via JS)
    const cardsObserver = new MutationObserver(() => {
        gsap.utils.toArray('.card').forEach((card) => {
            if (card.dataset.animado) return;
            card.dataset.animado = "true";
            gsap.from(card, {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    });
    const cardsContainer = document.getElementById('CardsContainer');
    if (cardsContainer) {
        cardsObserver.observe(cardsContainer, { childList: true });
    }
});

// Meu número do Zap-Zap
const NUMERO_WHATSAPP = "5537999343449";

if (NUMERO_WHATSAPP) {
    const linkWpp = `https://wa.me/${NUMERO_WHATSAPP}`;
    document.querySelectorAll('#LinkWhatsapp, #LinkWhatsappRodape').forEach((el) => {
        el.href = linkWpp;
    });
}
