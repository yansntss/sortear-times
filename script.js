class TeamDrawApp {
    constructor() {
        this.players = [];
        this.teams = [];
        this.loadDataFromLocalStorage();
        this.initializeEventListeners();
        this.updateUI();
    }

    loadDataFromLocalStorage() {
        // Tentar carregar os jogadores e times do localStorage
        const savedPlayers = localStorage.getItem('players');
        const savedTeams = localStorage.getItem('teams');

        if (savedPlayers) {
            this.players = JSON.parse(savedPlayers);
        }

        if (savedTeams) {
            this.teams = JSON.parse(savedTeams);
        }
    }

    saveDataToLocalStorage() {
        // Salvar os jogadores e times no localStorage
        localStorage.setItem('players', JSON.stringify(this.players));
        localStorage.setItem('teams', JSON.stringify(this.teams));
    }

    initializeEventListeners() {
        // Elementos do DOM
        this.elements = {
            playerName: document.getElementById('playerName'),
            playerSkill: document.getElementById('playerSkill'),
            playerPosition: document.getElementById('playerPosition'),
            addPlayerBtn: document.getElementById('addPlayer'),
            drawTeamsBtn: document.getElementById('drawTeams'),
            clearAllBtn: document.getElementById('clearAll'),
            numTeams: document.getElementById('numTeams'),
            playersPerTeam: document.getElementById('playersPerTeam'),
            playersList: document.getElementById('playersList'),
            playerCount: document.getElementById('playerCount'),
            resultsSection: document.getElementById('resultsSection'),
            teamsResult: document.getElementById('teamsResult'),
            balanceInfo: document.getElementById('balanceInfo')
        };

        // Event listeners
        this.elements.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.elements.drawTeamsBtn.addEventListener('click', () => this.drawTeams());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // Enter key para adicionar jogador
        this.elements.playerName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });

        // Atualizar botão de sorteio quando configurações mudarem
        this.elements.numTeams.addEventListener('change', () => this.updateDrawButton());
        this.elements.playersPerTeam.addEventListener('change', () => this.updateDrawButton());
    }

    addPlayer() {
        const name = this.elements.playerName.value.trim();
        const skill = parseInt(this.elements.playerSkill.value);
        const position = this.elements.playerPosition.value;

        if (!name) {
            alert('Por favor, digite o nome do jogador!');
            return;
        }

        // Verificar se o jogador já existe
        if (this.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            alert('Este jogador já foi adicionado!');
            return;
        }

        const player = {
            id: Date.now(),
            name,
            skill,
            position
        };

        this.players.push(player);
        this.elements.playerName.value = '';
        this.saveDataToLocalStorage();  // Salvar os dados no localStorage
        this.updateUI();
        this.elements.playerName.focus();
    }

    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
        this.saveDataToLocalStorage();  // Salvar os dados no localStorage
        this.updateUI();
    }

    updateUI() {
        this.updatePlayersList();
        this.updatePlayerCount();
        this.updateDrawButton();
    }

    updatePlayersList() {
        const container = this.elements.playersList;
        container.innerHTML = '';

        this.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            const stars = '⭐'.repeat(player.skill);
            const positionNames = {
                'pivo': 'Pivô',
                'fixo': 'Fixo',
                'meio': 'Meio',
                'ala': 'Ala'
            };

            playerCard.innerHTML = `
                <button class="remove-player" onclick="app.removePlayer(${player.id})">×</button>
                <div class="player-name">${player.name}</div>
                <div class="player-details">
                    <span class="player-skill">${stars}</span>
                    <span class="player-position">${positionNames[player.position]}</span>
                </div>
            `;

            container.appendChild(playerCard);
        });
    }

    updatePlayerCount() {
        this.elements.playerCount.textContent = this.players.length;
    }

    updateDrawButton() {
        const numTeams = parseInt(this.elements.numTeams.value);
        const playersPerTeam = parseInt(this.elements.playersPerTeam.value);
        const requiredPlayers = numTeams * playersPerTeam;
        
        const canDraw = this.players.length >= requiredPlayers;
        this.elements.drawTeamsBtn.disabled = !canDraw;
        
        if (!canDraw && this.players.length > 0) {
            this.elements.drawTeamsBtn.textContent = `🎲 Sortear Times (${this.players.length}/${requiredPlayers} jogadores)`;
        } else {
            this.elements.drawTeamsBtn.textContent = '🎲 Sortear Times';
        }
    }

    drawTeams() {
        const numTeams = parseInt(this.elements.numTeams.value);
        const playersPerTeam = parseInt(this.elements.playersPerTeam.value);
        
        // Criar cópia dos jogadores para não modificar o array original
        const availablePlayers = [...this.players];
        
        // Inicializar times vazios
        this.teams = Array.from({ length: numTeams }, (_, i) => ({
            id: i + 1,
            name: `Time ${i + 1}`,
            players: [],
            totalSkill: 0,
            positions: { pivo: 0, fixo: 0, meio: 0, ala: 0 }
        }));

        // Algoritmo de balanceamento
        this.balanceTeams(availablePlayers, playersPerTeam);
        
        // Exibir resultados
        this.displayResults();
        this.saveDataToLocalStorage();  // Salvar os dados no localStorage
    }

    balanceTeams(availablePlayers, playersPerTeam) {
        // Separar jogadores por posição
        const playersByPosition = {
            pivo: availablePlayers.filter(p => p.position === 'pivo'),
            fixo: availablePlayers.filter(p => p.position === 'fixo'),
            meio: availablePlayers.filter(p => p.position === 'meio'),
            ala: availablePlayers.filter(p => p.position === 'ala')
        };

        // Ordenar cada posição por habilidade (decrescente)
        Object.keys(playersByPosition).forEach(position => {
            playersByPosition[position].sort((a, b) => b.skill - a.skill);
        });

        // Distribuir jogadores por posição de forma balanceada
        const positions = ['pivo', 'fixo', 'meio', 'ala'];
        
        for (let round = 0; round < playersPerTeam; round++) {
            for (const position of positions) {
                if (playersByPosition[position].length === 0) continue;
                
                // Encontrar o time com menor força total para esta posição
                const sortedTeams = this.teams
                    .filter(team => team.players.length < playersPerTeam)
                    .sort((a, b) => {
                        // Priorizar times com menos jogadores desta posição
                        const positionDiff = a.positions[position] - b.positions[position];
                        if (positionDiff !== 0) return positionDiff;
                        
                        // Se igual, priorizar time com menor força total
                        return a.totalSkill - b.totalSkill;
                    });

                if (sortedTeams.length > 0 && playersByPosition[position].length > 0) {
                    const team = sortedTeams[0];
                    const player = playersByPosition[position].shift();
                    
                    team.players.push(player);
                    team.totalSkill += player.skill;
                    team.positions[player.position]++;
                }
            }
        }

        // Se ainda restam jogadores, distribuir pelos times com menos jogadores
        const remainingPlayers = Object.values(playersByPosition).flat();
        remainingPlayers.sort((a, b) => b.skill - a.skill);

        for (const player of remainingPlayers) {
            const teamWithFewestPlayers = this.teams
                .filter(team => team.players.length < playersPerTeam)
                .sort((a, b) => {
                    const playerDiff = a.players.length - b.players.length;
                    if (playerDiff !== 0) return playerDiff;
                    return a.totalSkill - b.totalSkill;
                })[0];

            if (teamWithFewestPlayers) {
                teamWithFewestPlayers.players.push(player);
                teamWithFewestPlayers.totalSkill += player.skill;
                teamWithFewestPlayers.positions[player.position]++;
            }
        }
    }

    displayResults() {
        // Mostrar seção de resultados
        this.elements.resultsSection.style.display = 'block';
        
        // Exibir times
        this.displayTeams();
        
        // Exibir informações de balanceamento
        this.displayBalanceInfo();
        
        // Scroll para os resultados
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayTeams() {
        const container = this.elements.teamsResult;
        container.innerHTML = '';

        this.teams.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';

            const avgSkill = team.players.length > 0 ? 
                (team.totalSkill / team.players.length).toFixed(1) : 0;

            const positionNames = {
                'pivo': 'Pivô',
                'fixo': 'Fixo',
                'meio': 'Meio',
                'ala': 'Ala'
            };

            teamCard.innerHTML = `
                <div class="team-header">
                    <div class="team-name">${team.name}</div>
                    <div class="team-stats">
                        Força Total: ${team.totalSkill} | Média: ${avgSkill} ⭐
                    </div>
                </div>
                <ul class="team-players">
                    ${team.players.map(player => `
                        <li class="team-player">
                            <div class="team-player-name">${player.name}</div>
                            <div class="team-player-info">
                                <span>${'⭐'.repeat(player.skill)}</span>
                                <span>${positionNames[player.position]}</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;

            container.appendChild(teamCard);
        });
    }

    displayBalanceInfo() {
        const container = this.elements.balanceInfo;
        
        // Calcular estatísticas de balanceamento
        const teamSkills = this.teams.map(team => team.totalSkill);
        const maxSkill = Math.max(...teamSkills);
        const minSkill = Math.min(...teamSkills);
        const avgSkill = (teamSkills.reduce((a, b) => a + b, 0) / teamSkills.length).toFixed(1);
        const skillDifference = maxSkill - minSkill;
        
        // Calcular distribuição de posições
        const positionDistribution = {};
        const positions = ['pivo', 'fixo', 'meio', 'ala'];
        
        positions.forEach(position => {
            const counts = this.teams.map(team => team.positions[position]);
            const max = Math.max(...counts);
            const min = Math.min(...counts);
            positionDistribution[position] = { max, min, diff: max - min };
        });

        container.innerHTML = `
            <div class="balance-stats">
                <div class="balance-stat">
                    <div class="balance-stat-value">${avgSkill}</div>
                    <div class="balance-stat-label">Força Média</div>
                </div>
                <div class="balance-stat">
                    <div class="balance-stat-value">${skillDifference}</div>
                    <div class="balance-stat-label">Diferença de Força</div>
                </div>
                <div class="balance-stat">
                    <div class="balance-stat-value">${this.teams.length}</div>
                    <div class="balance-stat-label">Times Criados</div>
                </div>
                <div class="balance-stat">
                    <div class="balance-stat-value">${this.teams[0]?.players.length || 0}</div>
                    <div class="balance-stat-label">Jogadores por Time</div>
                </div>
            </div>
        `;
    }

    clearAll() {
        if (this.players.length === 0) return;
        
        if (confirm('Tem certeza que deseja limpar todos os jogadores?')) {
            this.players = [];
            this.teams = [];
            this.elements.resultsSection.style.display = 'none';
            this.saveDataToLocalStorage();  // Salvar os dados no localStorage
            this.updateUI();
        }
    }
}

// Inicializar aplicação quando a página carregar
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TeamDrawApp();
});
