
import './DashboardScreen.css';

const monthlyData = [
  { month: 'Jun', created: 85, completed: 58 },
  { month: 'Jul', created: 110, completed: 78 },
  { month: 'Ago', created: 125, completed: 92 },
  { month: 'Set', created: 150, completed: 108 },
  { month: 'Out', created: 185, completed: 142 },
  { month: 'Nov', created: 220, completed: 175 },
];

const categories = [
  { name: 'Estudos', value: 320, color: '#6B91C8' },
  { name: 'Hidratação', value: 285, color: '#73B9DD' },
  { name: 'Sono', value: 240, color: '#AA8BC7' },
  { name: 'Atividade física', value: 198, color: '#75A98A' },
  { name: 'Outros', value: 241, color: '#D8B477' },
];

const wellbeing = [
  { name: 'Hidratação', value: 2150, percentage: 86, color: '#75BDF8', icon: '💧' },
  { name: 'Sono', value: 1680, percentage: 67, color: '#B38BCB', icon: '🌙' },
  { name: 'Humor', value: 1840, percentage: 74, color: '#E6B85C', icon: '😊' },
];

const status = [
  { name: 'Concluídos', value: 876, color: '#65A889' },
  { name: 'Em andamento', value: 251, color: '#E9B85D' },
  { name: 'Não iniciados', value: 157, color: '#A7B8C9' },
];

const cards = [
  {
    title: 'Estudantes ativos',
    value: '248',
    detail: '+12,5% neste mês',
    icon: '👥',
    color: 'blue',
  },
  {
    title: 'Grupos cadastrados',
    value: '12',
    detail: '4 novos grupos',
    icon: '🏫',
    color: 'purple',
  },
  {
    title: 'Indicadores criados',
    value: '1.284',
    detail: '+18,3% neste mês',
    icon: '🎯',
    color: 'orange',
  },
  {
    title: 'Indicadores completos',
    value: '876',
    detail: '68,2% de conclusão',
    icon: '✓',
    color: 'green',
  },
  {
    title: 'Atividades concluídas',
    value: '2.450',
    detail: '+15,2% neste mês',
    icon: '📋',
    color: 'blue',
  },
  {
    title: 'Registros de bem-estar',
    value: '5.670',
    detail: 'Registros realizados',
    icon: '💚',
    color: 'pink',
  },
];

export default function DashboardScreen() {
  const totalIndicators = status.reduce(
    (total, item) => total + item.value,
    0
  );

  const maxMonthly = Math.max(
    ...monthlyData.map((item) => item.created)
  );

  return (
    <div className="dashboard-screen">

      {/* CABEÇALHO */}
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">PAINEL ADMINISTRATIVO</span>
          <h1>Visão geral</h1>
          <p>
            Acompanhe o bem-estar dos estudantes e as atividades da escola.
          </p>
        </div>

        <span className="dashboard-period">
          <span>●</span> Dados demonstrativos
        </span>
      </div>

      {/* CARDS */}
      <section className="dashboard-cards">
        {cards.map((card) => (
          <div className="dashboard-card" key={card.title}>
            <div className="dashboard-card-top">
              <span>{card.title}</span>
             
            </div>

            <strong>{card.value}</strong>

            <small>{card.detail}</small>
          </div>
        ))}
      </section>

      {/* EVOLUÇÃO DOS INDICADORES */}
      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Evolução dos indicadores</h2>
            <p>Indicadores criados e concluídos nos últimos meses.</p>
          </div>

          <div className="dashboard-chart-legend">
            <span><i className="legend-created" /> Criados</span>
            <span><i className="legend-completed" /> Concluídos</span>
          </div>
        </div>

        <div className="dashboard-monthly-chart">
          <div className="chart-y-labels">
            <span>250</span>
            <span>200</span>
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>

          <div className="chart-bars-area">
            <div className="chart-grid-lines">
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <span key={line} />
              ))}
            </div>

            <div className="chart-columns">
              {monthlyData.map((item) => (
                <div className="chart-month" key={item.month}>
                  <div className="chart-bar-pair">
                    <div
                      className="chart-bar created"
                      style={{ height: `${(item.created / maxMonthly) * 100}%` }}
                      title={`${item.created} criados`}
                    />
                    <div
                      className="chart-bar completed"
                      style={{ height: `${(item.completed / maxMonthly) * 100}%` }}
                      title={`${item.completed} concluídos`}
                    />
                  </div>
                  <span>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GRÁFICOS */}
      <section className="dashboard-graphs-grid">

        {/* STATUS */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Status dos indicadores</h2>
              <p>Distribuição dos indicadores cadastrados.</p>
            </div>
          </div>

          <div className="dashboard-status-content">
            <div
              className="dashboard-donut"
              style={{
                background: `conic-gradient(
                  ${status[0].color} 0% 68.2%,
                  ${status[1].color} 68.2% 87.7%,
                  ${status[2].color} 87.7% 100%
                )`,
              }}
            >
              <div className="dashboard-donut-center">
                <strong>{totalIndicators.toLocaleString('pt-BR')}</strong>
                <span>Indicadores</span>
              </div>
            </div>

            <div className="dashboard-status-legend">
              {status.map((item) => (
                <div className="dashboard-status-item" key={item.name}>
                  <div>
                    <i style={{ background: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* CATEGORIAS */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Indicadores por categoria</h2>
              <p>Áreas mais acompanhadas pelos estudantes.</p>
            </div>
          </div>

          <div className="dashboard-category-list">
            {categories.map((category) => (
              <div className="dashboard-category" key={category.name}>
                <div className="dashboard-category-info">
                  <span>{category.name}</span>
                  <strong>{category.value}</strong>
                </div>

                <div className="dashboard-progress">
                  <span
                    style={{
                      width: `${(category.value / 320) * 100}%`,
                      background: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* BEM-ESTAR */}
      <section className="dashboard-panel dashboard-wellbeing">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Panorama do bem-estar</h2>
            <p>Quantidade de registros realizados pelos estudantes.</p>
          </div>
        </div>

        <div className="dashboard-wellbeing-grid">
          {wellbeing.map((item) => (
            <div className="dashboard-wellbeing-card" key={item.name}>
              <div className="dashboard-wellbeing-title">
                <span className="wellbeing-emoji">{item.icon}</span>
                <span>{item.name}</span>
              </div>

              <strong>{item.value.toLocaleString('pt-BR')}</strong>

              <div className="dashboard-progress">
                <span
                  style={{
                    width: `${item.percentage}%`,
                    background: item.color,
                  }}
                />
              </div>

              <small>{item.percentage}% do volume de referência</small>
            </div>
          ))}
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="dashboard-footer">
        <span>WHAT IF APP · Painel administrativo</span>
      </footer>
    </div>
  );
}
