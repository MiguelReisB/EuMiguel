const themeToggle = document.getElementById('checkbox');
const body = document.body;


const setTema = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark');
        if (themeToggle) themeToggle.checked = true;
    } else {
        body.classList.remove('dark');
        if (themeToggle) themeToggle.checked = false;
    }
};

const temaSalvo = localStorage.getItem('tema') || 'light';
setTema(temaSalvo);

if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        const novoTema = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('tema', novoTema);
        setTema(novoTema);
    });
}

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  const btn = document.getElementById("back-to-top");
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 200) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
}

document.getElementById("back-to-top").onclick = function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
};