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
        ].map(name => this.normalizePersonRecord(name));
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

        this.availablePeople = this.availablePeople
            .map(person => this.normalizePersonRecord(person))
            .filter(person => person.name);

        this.players = this.players.map(player => {
            const parsedSkill = parseInt(player.skill, 10);
            const skill = Number.isNaN(parsedSkill) ? null : parsedSkill;

            return {
                ...player,
                skill,
                position: this.normalizePosition(player.position)
            };
        });
    }

    saveDataToLocalStorage() {
        // Salvar os jogadores, times, chegadas e pessoas no localStorage
        localStorage.setItem('players', JSON.stringify(this.players));
        localStorage.setItem('teams', JSON.stringify(this.teams));
        localStorage.setItem('arrivals', JSON.stringify(this.arrivals));
        localStorage.setItem('availablePeople', JSON.stringify(this.availablePeople));
    }

    normalizePersonRecord(person) {
        if (typeof person === 'string') {
            return { name: person, skill: null, position: null };
        }

        if (!person || typeof person !== 'object') {
            return { name: '', skill: null, position: null };
        }

        const parsedSkill = parseInt(person.skill, 10);
        const skill = Number.isNaN(parsedSkill) ? null : parsedSkill;

        return {
            name: (person.name || '').trim(),
            skill,
            position: this.normalizePosition(person.position)
        };
    }

    normalizePosition(position) {
        if (!position) return null;

        const normalized = String(position).trim().toLowerCase();
        const mapping = {
            zag: 'zag',
            mei: 'mei',
            atc: 'atc',
            fixo: 'zag',
            meio: 'mei',
            pivo: 'atc',
            'ala-esquerda': 'atc',
            'ala-direita': 'atc',
            'ala esquerda': 'atc',
            'ala direita': 'atc'
        };

        return mapping[normalized] || null;
    }

    findPersonByName(name) {
        const target = (name || '').trim().toLowerCase();
        if (!target) return null;

        return this.availablePeople.find(person => person.name.toLowerCase() === target) || null;
    }

    initializeEventListeners() {
        // Elementos do DOM
        this.elements = {
            playerName: document.getElementById('playerName'),
            playerSkill: document.getElementById('playerSkill'),
            playerPosition: document.getElementById('playerPosition'),
            ignoreArrivalOrder: document.getElementById('ignoreArrivalOrder'),
            addPlayerBtn: document.getElementById('addPlayer'),
            addAllAndDrawBtn: document.getElementById('addAllAndDraw'),
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
            newPersonSkill: document.getElementById('newPersonSkill'),
            newPersonPosition: document.getElementById('newPersonPosition'),
            addPersonBtn: document.getElementById('addPersonBtn'),
            bulkListType: document.getElementById('bulkListType'),
            bulkPeopleInput: document.getElementById('bulkPeopleInput'),
            addPeopleBulkBtn: document.getElementById('addPeopleBulkBtn'),
            clearPeopleBtn: document.getElementById('clearPeople'),
            peopleListContainer: document.getElementById('peopleListContainer'),
            peopleCount: document.getElementById('peopleCount')
        };

        // Event listeners
        this.elements.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.elements.addAllAndDrawBtn.addEventListener('click', () => this.addAllAndDraw());
        this.elements.drawTeamsBtn.addEventListener('click', () => this.drawTeams());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.elements.arrivalBtn.addEventListener('click', () => this.registerArrival());
        this.elements.clearArrivalsBtn.addEventListener('click', () => this.clearArrivals());
        this.elements.addPersonBtn.addEventListener('click', () => this.addPerson());
        this.elements.addPeopleBulkBtn.addEventListener('click', () => this.addPeopleFromBulk());
        this.elements.clearPeopleBtn.addEventListener('click', () => this.clearPeople());
        this.elements.ignoreArrivalOrder.addEventListener('change', () => this.updateArrivedPlayersSelect());
        this.elements.bulkListType.addEventListener('change', () => this.updateBulkInputHint());

        // Enter key para adicionar pessoa
        this.elements.newPersonName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPerson();
        });

        // Atualizar botão de sorteio quando configurações mudarem
        this.elements.numTeams.addEventListener('change', () => this.updateDrawButton());
        this.elements.playersPerTeam.addEventListener('change', () => this.updateDrawButton());

        this.updateBulkInputHint();
    }

    updateBulkInputHint() {
        const type = this.elements.bulkListType.value;
        const placeholderByType = {
            'name-only': 'William\nJohn\nIago',
            'name-skill-position': 'William-2-zag\nJohn-3-atc\nIago-1-mei',
            'name-position': 'William-zag\nJohn-atc\nIago-mei'
        };

        this.elements.bulkPeopleInput.placeholder = placeholderByType[type] || placeholderByType['name-skill-position'];
    }

    populatePlayerSelect() {
        const select = this.elements.playerSelect;
        select.innerHTML = '<option value="">-- Escolha uma pessoa --</option>';
        
        const arrivedPeople = new Set(this.arrivals.map(a => a.name.toLowerCase()));
        
        const availableOptions = this.availablePeople
            .filter(person => !arrivedPeople.has(person.name.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        availableOptions.forEach(person => {
            const option = document.createElement('option');
            option.value = person.name;
            option.textContent = person.name;
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
        const parsedSkill = parseInt(this.elements.newPersonSkill.value, 10);
        const skill = Number.isNaN(parsedSkill) ? null : parsedSkill;
        const position = this.normalizePosition(this.elements.newPersonPosition.value);

        if (!name) {
            alert('Por favor, digite o nome da pessoa!');
            return;
        }

        // Verificar se a pessoa já existe
        if (this.availablePeople.some(person => person.name.toLowerCase() === name.toLowerCase())) {
            alert('Esta pessoa já foi cadastrada!');
            return;
        }

        this.availablePeople.push({ name, skill, position });
        this.elements.newPersonName.value = '';
        this.elements.newPersonSkill.value = '';
        this.elements.newPersonPosition.value = '';
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updatePeopleList();
        this.elements.newPersonName.focus();
    }

    parseBulkPersonEntry(rawLine, listType) {
        if (!rawLine) return null;

        const cleaned = rawLine
            .replace(/^\uFEFF/, '')
            .replace(/^[\u200B\u200C\u200D\u2060]+/, '')
            .replace(/^\s*\d+\s*[.)\-:]?\s*/, '')
            .replace(/^\s*[-*•]+\s*/, '')
            .replace(/\s*\([^)]*\)\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleaned) return null;

        const tokens = cleaned.split(/\s*-\s*/).map(token => token.trim()).filter(Boolean);

        if (listType === 'name-only') {
            return {
                name: cleaned,
                skill: null,
                position: null
            };
        }

        if (listType === 'name-skill-position' && tokens.length >= 3) {
            const rawLevel = tokens[tokens.length - 2];
            const rawPosition = tokens[tokens.length - 1];
            const name = tokens.slice(0, -2).join(' - ').trim();
            const parsedLevel = parseInt(rawLevel, 10);

            return {
                name,
                skill: [1, 2, 3].includes(parsedLevel) ? parsedLevel : null,
                position: this.normalizePosition(rawPosition)
            };
        }

        if (listType === 'name-position' && tokens.length >= 2) {
            const rawPosition = tokens[tokens.length - 1];
            const name = tokens.slice(0, -1).join(' - ').trim();

            return {
                name,
                skill: null,
                position: this.normalizePosition(rawPosition)
            };
        }

        return {
            name: cleaned,
            skill: null,
            position: null
        };
    }

    addPeopleFromBulk() {
        const rawInput = this.elements.bulkPeopleInput.value;
        const listType = this.elements.bulkListType.value;

        if (!rawInput || !rawInput.trim()) {
            alert('Cole uma lista com os nomes para adicionar!');
            return;
        }

        const entries = rawInput
            .split(/\r?\n/)
            .map(line => this.parseBulkPersonEntry(line, listType))
            .filter(entry => entry && entry.name);

        if (entries.length === 0) {
            alert('Nao foi encontrado nenhum nome valido na lista.');
            return;
        }

        const defaultSkillParsed = parseInt(this.elements.newPersonSkill.value, 10);
        const defaultSkill = Number.isNaN(defaultSkillParsed) ? null : defaultSkillParsed;
        const defaultPosition = this.normalizePosition(this.elements.newPersonPosition.value);
        const existingNames = new Set(this.availablePeople.map(person => person.name.toLowerCase()));
        const seenInBatch = new Set();
        let addedCount = 0;
        let duplicateCount = 0;

        entries.forEach(entry => {
            const key = entry.name.toLowerCase();

            if (existingNames.has(key) || seenInBatch.has(key)) {
                duplicateCount++;
                return;
            }

            this.availablePeople.push({
                name: entry.name,
                skill: entry.skill ?? defaultSkill,
                position: entry.position ?? defaultPosition
            });
            seenInBatch.add(key);
            existingNames.add(key);
            addedCount++;
        });

        if (addedCount === 0) {
            alert('Nenhum novo participante foi adicionado (todos ja existiam).');
            return;
        }

        this.elements.bulkPeopleInput.value = '';
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updatePeopleList();

        const duplicateMsg = duplicateCount > 0
            ? `\n${duplicateCount} nome(s) ignorado(s) por duplicidade.`
            : '';
        alert(`${addedCount} participante(s) adicionado(s) com sucesso!${duplicateMsg}`);
    }

    removePerson(personName) {
        const normalized = personName.toLowerCase();
        this.availablePeople = this.availablePeople.filter(person => person.name.toLowerCase() !== normalized);
        this.saveDataToLocalStorage();
        this.populatePlayerSelect();
        this.updatePeopleList();
    }

    clearPeople() {
        if (this.availablePeople.length === 0) return;

        if (confirm('Tem certeza que deseja limpar todos os participantes cadastrados?')) {
            this.availablePeople = [];
            this.saveDataToLocalStorage();
            this.populatePlayerSelect();
            this.updatePeopleList();
        }
    }

    updatePeopleList() {
        const container = this.elements.peopleListContainer;
        container.innerHTML = '';
        this.elements.peopleCount.textContent = this.availablePeople.length;

        this.availablePeople.forEach(person => {
            const chip = document.createElement('div');
            chip.className = 'person-chip';
            const skillLabel = this.getSkillValue(person.skill) > 0 ? `${'⭐'.repeat(this.getSkillValue(person.skill))}` : 'Sem nível';
            const positionNames = {
                zag: 'zag',
                mei: 'mei',
                atc: 'atc'
            };
            const positionLabel = positionNames[person.position] || 'Sem habilidade';
            chip.innerHTML = `
                <span>${person.name}</span>
                <small>(${skillLabel} | ${positionLabel})</small>
                <button class="remove-person" onclick="app.removePerson('${person.name.replace(/'/g, "\\'")}')">×</button>
            `;
            container.appendChild(chip);
        });
    }

    updateArrivedPlayersSelect() {
        const select = this.elements.playerName;
        if (!select) return;
        const ignoreArrivalOrder = this.elements.ignoreArrivalOrder?.checked;
        const defaultText = ignoreArrivalOrder
            ? '-- Selecione um participante cadastrado --'
            : '-- Selecione quem chegou --';

        select.innerHTML = `<option value="">${defaultText}</option>`;

        const alreadyAdded = new Set(this.players.map(player => player.name.toLowerCase()));
        const availableNames = ignoreArrivalOrder
            ? [...this.availablePeople].map(person => person.name).sort((a, b) => a.localeCompare(b, 'pt-BR'))
            : [...this.arrivals]
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(arrival => arrival.name);

        availableNames.forEach(name => {
            if (alreadyAdded.has(name.toLowerCase())) return;

            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }

    addPlayer() {
        const name = this.elements.playerName.value.trim();
        const parsedSkill = parseInt(this.elements.playerSkill.value, 10);
        const participant = this.findPersonByName(name);
        const skill = Number.isNaN(parsedSkill) ? (participant?.skill ?? null) : parsedSkill;
        const position = this.normalizePosition(this.elements.playerPosition.value) || (participant?.position ?? null);

        if (!name) {
            const msg = this.elements.ignoreArrivalOrder?.checked
                ? 'Selecione um participante cadastrado!'
                : 'Selecione uma pessoa que chegou!';
            alert(msg);
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
        this.elements.playerSkill.value = '';
        this.elements.playerPosition.value = '';
        this.saveDataToLocalStorage();  // Salvar os dados no localStorage
        this.updateUI();
    }

    addAllAndDraw() {
        const alreadyAdded = new Set(this.players.map(player => player.name.toLowerCase()));
        const ignoreArrivalOrder = this.elements.ignoreArrivalOrder?.checked;
        const pendingPeople = ignoreArrivalOrder
            ? [...this.availablePeople]
                .map(person => person.name)
                .sort((a, b) => a.localeCompare(b, 'pt-BR'))
                .filter(name => !alreadyAdded.has(name.toLowerCase()))
            : [...this.arrivals]
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(arrival => arrival.name)
                .filter(name => !alreadyAdded.has(name.toLowerCase()));

        if (pendingPeople.length === 0) {
            const msg = ignoreArrivalOrder
                ? 'Nao ha participantes cadastrados pendentes para adicionar.'
                : 'Nao ha jogadores pendentes para adicionar.';
            alert(msg);
            return;
        }

        const nowBase = Date.now();
        pendingPeople.forEach((name, index) => {
            const participant = this.findPersonByName(name);
            this.players.push({
                id: nowBase + index,
                name,
                skill: participant?.skill ?? null,
                position: participant?.position ?? null
            });
        });

        this.saveDataToLocalStorage();
        this.updateUI();

        const numTeams = parseInt(this.elements.numTeams.value, 10);
        const playersPerTeam = parseInt(this.elements.playersPerTeam.value, 10);
        const requiredPlayers = numTeams * playersPerTeam;

        if (this.players.length >= requiredPlayers) {
            this.drawTeams();
            alert(`${pendingPeople.length} jogador(es) adicionado(s) e sorteio realizado!`);
            return;
        }

        alert(`${pendingPeople.length} jogador(es) adicionado(s). Faltam ${requiredPlayers - this.players.length} para sortear.`);
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
            
            const skillValue = this.getSkillValue(player.skill);
            const stars = skillValue > 0 ? '⭐'.repeat(skillValue) : 'Sem habilidade';
            const positionNames = {
                zag: 'zag',
                mei: 'mei',
                atc: 'atc'
            };
            const positionLabel = positionNames[player.position] || 'Sem posição';

            playerCard.innerHTML = `
                <button class="remove-player" onclick="app.removePlayer(${player.id})">×</button>
                <div class="player-name">${player.name}</div>
                <div class="player-details">
                    <span class="player-skill">${stars}</span>
                    <span class="player-position">${positionLabel}</span>
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
            positions: {
                zag: 0,
                mei: 0,
                atc: 0,
                'sem-posicao': 0,
                sem_posicao: 0
            }
        }));

        // Algoritmo de balanceamento
        this.balanceTeams(availablePlayers, playersPerTeam);
        
        // Exibir resultados
        this.displayResults();
        this.saveDataToLocalStorage();  // Salvar os dados no localStorage
    }

    balanceTeams(availablePlayers, playersPerTeam) {
        const knownPositions = ['zag', 'mei', 'atc'];

        // Separar jogadores por posição
        const playersByPosition = {
            zag: availablePlayers.filter(p => p.position === 'zag'),
            mei: availablePlayers.filter(p => p.position === 'mei'),
            atc: availablePlayers.filter(p => p.position === 'atc'),
            'sem-posicao': availablePlayers.filter(p => !p.position || !knownPositions.includes(p.position))
        };

        // Ordenar cada posição por habilidade (decrescente)
        Object.keys(playersByPosition).forEach(position => {
            playersByPosition[position].sort((a, b) => this.getSkillValue(b.skill) - this.getSkillValue(a.skill));
        });

        // Distribuir jogadores por posição de forma balanceada
        const positions = ['zag', 'mei', 'atc', 'sem-posicao'];
        
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
                    team.totalSkill += this.getSkillValue(player.skill);
                    this.adjustTeamPositionCount(team, player.position || 'sem-posicao', 1);
                }
            }
        }

        // Se ainda restam jogadores, distribuir pelos times com menos jogadores
        const remainingPlayers = Object.values(playersByPosition).flat();
        remainingPlayers.sort((a, b) => this.getSkillValue(b.skill) - this.getSkillValue(a.skill));

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
                teamWithFewestPlayers.totalSkill += this.getSkillValue(player.skill);
                this.adjustTeamPositionCount(teamWithFewestPlayers, player.position || 'sem-posicao', 1);
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
                    const diff = Math.abs(this.getSkillValue(player.skill) - this.getSkillValue(playerToMove.skill));
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

        sharedTeam.totalSkill = sharedTeam.totalSkill - this.getSkillValue(playerToMove.skill) + this.getSkillValue(targetPlayer.skill);
        targetTeam.totalSkill = targetTeam.totalSkill - this.getSkillValue(targetPlayer.skill) + this.getSkillValue(playerToMove.skill);

        if (!bestSwap.samePosition) {
            this.adjustTeamPositionCount(sharedTeam, playerToMove.position || 'sem-posicao', -1);
            this.adjustTeamPositionCount(sharedTeam, targetPlayer.position || 'sem-posicao', 1);
            this.adjustTeamPositionCount(targetTeam, targetPlayer.position || 'sem-posicao', -1);
            this.adjustTeamPositionCount(targetTeam, playerToMove.position || 'sem-posicao', 1);
        }
    }

    getSkillValue(skill) {
        if (typeof skill !== 'number' || Number.isNaN(skill)) return 0;
        return skill;
    }

    adjustTeamPositionCount(team, position, delta) {
        if (!position) return;
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
                zag: 'zag',
                mei: 'mei',
                atc: 'atc'
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
                                <span>${this.getSkillValue(player.skill) > 0 ? '⭐'.repeat(this.getSkillValue(player.skill)) : 'Sem habilidade'}</span>
                                <span>${positionNames[player.position] || 'Sem posição'}</span>
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
        const positions = ['zag', 'mei', 'atc', 'sem_posicao'];
        
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
