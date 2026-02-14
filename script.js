// --- CONFIGURACIÓN ---
// const TARGET_DATE = new Date("February 14, 2026 00:00:00").getTime();
const TARGET_DATE = new Date().getTime(); // MODO TESTING

// --- REFERENCIAS DOM ---
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const splashScreen = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-btn');
const uiContainer = document.getElementById('visual-novel-ui');
const dialogueBox = document.getElementById('main-dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const nextIndicator = document.getElementById('next-indicator');
const optionsContainer = document.getElementById('options-container');
const letterScene = document.getElementById('letter-scene');

// Referencias Pantalla Triste
const sadScreen = document.getElementById('sad-screen');
const sadText = document.getElementById('sad-text');
const restartBtn = document.getElementById('restart-btn');

let isMusicPlaying = false;
let isWaitingForClick = false;

// --- 1. LÓGICA DE INICIO ---
startBtn.addEventListener('click', () => {
    // Música suave
    music.volume = 0.1; 
    music.play().then(() => {
        isMusicPlaying = true;
        musicBtn.innerText = "🎵";
        musicBtn.classList.add('music-playing');
    }).catch(e => console.log("Error audio:", e));

    splashScreen.classList.add('fade-out');

    setTimeout(() => {
        splashScreen.style.display = 'none';
        uiContainer.classList.remove('hidden');
        musicBtn.classList.remove('hidden');
        startIntroSequence(); 
    }, 1000);
});

// --- 2. MOTOR DE NARRATIVA ---

function typeWriter(text, speed = 40, callback) {
    dialogueText.innerHTML = "";
    optionsContainer.classList.add('hidden');
    nextIndicator.classList.add('hidden');
    isWaitingForClick = false;

    let i = 0;
    function type() {
        if (i < text.length) {
            dialogueText.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            if (callback) callback();
        }
    }
    type();
}

// Función para manejar las esperas de 1.5 segundos
function playSceneWithDelay(text, callback) {
    dialogueText.innerHTML = ""; // <--- AQUI ESTÁ EL CAMBIO: Limpiamos y dejamos vacío
    optionsContainer.classList.add('hidden'); // Aseguramos que no haya botones
    
    // Esperamos 1.5 segundos con el cuadro vacío (suspenso)
    setTimeout(() => {
        typeWriter(text, 40, callback);
    }, 1500); 
}

function waitForClick(nextAction) {
    isWaitingForClick = true;
    nextIndicator.classList.remove('hidden'); 
    
    const clickHandler = () => {
        if (isWaitingForClick) {
            dialogueBox.removeEventListener('click', clickHandler);
            isWaitingForClick = false;
            nextIndicator.classList.add('hidden');
            nextAction(); 
        }
    };
    dialogueBox.addEventListener('click', clickHandler, { once: true });
}

// Generador de Botones (con lógica TRICKY)
function showOptions(options) {
    optionsContainer.innerHTML = "";
    optionsContainer.classList.remove('hidden');
    nextIndicator.classList.add('hidden');
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('pixel-btn');
        btn.innerText = opt.text;
        
        // Lógica del botón escurridizo
        if (opt.isTrick) {
            // Evento para mouse (PC) y touch (Celular)
            const moveBtn = (e) => {
                e.preventDefault(); // Evita que se haga click real
                e.stopPropagation();
                
                // Cálculo de posición aleatoria segura (dentro de la pantalla)
                const parentRect = uiContainer.getBoundingClientRect();
                const btnRect = btn.getBoundingClientRect();
                
                // Límites (restando tamaño del botón para que no se salga)
                const maxX = parentRect.width - btnRect.width; 
                const maxY = parentRect.height - btnRect.height;
                
                const randomX = Math.random() * maxX;
                const randomY = Math.random() * maxY;

                btn.classList.add('moving-btn');
                btn.style.left = `${randomX}px`;
                btn.style.top = `${randomY}px`;
            };

            btn.onmouseover = moveBtn; // PC
            btn.onclick = moveBtn;     // Celular (al intentar tocar)
        } else {
            // Botón Normal
            btn.onclick = () => {
                if (!isMusicPlaying && music.paused) { music.play().catch(()=>{}); isMusicPlaying = true; musicBtn.innerText = "🎵"; musicBtn.classList.add('music-playing'); }
                opt.action();
            };
        }
        
        optionsContainer.appendChild(btn);
    });
}


// --- 3. FLUJO DE LA HISTORIA ---

function startIntroSequence() {
    // Primera escena (2 segundos de delay inicial como pediste)
    setTimeout(() => {
        typeWriter("¿Hola? ¿Quién eres?", 40, () => {
            showOptions([
                { text: "El amor de tu vida ❤️", action: handlePositivePath },
                { text: "Solo pasaba por aquí...", action: handleDoubtPath }
            ]);
        });
    }, 2000); 
}

function handleDoubtPath() {
    playSceneWithDelay("¿Segura? ¿No serás de casualidad mi amorcita bella? 👀", () => {
        showOptions([
            { text: "Si soy 🤭", action: handlePositivePath },
            { text: "Tal veeez...", action: handlePositivePath },
            { text: "No, aléjate de mí", action: triggerSadEnding }
        ]);
    });
}

function handlePositivePath() {
    playSceneWithDelay("¡Qué bien! Estaba pasando por aquí y tuve la grandiosa coincidencia de encontrarme contigo.", () => {
        waitForClick(() => {
            stepBeautifulPlace();
        });
    });
}

function stepBeautifulPlace() {
    playSceneWithDelay("Este lugar me parece hermoso para pedirte algo muy importante...", () => {
        waitForClick(() => {
            stepTheProposal();
        });
    });
}

// --- NUEVA SECCIÓN: LA PROPUESTA ---
function stepTheProposal() {
    playSceneWithDelay("Sé que es un poco tarde, pero... ¿te gustaría ser mi San Valentín? 🥺👉👈", () => {
        showOptions([
            { text: "¡Sii amorcito claro que sí! 💖", action: handleProposalAccepted },
            { text: "No amorcito :c", isTrick: true } // Botón Trampa
        ]);
    });
}

function handleProposalAccepted() {
    playSceneWithDelay("Tú sabes que eres muy especial para mí amorcito, y me encantaría estar contigo en este día tan especial y consentirte mucho...", () => {
        waitForClick(() => {
            stepFinalGift();
        });
    });
}

function stepFinalGift() {
    playSceneWithDelay("Por ahora te tengo este detalle... espero te guste, lo hice con mucho amor ❤️", () => {
        showOptions([
            { text: "A ver 👀", action: showLetter },
            { text: "¡Qué emoción! ¡Muestra!", action: showLetter }
        ]);
    });
}


// --- 4. FINAL TRISTE Y EXTRAS ---

function triggerSadEnding() {
    uiContainer.classList.add('hidden');
    sadScreen.classList.remove('hidden');
    music.pause();

    let sadMessage = "Está bien... lo siento por la confusión...";
    let i = 0;
    sadText.innerHTML = "";
    
    function typeSad() {
        if (i < sadMessage.length) {
            sadText.innerHTML += sadMessage.charAt(i);
            i++;
            setTimeout(typeSad, 150);
        } else {
            restartBtn.classList.remove('hidden');
        }
    }
    setTimeout(typeSad, 1000);
}

restartBtn.addEventListener('click', () => {
    location.reload();
});

// --- LÓGICA FINAL (CARTA Y TIMER) ---

function showLetter() {
    uiContainer.style.opacity = '0';
    uiContainer.style.transition = 'opacity 1s';
    setTimeout(() => {
        uiContainer.style.display = 'none';
        letterScene.classList.remove('hidden');
        startTimer();
    }, 1000);
}

function toggleMusic() {
    if (isMusicPlaying) {
        music.pause();
        musicBtn.innerText = "🔇";
        musicBtn.classList.remove('music-playing');
    } else {
        music.play();
        musicBtn.innerText = "🎵";
        musicBtn.classList.add('music-playing');
    }
    isMusicPlaying = !isMusicPlaying;
}
musicBtn.addEventListener('click', toggleMusic);

// Timer
const timerElement = document.getElementById('timer');
let isValentine = false;
function startTimer() {
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = TARGET_DATE - now;
        if (distance < 0) {
            clearInterval(interval);
            timerElement.innerText = "¡FELIZ SAN VALENTÍN! ❤️";
            timerElement.style.color = "#ff477e";
            timerElement.style.animation = "bounce 1s infinite";
            isValentine = true;
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerElement.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

// Sobre (Lógica sin cambios)
const envoltura = document.querySelector(".envoltura-sobre");
const carta = document.querySelector(".carta");
document.addEventListener("click", (e) => {
    if (splashScreen.style.display !== 'none' && !splashScreen.classList.contains('fade-out')) return;
    if (!sadScreen.classList.contains('hidden')) return;

    if ((e.target.matches(".sobre") || e.target.matches(".corazon") || e.target.matches(".sobre *")) && !isValentine) {
        alert("⛔ Shhh... El candado del tiempo sigue activo. Vuelve en San Valentín.");
        return;
    }
    if (e.target.matches(".sobre") || e.target.matches(".solapa-derecha") || e.target.matches(".solapa-izquierda") || e.target.matches(".corazon")) {
        envoltura.classList.toggle("abierto");
    } else if (e.target.matches(".sobre *")) {
        if (!carta.classList.contains("abierta")) {
            carta.classList.add("mostrar-carta");
            setTimeout(() => { carta.classList.remove("mostrar-carta"); carta.classList.add("abierta"); }, 500);
            envoltura.classList.add("desactivar-sobre");
        } else {
            carta.classList.add("cerrando-carta");
            envoltura.classList.remove("desactivar-sobre");
            setTimeout(() => { carta.classList.remove("cerrando-carta"); carta.classList.remove("abierta"); }, 500);
        }
    } 
});