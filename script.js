// --- 1. CONFIGURAÇÃO INICIAL E ANIMAÇÃO DE TEXTO ---
const elementoTexto = document.getElementById("texto-animado");
const frases = ["Análise de Crédito Gratuita", "Consultoria Estratégica", "Oportunidade Agro"];
let fraseIndex = 0;
let charIndex = 0;
let deletando = false;

function animarTexto() {
    if (!elementoTexto) return;
    const fraseAtual = frases[fraseIndex];
    if (deletando) {
        elementoTexto.textContent = fraseAtual.substring(0, charIndex - 1);
        charIndex--;
    } else {
        elementoTexto.textContent = fraseAtual.substring(0, charIndex + 1);
        charIndex++;
    }
    let velocidade = deletando ? 50 : 100;
    if (!deletando && charIndex === fraseAtual.length) {
        velocidade = 2000;
        deletando = true;
    } else if (deletando && charIndex === 0) {
        deletando = false;
        fraseIndex = (fraseIndex + 1) % frases.length;
        velocidade = 500;
    }
    setTimeout(animarTexto, velocidade);
}

// --- 2. PADRONIZAÇÃO E MÁSCARAS (VIGIAS) ---
document.addEventListener("DOMContentLoaded", () => {
    animarTexto();

    const campoZap = document.getElementById('whatsapp');
    if (campoZap) {
        campoZap.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            if (!x[2]) {
                e.target.value = x[1];
            } else {
                e.target.value = '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            }
        });
    }

    const camposParaCapitalizar = ['nome', 'local', 'negocio', 'perfil_outro'];
    camposParaCapitalizar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', function (e) {
                let valor = e.target.value;
                e.target.value = valor.split(' ').map(palavra => {
                    if (palavra.length > 0) {
                        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
                    }
                    return palavra;
                }).join(' ');
            });
        }
    });
});

// --- 3. LÓGICA DA BARRA DE PROGRESSO ---
function atualizarProgresso() {
    const camposObrigatorios = ['nome', 'whatsapp', 'email', 'local', 'negocio'];
    let preenchidos = 0;

    camposObrigatorios.forEach(id => {
        const campo = document.getElementById(id);
        if (campo && (campo.style.borderColor === 'rgb(44, 94, 46)' || campo.classList.contains('valido'))) {
            preenchidos++;
        }
    });

    const porcentagem = (preenchidos / camposObrigatorios.length) * 100;
    const barra = document.getElementById('barra-progresso');
    if (barra) barra.style.width = porcentagem + '%';
}

// --- 4. LÓGICA DO CAMPO OUTRO E VALIDAÇÃO EM TEMPO REAL ---
document.getElementById('perfil')?.addEventListener('change', function() {
    const campoOutro = document.getElementById('perfil_outro');
    if (campoOutro) {
        if (this.value === 'Outro') {
            campoOutro.style.display = 'block';
            campoOutro.required = true;
        } else {
            campoOutro.style.display = 'none';
            campoOutro.required = false;
            campoOutro.value = '';
        }
    }
});

const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        let valido = false;
        let valor = input.value.trim();

        if (input.id === 'email') {
            valido = valor.includes('@') && valor.includes('.');
        } 
        else if (input.id === 'whatsapp') {
            valido = valor.replace(/\D/g, '').length === 11;
        } 
        else if (input.id === 'local') {
            if (valor.includes('/')) {
                let partes = valor.split('/');
                let cidade = partes[0].toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, l => l.toUpperCase());
                let estado = partes[1].toUpperCase().substring(0, 2);
                input.value = `${cidade}/${estado}`;
                valor = input.value;
            }
            const regexLocal = /^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]{3,}\/[A-Z]{2}$/;
            valido = regexLocal.test(valor);
        } 
        else {
            valido = valor.length > 2;
        }

        if (valido) {
            input.style.borderColor = "#2c5e2e";
            input.classList.add('valido');
        } else {
            input.style.borderColor = "red";
            input.classList.remove('valido');
        }
        atualizarProgresso();
    });
});

// --- 5. FUNÇÃO ENVIAR (COM TODAS AS TRAVAS) ---
function enviarWhatsApp() {
    const numeroDestino = "556196354223"; 

    const nome = document.getElementById('nome')?.value || "";
    const zapRaw = document.getElementById('whatsapp')?.value || "";
    const email = document.getElementById('email')?.value || "";
    const local = document.getElementById('local')?.value || "";
    const negocio = document.getElementById('negocio')?.value || "";
    const interesse = document.getElementById('interesse')?.value || "";
    const valor = document.getElementById('valor')?.value || "";
    const quandoPrecisa = document.getElementById('quando_precisa')?.value || "Não informado";
    const horarioSelecionado = document.getElementById('horario')?.value || "Não informado";

    // TRAVA 1: E-MAIL
    if (!email.includes('@') || !email.includes('.')) {
        alert("⚠️ ATENÇÃO: E-mail inválido!\nO formulário não pode ser enviado sem um e-mail válido.");
        document.getElementById('email').focus();
        return; 
    }

    // TRAVA 2: LOCALIDADE
    if (!local.includes('/')) {
        alert("⚠️ Formato de localização incorreto!\nUse o padrão Cidade/Estado. Ex: Cuiabá/MT");
        document.getElementById('local').focus();
        return;
    }

    // --- NOVA TRAVA 3: PERFIL "OUTRO" OBRIGATÓRIO ---
    const perfilBase = document.getElementById('perfil')?.value || "";
    let perfilFinal = perfilBase;

    if (perfilBase === 'Outro') {
        const valorOutro = document.getElementById('perfil_outro')?.value.trim();
        if (!valorOutro || valorOutro.length < 3) {
            alert("⚠️ Por favor, especifique qual é o seu perfil no campo 'Outro'.");
            document.getElementById('perfil_outro').focus();
            return; // Bloqueia o envio se não especificar
        }
        perfilFinal = `Outro (${valorOutro})`;
    }

    // Validação Geral (Nome e Zap)
    if(nome.length < 3 || zapRaw.replace(/\D/g, '').length < 11) {
        alert("⚠️ Ops! Verifique se o Nome e o WhatsApp foram preenchidos corretamente.");
        return;
    }

    const mensagem = `*NOVA SOLICITAÇÃO - AGROBANCK*%0A%0A` +
        `👤 *Nome:* ${nome}%0A` +
        `📱 *Zap:* ${zapRaw}%0A` +
        `📧 *E-mail:* ${email}%0A` +
        `📍 *Local:* ${local}%0A` +
        `🚜 *Negócio:* ${negocio}%0A` +
        `👔 *Perfil:* ${perfilFinal}%0A` +
        `🎯 *Interesse:* ${interesse}%0A` +
        `💰 *Valor:* ${valor}%0A` +
        `⏳ *Quando precisa:* ${quandoPrecisa}%0A` + 
        `⏰ *Melhor horário:* ${horarioSelecionado}`;

    const btn = document.querySelector('button');
    if (btn) {
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = "⌛ Processando...";
        btn.disabled = true;

        setTimeout(() => {
            window.open(`https://api.whatsapp.com/send?phone=${numeroDestino}&text=${mensagem}`, '_blank');
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            
            document.getElementById('formularioArea').style.display = 'none';
            document.getElementById('telaSucesso').style.display = 'block';
        }, 1200);
    }
}