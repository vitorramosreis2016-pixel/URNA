const TOPICS = {
  "Educação e saúde": [
    "ampliar o acesso aos serviços públicos e avaliar resultados com transparência",
    "priorizar a qualidade do atendimento e a formação de profissionais"
  ],
  "Emprego e economia": [
    "apoiar pequenos negócios, qualificação profissional e geração de oportunidades",
    "planejar a economia com responsabilidade nos gastos e incentivo à inovação"
  ],
  "Segurança pública": [
    "integrar serviços e desenvolver políticas baseadas em evidências",
    "investir em prevenção e cooperação entre instituições"
  ],
  "Infraestrutura e transporte": [
    "priorizar manutenção, acessibilidade e transporte eficiente",
    "planejar obras com metas públicas e participação comunitária"
  ],
  "Meio ambiente": [
    "proteger áreas verdes e aprimorar a gestão de resíduos",
    "investir em prevenção de riscos ambientais"
  ]
};

export function debateArgument(topic, random = Math.random) {
  const options = TOPICS[topic] || TOPICS["Educação e saúde"];
  return options[Math.floor(random() * options.length)];
}

export function debateParticipants(candidates, office, region) {
  return candidates.filter(candidate =>
    candidate.office === office &&
    (office === "president" || candidate.region.toLowerCase() === region.toLowerCase())
  );
}
