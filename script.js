document.addEventListener("DOMContentLoaded", function() {
    // 1. Animação de entrada dos textos
    setTimeout(() => {
        document.querySelectorAll('.hidden').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

    // 2. Navegação por Setas do Teclado
    window.addEventListener('keydown', function(e) {
        const paginas = ['index.html', 'slide-2.html', 'slide-3.html', 'slide-4.html', 'slide-5.html', 'slide-6.html', 'slide-7.html', 'slide-8.html', 'slide-9.html', 'slide-10.html'];
        let pathAtual = window.location.pathname.split('/').pop() || 'index.html';
        const indexAtual = paginas.indexOf(pathAtual);

        if (indexAtual !== -1) {
            if (e.key === 'ArrowRight' && indexAtual < paginas.length - 1) {
                window.location.href = paginas[indexAtual + 1];
            } else if (e.key === 'ArrowLeft' && indexAtual > 0) {
                window.location.href = paginas[indexAtual - 1];
            }
        }
    });

    // 3. Lógica do Simulador HMI
    const ecoCanvas = document.getElementById('ecosystemCanvas');
    if (ecoCanvas) {
        const eCtx = ecoCanvas.getContext('2d');
        let ecoMode = 'erp'; 
        let packetProgress = 0;
        let fontsLoaded = false;

        // Elementos da UI (Telemetria e Status)
        const hmiStatus = document.querySelector('.hmi-status');
        const hmiLiveDot = document.getElementById('hmi-live-dot');
        const hmiLiveText = document.getElementById('hmi-live-text');
        const telLatency = document.getElementById('tel-latency');
        const telNodes = document.getElementById('tel-nodes');
        const telData = document.getElementById('tel-data');
        const btnChaos = document.getElementById('btnChaosMode');
        const btnErp = document.getElementById('btnErpMode');

        const ecoNodes = [
            { name: 'ENGENHARIA', icon: '\uf568', angle: 0, cx: 0.2, cy: 0.25, vx: 1.1, vy: 0.8 },
            { name: 'PCP', icon: '\uf274', angle: Math.PI / 3, cx: 0.8, cy: 0.22, vx: -0.9, vy: 1.0 },
            { name: 'ESTOQUE', icon: '\uf468', angle: (2 * Math.PI) / 3, cx: 0.82, cy: 0.75, vx: -1.2, vy: -0.7 },
            { name: 'PRODUÇÃO', icon: '\uf275', angle: Math.PI, cx: 0.5, cy: 0.82, vx: 0.8, vy: -1.1 },
            { name: 'QUALIDADE', icon: '\uf46c', angle: (4 * Math.PI) / 3, cx: 0.18, cy: 0.72, vx: 1.0, vy: -0.9 },
            { name: 'FINANCEIRO', icon: '\uf571', angle: (5 * Math.PI) / 3, cx: 0.48, cy: 0.18, vx: -0.7, vy: 0.95 }
        ];

        function resizeEcoCanvas() {
            const rect = ecoCanvas.parentElement.getBoundingClientRect();
            ecoCanvas.width = rect.width;
            ecoCanvas.height = rect.height;
        }
        window.addEventListener('resize', resizeEcoCanvas);

        document.fonts.load('900 14px "Font Awesome 6 Free"').then(() => {
            fontsLoaded = true;
            resizeEcoCanvas();
            requestAnimationFrame(renderEcosystemCanvas);
        });

        window.setEcosystemMode = function(mode) {
            ecoMode = mode;
            
            if (mode === 'erp') {
                btnErp.className = 'hmi-btn active';
                btnChaos.className = 'hmi-btn';
                hmiStatus.classList.remove('danger');
                hmiLiveText.textContent = 'SISTEMA OPERACIONAL';
                
                // Atualiza Telemetria
                telLatency.textContent = '0.2s';
                telLatency.className = 'tel-value success';
                telNodes.textContent = '6 / 6';
                telNodes.className = 'tel-value success';
                telData.textContent = '100%';
                telData.className = 'tel-value success';

            } else {
                btnChaos.className = 'hmi-btn danger active';
                btnErp.className = 'hmi-btn';
                hmiStatus.classList.add('danger');
                hmiLiveText.textContent = 'ALERTA: FRAGMENTAÇÃO';
                
                // Atualiza Telemetria
                telLatency.textContent = '4.8s';
                telLatency.className = 'tel-value danger';
                telNodes.textContent = '0 / 6';
                telNodes.className = 'tel-value danger';
                telData.textContent = '41%';
                telData.className = 'tel-value danger';
            }
        }

        window.toggleEcosystemMode = function() {
            setEcosystemMode(ecoMode === 'erp' ? 'chaos' : 'erp');
        }

        function renderEcosystemCanvas() {
            if (!fontsLoaded) return;
            const w = ecoCanvas.width;
            const h = ecoCanvas.height;
            eCtx.clearRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2 + 10;
            const radius = Math.min(w, h) * 0.33;
            packetProgress = (packetProgress + 0.004) % 1;

            // Atualiza posições
            ecoNodes.forEach((node) => {
                if (ecoMode === 'erp') {
                    node.angle += 0.004;
                    const targetX = centerX + Math.cos(node.angle) * radius * (w > 600 ? 1.35 : 0.95);
                    const targetY = centerY + Math.sin(node.angle) * radius * 0.85;
                    node.x = node.x ? node.x + (targetX - node.x) * 0.08 : targetX;
                    node.y = node.y ? node.y + (targetY - node.y) * 0.08 : targetY;
                } else {
                    if (!node.x) { node.x = node.cx * w; node.y = node.cy * h; }
                    node.x += node.vx;
                    node.y += node.vy;
                    if (node.x < 90 || node.x > w - 90) node.vx *= -1;
                    if (node.y < 80 || node.y > h - 60) node.vy *= -1;
                }
            });

            // Desenha conexões
            if (ecoMode === 'erp') {
                ecoNodes.forEach((node, idx) => {
                    const nextNode = ecoNodes[(idx + 1) % ecoNodes.length];
                    eCtx.beginPath(); eCtx.moveTo(node.x, node.y); eCtx.lineTo(nextNode.x, nextNode.y);
                    eCtx.strokeStyle = 'rgba(74, 144, 226, 0.15)'; eCtx.lineWidth = 1.5; eCtx.stroke();

                    eCtx.beginPath(); eCtx.moveTo(centerX, centerY); eCtx.lineTo(node.x, node.y);
                    eCtx.strokeStyle = idx % 2 === 0 ? 'rgba(37, 99, 235, 0.5)' : 'rgba(148, 163, 184, 0.4)'; eCtx.lineWidth = 2; eCtx.stroke();

                    const px = centerX + (node.x - centerX) * ((packetProgress + idx * 0.15) % 1);
                    const py = centerY + (node.y - centerY) * ((packetProgress + idx * 0.15) % 1);
                    eCtx.beginPath(); eCtx.arc(px, py, 3.5, 0, Math.PI * 2); eCtx.fillStyle = '#60A5FA'; eCtx.fill();
                });

                eCtx.beginPath(); eCtx.arc(centerX, centerY, 45, 0, Math.PI * 2); eCtx.fillStyle = '#112240'; eCtx.fill();
                eCtx.lineWidth = 3; eCtx.strokeStyle = '#2563EB'; eCtx.stroke();

                eCtx.font = '900 18px "Font Awesome 6 Free"'; eCtx.fillStyle = '#60A5FA'; eCtx.textAlign = 'center'; eCtx.textBaseline = 'middle';
                eCtx.fillText('\uf2db', centerX, centerY - 8); 
                eCtx.font = '700 11px "Montserrat", sans-serif'; eCtx.fillStyle = '#FFFFFF';
                eCtx.fillText('ERP VETEC', centerX, centerY + 12);
            } else {
                eCtx.setLineDash([6, 8]);
                for (let i = 0; i < ecoNodes.length - 1; i++) {
                    eCtx.beginPath(); eCtx.moveTo(ecoNodes[i].x, ecoNodes[i].y); eCtx.lineTo(ecoNodes[i + 1].x, ecoNodes[i + 1].y);
                    eCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; eCtx.lineWidth = 1.5; eCtx.stroke();
                }
                eCtx.setLineDash([]);
            }

            // Desenha os nós
            ecoNodes.forEach(node => {
                eCtx.beginPath(); eCtx.roundRect(node.x - 80, node.y - 22, 160, 44, 10); eCtx.fillStyle = '#0A1128'; eCtx.fill();
                eCtx.lineWidth = 1.5; eCtx.strokeStyle = ecoMode === 'erp' ? 'rgba(37, 99, 235, 0.8)' : 'rgba(239, 68, 68, 0.6)'; eCtx.stroke();

                eCtx.font = '900 14px "Font Awesome 6 Free"'; eCtx.fillStyle = ecoMode === 'erp' ? '#60A5FA' : '#F87171'; eCtx.textAlign = 'center'; eCtx.textBaseline = 'middle';
                eCtx.fillText(node.icon, node.x - 45, node.y);

                eCtx.font = '600 12px "Inter", sans-serif'; eCtx.fillStyle = '#E2E8F0'; eCtx.textAlign = 'left'; eCtx.textBaseline = 'middle';
                eCtx.fillText(node.name, node.x - 30, node.y);
            });
            requestAnimationFrame(renderEcosystemCanvas);
        }
        
        if (document.fonts.check('900 14px "Font Awesome 6 Free"')) {
            fontsLoaded = true; resizeEcoCanvas(); requestAnimationFrame(renderEcosystemCanvas);
        }

        // Inicializa no modo ERP
        setEcosystemMode('erp');
    }
});