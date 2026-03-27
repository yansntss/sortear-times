class TeamDrawApp {
    constructor() {
        this.players = [];
        this.arrivals = [];
        this.availablePeople = [
            'Yan', 'Eduardo Aragão', 'TH', 'Jhon Luxuria', 'Jeferson',
            'Bebê', 'kaik', 'João grandão', 'Patryck', 'Izaque',
            'Thiago S', 'tedy', 'wil', 'Kauan', 'Diogo',
            'João ferreira', 'Gabriel Jesus', 'Danilo souza', 'iago', 'Rubão',
            'Robson', 'Hellio', 'kaick', 'leonny'
        ];
        this.teams = [];
        this.loadDataFromLocalStorage();
        this.initializeEventListeners();
        this.updateUI();
        this.populatePlayerSelect();
    }

    loadDataFromLocalStorage() {
        // Tentar carregar os jogadores, times, chegadas e pessoas do localStorage
        const savedPlayers = localStorage.getItem('players');
        const savedTeams = localStorage.getItem('teams');
        const savedArrivals = localStorage.getItem('arrivals');
        const savedPeople = localStorage.getItem('availablePeople');

        if (savedPlayers) {
            this.players = JSON.parse(savedPlayers);
        }

        if (savedTeams) {
            this.teams = JSON.parse(savedTeams);
        }

        if (savedArrivals) {
            this.arrivals = JSON.parse(savedArrivals);
        }

        if (savedPeople) {
            this.availablePeople = JSON.parse(savedPeople);
        }
    }

    saveDataToLocalStorage() {
        // Salvar os jogadores, times, chegadas e pessoas no localStorage
        localStorage.setItem('players', JSON.stringify(this.players));
        localStorage.setItem('teams', JSON.stringify(this.teams));
        localStorage.setItem('arrivals', JSON.stringify(this.arrivals));
        localStorage.setItem('availablePeople', JSON.stringify(this.availablePeople));
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
            balanceInfo: document.getElementById('balanceInfo'),
            playerSelect: document.getElementById('playerSelect'),
            arrivalBtn: document.getElementById('arrivalBtn'),
            clearArrivalsBtn: document.getElementById('clearArrivals'),
            arrivalsList: document.getElementById('arrivalsList'),
            arrivalCount: document.getElementById('arrivalCount'),
            newPersonName: document.getElementById('newPersonName'),
            addPersonBtn: document.getElementById('addPersonBtn'),
            peopleListContainer: document.getElementById('peopleListContainer'),
            peopleCount: document.getElementById('peopleCount')
        };

        // Event listeners
        this.elements.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.elements.drawTeamsBtn.addEventListener('click', () => this.drawTeams());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.elements.arrivalBtn.addEventListener('click', () => this.registerArrival());
        this.elements.clearArrivalsBtn.addEventListener('click', () => this.clearArrivals());
        this.elements.addPersonBtn.addEventListener('click', () => this.addPerson());

        // Enter key para adicionar pessoa
        this.elements.newPersonName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPerson();
        });

        // Atualizar botão de sorteio quando configurações mudarem
        this.elements.numTeams.addEventListener('change', () => this.updateDrawButton());
        this.elements.playersPerTeam.addEventListener('change', () => this.updateDrawButton());
    }

    populatePlayerSelect() {
        const select = this.elements.playerSelect;
        select.innerHTML = '<option value="">-- Escolha uma pessoa --</option>';
        
        const arrivedPeople = new Set(this.arrivals.map(a => a.name));
        
        const availableOptions = this.availablePeople.filter(person => !arrivedPeople.has(person));
        availableOptions.sort((a, b) => a.localeCompare(b, 'pt-BR'));
        availableOptions.forEach(person => {
            const option = document.createElement('option');
            option.value = person;
            option.textContent = person;
            select.appendChild(option);
        });
    }

    registerArrival() {
        const selectedPerson = this.elements.playerSelect.value;

        if (!selectedPerson) {
            alert('Por favor, selecione uma pessoa!');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });

        const arrival = {
            id: Date.now(),
            name: selectedPerson,
            time: timeString,
            timestamp: now.getTime()
        };

        this.arrivals.push(arrival);
        this.arrivals.sort((a, b) => a.timestamp - b.timestamp);
        
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updateArrivalsList();
        this.elements.playerSelect.value = '';
    }

    updateArrivalsList() {
        const container = this.elements.arrivalsList;
        container.innerHTML = '';
        this.elements.arrivalCount.textContent = this.arrivals.length;

        this.arrivals.forEach((arrival, index) => {
            const arrivalCard = document.createElement('div');
            arrivalCard.className = 'arrival-card';
            
            arrivalCard.innerHTML = `
                <div class="arrival-position">${index + 1}º</div>
                <div class="arrival-info">
                    <div class="arrival-name">${arrival.name}</div>
                    <div class="arrival-time">⏰ ${arrival.time}</div>
                </div>
                <button class="remove-arrival" onclick="app.removeArrival(${arrival.id})">×</button>
            `;

            container.appendChild(arrivalCard);
        });

        // Sincronizar lista de adicionar jogador com a ordem de chegada atual
        this.updateArrivedPlayersSelect();

        // Atualizar botão de sorteio quando chegadas mudam
        this.updateDrawButton();
    }

    removeArrival(arrivalId) {
        this.arrivals = this.arrivals.filter(arrival => arrival.id !== arrivalId);
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updateArrivalsList();
    }

    clearArrivals() {
        if (this.arrivals.length === 0) return;
        
        if (confirm('Tem certeza que deseja limpar a lista de chegadas?')) {
            this.arrivals = [];
            this.saveDataToLocalStorage();
            this.populatePlayerSelect();
            this.updateArrivalsList();
        }
    }

    addPerson() {
        const name = this.elements.newPersonName.value.trim();

        if (!name) {
            alert('Por favor, digite o nome da pessoa!');
            return;
        }

        // Verificar se a pessoa já existe
        if (this.availablePeople.some(person => person.toLowerCase() === name.toLowerCase())) {
            alert('Esta pessoa já foi cadastrada!');
            return;
        }

        this.availablePeople.push(name);
        this.elements.newPersonName.value = '';
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updatePeopleList();
        this.elements.newPersonName.focus();
    }

    removePerson(personName) {
        this.availablePeople = this.availablePeople.filter(person => person !== personName);
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updatePeopleList();
    }

    updatePeopleList() {
        const container = this.elements.peopleListContainer;
        container.innerHTML = '';
        this.elements.peopleCount.textContent = this.availablePeople.length;

        this.availablePeople.forEach(person => {
            const chip = document.createElement('div');
            chip.className = 'person-chip';
            chip.innerHTML = `
                <span>${person}</span>
                <button class="remove-person" onclick="app.removePerson('${person.replace(/'/g, "\\'")}')">×</button>
            `;
            container.appendChild(chip);
        });
    }

    updateArrivedPlayersSelect() {
        const select = this.elements.playerName;
        if (!select) return;

        select.innerHTML = '<option value="">-- Selecione quem chegou --</option>';

        const alreadyAdded = new Set(this.players.map(player => player.name.toLowerCase()));
        const arrivalOrder = [...this.arrivals].sort((a, b) => a.timestamp - b.timestamp);

        arrivalOrder.forEach(arrival => {
            if (alreadyAdded.has(arrival.name.toLowerCase())) return;

            const option = document.createElement('option');
            option.value = arrival.name;
            option.textContent = arrival.name;
            select.appendChild(option);
        });
    }

    addPlayer() {
        const name = this.elements.playerName.value.trim();
        const skill = parseInt(this.elements.playerSkill.value);
        const position = this.elements.playerPosition.value;

        if (!name) {
            alert('Selecione uma pessoa que chegou!');
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
    }

    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
        this.saveDataToLocalStorage();  // Salvar os dados no localStorage
        this.updateUI();
    }

    updateUI() {
        this.updatePlayersList();
        this.updatePlayerCount();
        this.updateArrivalsList();
        this.updatePeopleList();
        this.updateArrivedPlayersSelect();
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
                'ala-esquerda': 'ala-esquerda',
                'ala-direita': 'ala-direita'
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
        
        // Verificar se pode sortear todos
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
            positions: { pivo: 0, fixo: 0, meio: 0, ala_esquerda: 0 ,ala_direita: 0 }
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
            'ala-esquerda': availablePlayers.filter(p => p.position === 'ala-esquerda'),
            'ala-direita': availablePlayers.filter(p => p.position === 'ala-direita')
        };

        // Ordenar cada posição por habilidade (decrescente)
        Object.keys(playersByPosition).forEach(position => {
            playersByPosition[position].sort((a, b) => b.skill - a.skill);
        });

        // Distribuir jogadores por posição de forma balanceada
        const positions = ['pivo', 'fixo', 'meio', 'ala-esquerda', 'ala-direita'];
        
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

        // Regra especial: Yan e Jhon Luxuria nao podem ficar no mesmo time.
        this.enforceSeparatedPlayersRule('Yan', 'Jhon Luxuria');
    }

    enforceSeparatedPlayersRule(nameA, nameB) {
        const normalize = (name) => name.trim().toLowerCase();
        const normalizedA = normalize(nameA);
        const normalizedB = normalize(nameB);

        const teamWithA = this.teams.find(team =>
            team.players.some(player => normalize(player.name) === normalizedA)
        );
        const teamWithB = this.teams.find(team =>
            team.players.some(player => normalize(player.name) === normalizedB)
        );

        if (!teamWithA || !teamWithB || teamWithA.id !== teamWithB.id) {
            return;
        }

        const sharedTeam = teamWithA;
        const playerToMove = sharedTeam.players.find(player => normalize(player.name) === normalizedB)
            || sharedTeam.players.find(player => normalize(player.name) === normalizedA);

        if (!playerToMove) {
            return;
        }

        const candidateSwaps = [];

        this.teams
            .filter(team => team.id !== sharedTeam.id)
            .forEach(team => {
                team.players.forEach(player => {
                    const diff = Math.abs(player.skill - playerToMove.skill);
                    const samePosition = player.position === playerToMove.position;

                    candidateSwaps.push({
                        team,
                        player,
                        samePosition,
                        skillDiff: diff
                    });
                });
            });

        if (candidateSwaps.length === 0) {
            return;
        }

        candidateSwaps.sort((a, b) => {
            if (a.samePosition !== b.samePosition) {
                return a.samePosition ? -1 : 1;
            }

            return a.skillDiff - b.skillDiff;
        });

        const bestSwap = candidateSwaps[0];
        const targetTeam = bestSwap.team;
        const targetPlayer = bestSwap.player;

        const sharedIndex = sharedTeam.players.findIndex(player => player.id === playerToMove.id);
        const targetIndex = targetTeam.players.findIndex(player => player.id === targetPlayer.id);

        if (sharedIndex === -1 || targetIndex === -1) {
            return;
        }

        sharedTeam.players[sharedIndex] = targetPlayer;
        targetTeam.players[targetIndex] = playerToMove;

        sharedTeam.totalSkill = sharedTeam.totalSkill - playerToMove.skill + targetPlayer.skill;
        targetTeam.totalSkill = targetTeam.totalSkill - targetPlayer.skill + playerToMove.skill;

        if (!bestSwap.samePosition) {
            this.adjustTeamPositionCount(sharedTeam, playerToMove.position, -1);
            this.adjustTeamPositionCount(sharedTeam, targetPlayer.position, 1);
            this.adjustTeamPositionCount(targetTeam, targetPlayer.position, -1);
            this.adjustTeamPositionCount(targetTeam, playerToMove.position, 1);
        }
    }

    adjustTeamPositionCount(team, position, delta) {
        const underscored = position.replace('-', '_');

        team.positions[position] = (team.positions[position] || 0) + delta;

        if (underscored !== position) {
            team.positions[underscored] = (team.positions[underscored] || 0) + delta;
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
                'ala-esquerda': 'Ala Esquerda',
                'ala-direita': 'Ala Direita'
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
        const positions = ['pivo', 'fixo', 'meio', 'ala_esquerda', 'ala_direita'];
        
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
        if (this.players.length === 0 && this.arrivals.length === 0) return;
        
        if (confirm('Tem certeza que deseja limpar tudo (jogadores e chegadas)?')) {
            this.players = [];
            this.arrivals = [];
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
