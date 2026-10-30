# URNA — Simulador Eleitoral

Jogo de simulação eleitoral fictícia. O jogador configura disputas, cria partidos e candidatos, acompanha debates e observa uma apuração simulada.

## Cargos previstos na arquitetura
- Presidente (nacional)
- Governador, senador, deputado federal e deputado estadual (estadual)
- Prefeito e vereador (municipal)

## Executar
Abra a pasta do projeto em um servidor local (módulos ES precisam de origem HTTP):
```bash
python3 -m http.server 8000
```
Acesse http://localhost:8000.

## Estrutura modular
- `main.js`: interface e coordenação do jogo existente.
- `election.js`: configuração eleitoral, distribuição de votos e elegibilidade de segundo turno.
- `parties.js`: criação e remoção segura de partidos.
- `candidates.js`: cargos e cadastro/consulta de candidaturas.
- `debates.js`: argumentos e seleção de participantes de debates.
- `apuration.js`: distribuição de lotes e cálculo de percentuais.
- `governors.js`: disputas estaduais.
- `mayors.js`: disputas municipais.
- `legislature.js`: cargos legislativos e distribuição inicial de cadeiras.
- `campaign.js`: efeitos de ações de campanha.

## Estado atual
A interface original foi preservada e o projeto recebeu a primeira camada de lógica modular. Os módulos de cargos estaduais/municipais e legislativos estão preparados como base de domínio; a próxima etapa é conectar os formulários da interface a esses módulos para cadastrar candidaturas por cargo e apurar cada disputa separadamente.

Todos os resultados são aleatórios e fictícios. Não representam pesquisas, previsões ou resultados eleitorais reais.
