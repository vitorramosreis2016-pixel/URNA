(() => {
  "use strict";

  const state = {
    type: "presidencial",
    place: "Brasil",
    year: 2026,
    electorate: 100000,
    turnout: 0.82,
    parties: [
      { id: "preset-pt", name: "Partido dos Trabalhadores", acronym: "PT", color: "#e32636" },
      { id: "preset-pl", name: "Partido Liberal", acronym: "PL", color: "#244a9b" },
      { id: "preset-missao", name: "Missão", acronym: "MISSÃO", color: "#f2c230" },
      { id: "preset-psd", name: "Partido Social Democrático", acronym: "PSD", color: "#168a54" }
    ],
    candidates: [
      { id: "preset-lula", name: "Luiz Inácio Lula da Silva", partyId: "preset-pt", platform: "Educação e saúde" },
      { id: "preset-flavio", name: "Flávio Bolsonaro", partyId: "preset-pl", platform: "Segurança pública" },
      { id: "preset-renan", name: "Renan Santos", partyId: "preset-missao", platform: "Emprego e economia" },
      { id: "preset-caiado", name: "Ronaldo Caiado", partyId: "preset-psd", platform: "Emprego e economia" }
    ],
    countingStarted: false,
    percent: 0,
    votes: {},
    finalVotes: {},
    debateDone: false
  };

  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

  function toast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function showView(id) {
    document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === id));
    document.querySelectorAll(".tab").forEach(el => el.classList.toggle("active", el.dataset.view === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetCounting(silent = true) {
    state.countingStarted = false;
    state.percent = 0;
    state.votes = {};
    state.finalVotes = {};

    if ($("percentCounted")) $("percentCounted").textContent = "0%";
    if ($("progressBar")) $("progressBar").style.width = "0%";
    if ($("startCount")) $("startCount").disabled = false;
    if ($("nextBatch")) $("nextBatch").disabled = true;
    if ($("resetCount")) $("resetCount").disabled = true;
    if ($("countingTitle")) $("countingTitle").textContent = "Aguardando início";
    if ($("countingSubtitle")) $("countingSubtitle").textContent = "Configure a eleição e cadastre candidatos.";
    if ($("resultsList")) $("resultsList").innerHTML = '<p class="empty">A apuração ainda não começou.</p>';
    if (!silent) toast("Apuração reiniciada.");
  }

  // Distribui uma quantidade inteira e garante que a soma seja exatamente total.
  function allocateVotes(total, weights) {
    const safeWeights = weights.map(weight => Math.max(0, Number(weight) || 0));
    const weightSum = safeWeights.reduce((sum, weight) => sum + weight, 0);
    if (total <= 0 || !safeWeights.length) return safeWeights.map(() => 0);

    const quotas = safeWeights.map(weight => weightSum > 0 ? total * weight / weightSum : total / safeWeights.length);
    const allocated = quotas.map(Math.floor);
    let remaining = total - allocated.reduce((sum, votes) => sum + votes, 0);
    const order = quotas.map((quota, index) => ({ index, fraction: quota - allocated[index] }))
      .sort((a, b) => b.fraction - a.fraction);

    for (let i = 0; i < remaining; i++) allocated[order[i % order.length].index]++;
    return allocated;
  }

  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
  document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.goto));
  });

  document.querySelectorAll('input[name="electionType"]').forEach(input => {
    input.addEventListener("change", () => {
      state.type = input.value;
      const choiceRow = document.querySelector(".choice-row");
      if (choiceRow) choiceRow.setAttribute("aria-label", input.value);
    });
  });

  $("saveElection").addEventListener("click", () => {
    const checkedInput = document.querySelector('input[name="electionType"]:checked');
    state.type = checkedInput ? checkedInput.value : "municipal";
    state.place = $("placeName").value.trim() || "Local fictício";
    state.year = Math.min(2100, Math.max(2026, Number($("electionYear").value) || 2028));
    state.electorate = Math.min(10000000, Math.max(1000, Number($("electorate").value) || 100000));
    state.turnout = Math.min(1, Math.max(0, Number($("turnout").value) || 0.82));

    resetCounting(true);
    $("setupMessage").textContent = "Eleição " + (state.type === "municipal" ? "municipal" : "presidencial") +
      " configurada para " + state.place + ", " + state.year + ". Tudo pronto para montar a disputa.";
    $("countingTitle").textContent = "Eleição de " + state.year + " · " + state.place;
    $("countingSubtitle").textContent = state.electorate.toLocaleString("pt-BR") +
      " eleitores cadastrados na simulação.";
    $("turnoutStat").textContent = Math.round(state.turnout * 100) + "%";
    if (state.type === "municipal" && state.year === 2020) {
      $("setupMessage").textContent = "Eleição municipal de 2020 selecionada. As candidaturas reais dependem do município; escolha a cidade e carregue os participantes correspondentes antes de iniciar.";
    } else if (state.type === "presidencial" && state.year === 2026) {
      $("setupMessage").textContent = "Catálogo presidencial de 2026 carregado para simulação. Os nomes pré-cadastrados não significam confirmação de registro oficial no TSE.";
    }
    toast("Configuração salva!");
  });

  $("partyForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("partyName").value.trim();
    const acronym = $("partyAcronym").value.trim().toUpperCase();

    if (!name || !acronym) {
      toast("Preencha o nome e a sigla do partido.");
      return;
    }
    if (state.parties.some(p => p.acronym === acronym)) {
      toast("Essa sigla já está sendo usada.");
      return;
    }

    state.parties.push({
      id: crypto.randomUUID(),
      name,
      acronym,
      color: $("partyColor").value
    });
    $("partyForm").reset();
    $("partyColor").value = "#3978e8";
    renderPeople();
    toast("Partido criado!");
  });

  $("candidateForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("candidateName").value.trim();
    const partyId = $("candidateParty").value;

    if (!partyId) {
      toast("Crie ou selecione um partido primeiro.");
      return;
    }
    if (!name) {
      toast("Digite o nome do candidato.");
      return;
    }
    if (state.candidates.some(c => c.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      toast("Já existe um candidato com esse nome.");
      return;
    }

    state.candidates.push({
      id: crypto.randomUUID(),
      name,
      partyId,
      platform: $("candidatePlatform").value.trim() || "Sem propostas específicas."
    });
    $("candidateName").value = "";
    renderPeople();
    toast("Candidato registrado!");
  });

  function renderPeople() {
    const partySelect = $("candidateParty");
    const previous = partySelect.value;

    partySelect.innerHTML = state.parties.length
      ? state.parties.map(p => '<option value="' + p.id + '">' + escapeHtml(p.acronym) +
          " — " + escapeHtml(p.name) + "</option>").join("")
      : '<option value="">Crie um partido primeiro</option>';

    if (state.parties.some(p => p.id === previous)) partySelect.value = previous;

    $("partyListCount").textContent = state.parties.length;
    $("candidateListCount").textContent = state.candidates.length;
    $("partyCount").textContent = state.parties.length;
    $("candidateCount").textContent = state.candidates.length;

    $("partyList").innerHTML = state.parties.length
      ? state.parties.map(p => '<div class="party-card"><span class="color-dot" style="background:' + p.color +
          '"></span><div class="item-info"><strong>' + escapeHtml(p.acronym) + " · " + escapeHtml(p.name) +
          "</strong><small>" + state.candidates.filter(c => c.partyId === p.id).length +
          ' candidato(s)</small></div><button class="remove-btn" data-remove-party="' + p.id + '">Excluir</button></div>').join("")
      : '<p class="empty">Seus partidos aparecerão aqui.</p>';

    $("candidateList").innerHTML = state.candidates.length
      ? state.candidates.map(c => {
          const party = state.parties.find(p => p.id === c.partyId);
          return '<div class="candidate-card"><span class="color-dot" style="background:' +
            (party ? party.color : "#68758b") + '"></span><div class="item-info"><strong>' +
            escapeHtml(c.name) + "</strong><small>" +
            escapeHtml(party ? party.acronym + " · " + party.name : "Sem partido") +
            " · Proposta: " + escapeHtml(c.platform) +
            '</small></div><button class="remove-btn" data-remove-candidate="' + c.id + '">Excluir</button></div>';
        }).join("")
      : '<p class="empty">Seus candidatos aparecerão aqui.</p>';

    document.querySelectorAll("[data-remove-party]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.removeParty;
        if (state.candidates.some(c => c.partyId === id)) {
          toast("Remova os candidatos desse partido primeiro.");
          return;
        }
        state.parties = state.parties.filter(p => p.id !== id);
        renderPeople();
      });
    });

    document.querySelectorAll("[data-remove-candidate]").forEach(button => {
      button.addEventListener("click", () => {
        state.candidates = state.candidates.filter(c => c.id !== button.dataset.removeCandidate);
        resetCounting(true);
        renderPeople();
      });
    });
  }

  const talkingPoints = {
    "Educação e saúde": [
      "defende ampliar o acesso aos serviços públicos e avaliar resultados com transparência",
      "propõe priorizar a qualidade do atendimento e a formação de profissionais"
    ],
    "Emprego e economia": [
      "prioriza apoiar pequenos negócios, qualificação profissional e geração de oportunidades",
      "defende planejamento econômico, responsabilidade nos gastos e incentivo à inovação"
    ],
    "Segurança pública": [
      "propõe prevenção, integração de serviços e políticas baseadas em evidências",
      "prioriza iluminação, espaços públicos seguros e cooperação entre instituições"
    ],
    "Infraestrutura e transporte": [
      "defende manutenção, acessibilidade e transporte mais eficiente",
      "propõe planejar obras com metas públicas e ouvir as comunidades"
    ],
    "Meio ambiente": [
      "prioriza áreas verdes, prevenção de riscos e gestão responsável de resíduos",
      "defende ações ambientais com acompanhamento de resultados e participação popular"
    ]
  };

  $("runDebate").addEventListener("click", () => {
    if (state.candidates.length < 2) {
      toast("Cadastre pelo menos dois candidatos para o debate.");
      return;
    }

    const topic = $("debateTopic").value;
    const shuffled = [...state.candidates].sort(() => Math.random() - 0.5);
    $("debateResults").innerHTML = shuffled.map((candidate, index) => {
      const party = state.parties.find(p => p.id === candidate.partyId);
      const options = talkingPoints[topic] || talkingPoints["Educação e saúde"];
      const argument = options[Math.floor(Math.random() * options.length)];
      return '<article class="speech"><strong>' + escapeHtml(candidate.name) +
        ' <span style="color:' + (party ? party.color : "#8aa") + '">(' +
        escapeHtml(party ? party.acronym : "IND") + ")</span></strong><p>Sobre " +
        escapeHtml(topic.toLowerCase()) + ", " + argument + ". A proposta de campanha é " +
        escapeHtml(candidate.platform.toLowerCase()) +
        ", com prestação de contas à população.</p></article>";
    }).join("");

    state.debateDone = true;
    toast("Rodada de debate concluída!");
  });

  $("startCount").addEventListener("click", () => {
    if (state.candidates.length < 2) {
      toast("Cadastre pelo menos dois candidatos antes da apuração.");
      showView("people");
      return;
    }

    state.countingStarted = true;
    state.percent = 0;
    const totalVotes = Math.round(state.electorate * state.turnout);
    const weights = state.candidates.map(() => Math.random() + 0.25);
    const allocated = allocateVotes(totalVotes, weights);

    state.finalVotes = {};
    state.votes = {};
    state.candidates.forEach((candidate, index) => {
      state.finalVotes[candidate.id] = allocated[index];
      state.votes[candidate.id] = 0;
    });

    $("startCount").disabled = true;
    $("nextBatch").disabled = false;
    $("resetCount").disabled = false;
    $("countingTitle").textContent = "Apuração em andamento · " + state.place;
    $("countingSubtitle").textContent = "Apuração fictícia iniciada. Avance lote a lote para revelar os votos.";
    $("percentCounted").textContent = "0%";
    $("progressBar").style.width = "0%";
    renderResults();
    toast("Apuração iniciada!");
  });

  $("nextBatch").addEventListener("click", () => {
    if (!state.countingStarted || state.percent >= 100) return;

    const previousPercent = state.percent;
    state.percent = Math.min(100, state.percent + 25);
    const totalVotes = Math.round(state.electorate * state.turnout);
    const previousCounted = Math.round(totalVotes * previousPercent / 100);
    const currentCounted = Math.round(totalVotes * state.percent / 100);
    const batchSize = currentCounted - previousCounted;

    const remainingVotes = state.candidates.map(candidate =>
      Math.max(0, state.finalVotes[candidate.id] - (state.votes[candidate.id] || 0))
    );
    const batchAllocation = allocateVotes(batchSize, remainingVotes);

    state.candidates.forEach((candidate, index) => {
      state.votes[candidate.id] = (state.votes[candidate.id] || 0) + batchAllocation[index];
    });

    $("percentCounted").textContent = state.percent + "%";
    $("progressBar").style.width = state.percent + "%";
    $("countingSubtitle").textContent = currentCounted.toLocaleString("pt-BR") +
      " votos fictícios contabilizados de " + totalVotes.toLocaleString("pt-BR") +
      " votantes estimados.";
    renderResults();

    if (state.percent === 100) {
      $("nextBatch").disabled = true;
      $("countingTitle").textContent = "Apuração finalizada · " + state.place;
      $("countingSubtitle").textContent = "Total apurado: " + totalVotes.toLocaleString("pt-BR") +
        " votos fictícios. Os resultados são exclusivos desta simulação.";
      toast("Apuração fictícia concluída!");
    } else {
      toast("Lote apurado: " + state.percent + "%");
    }
  });

  $("resetCount").addEventListener("click", () => resetCounting(false));

  function renderResults() {
    const results = $("resultsList");
    if (!results) return;

    const counted = Object.values(state.votes).reduce((sum, votes) => sum + votes, 0);
    const sorted = [...state.candidates].sort((a, b) =>
      (state.votes[b.id] || 0) - (state.votes[a.id] || 0)
    );

    results.innerHTML = sorted.map(candidate => {
      const party = state.parties.find(p => p.id === candidate.partyId);
      const votes = state.votes[candidate.id] || 0;
      const share = counted > 0 ? votes / counted * 100 : 0;
      return '<div class="result-card"><div class="result-name">' + escapeHtml(candidate.name) +
        '<small style="display:block;color:#94a6c2;font-weight:400;margin-top:5px">' +
        escapeHtml(party ? party.acronym : "IND") +
        '</small></div><div class="bar"><span style="width:' + Math.min(100, share) +
        '%;background:' + (party ? party.color : "#6da2ff") +
        '"></span></div><div class="result-votes"><strong>' +
        votes.toLocaleString("pt-BR") +
        '</strong><small style="display:block;color:#91a3be;margin-top:4px">' +
        share.toFixed(1).replace(".", ",") + '%</small></div></div>';
    }).join("") || '<p class="empty">Cadastre candidatos para ver a apuração.</p>';
  }

  renderPeople();
})();