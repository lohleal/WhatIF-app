
import { useEffect, useState } from 'react';

import { Chart } from 'react-google-charts';
import { buscarDadosDashboard } from '../services/dashboardService';

import './DashboardScreen.css';

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        setError('');

        const dados = await buscarDadosDashboard();

        setDashboard(dados);
      } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-screen">
        <div className="dashboard-loading">
          Carregando dados do painel administrativo...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-screen">
        <div className="dashboard-error">
          <p>{error}</p>

          <button onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const {
    cards,
    monthlyData,
    categories,
    wellbeing,
    status,
    totalIndicators,
  } = dashboard;



  // Escala das categorias.
  const maxCategory = Math.max(
    1,
    ...categories.map((item) => item.value)
  );

  // Total de indicadores por status.
  const totalStatus = status.reduce(
    (total, item) => total + item.value,
    0
  );

  // Monta o gráfico de rosca usando os valores reais.
  let percentualAcumulado = 0;

  const donutStops = status.map((item) => {
    const percentual = totalStatus > 0
      ? (item.value / totalStatus) * 100
      : 0;

    const inicio = percentualAcumulado;

    percentualAcumulado += percentual;

    return `${item.color} ${inicio}% ${percentualAcumulado}%`;
  });

  const donutBackground = totalStatus > 0
    ? `conic-gradient(${donutStops.join(', ')})`
    : '#E9EDF1';

  return (
    <div className="dashboard-screen">

      {/* CABEÇALHO */}
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            PAINEL ADMINISTRATIVO
          </span>

          <h1>Visão geral</h1>

          <p>
            Acompanhe os dados gerais dos indicadores dos estudantes.
          </p>
        </div>

       
      </div>

      {/* CARDS */}
      {/* RESUMO DOS INDICADORES */}
      <section className="dashboard-cards">
        {cards.slice(2, 4).map((card) => (
          <div className="dashboard-card" key={card.title}>
            <div className="dashboard-card-top">
              <span>{card.title}</span>
              <div className={`dashboard-card-icon ${card.color}`}>
                {card.icon}
              </div>
            </div>

            <strong>
              {Number(card.value).toLocaleString('pt-BR')}
            </strong>

            <small>{card.detail}</small>
          </div>
        ))}

        <div className="dashboard-card">
          <div className="dashboard-card-top">
            <span>Indicadores em andamento</span>
            <div className="dashboard-card-icon orange">↗</div>
          </div>

          <strong>
            {status.find((item) => item.name === 'Em andamento')?.value || 0}
          </strong>

          <small>Indicadores com progresso iniciado</small>
        </div>
      </section>

      {/* EVOLUÇÃO DOS INDICADORES */}
      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Evolução dos indicadores</h2>
            <p>Indicadores criados e concluídos por semana no mês atual.</p>
          </div>

          <div className="dashboard-chart-legend">
            <span>
              <i className="legend-created" />
              Criados
            </span>

            <span>
              <i className="legend-completed" />
              Concluídos
            </span>
          </div>
        </div>

        <Chart
          chartType="ColumnChart"
          width="100%"
          height="380px"
          data={[
            ['Semana', 'Criados', 'Concluídos'],
            ...monthlyData.map((item) => [
              item.month,
              Number(item.created) || 0,
              Number(item.completed) || 0,
            ]),
          ]}
          options={{
            backgroundColor: 'transparent',
            colors: ['#73B9DD', '#65A889'],
            legend: { position: 'top' },
            tooltip: { trigger: 'focus' },
            chartArea: {
              width: '85%',
              height: '75%',
            },
            vAxis: {
              minValue: 0,
              format: '0',
              textStyle: {
                color: '#777777',
                fontSize: 12,
              },
              baselineColor: '#DCE3DA',
              gridlines: {
                color: '#E9EEE7',
              },
            },
            bar: {
              groupWidth: '55%',
            },
          }}
        />
      </section>

      {/* GRÁFICOS SECUNDÁRIOS */}
      <section className="dashboard-graphs-grid">

        {/* STATUS */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Status dos indicadores</h2>

              <p>
                Distribuição dos indicadores ativos cadastrados.
              </p>
            </div>
          </div>

          <div className="dashboard-status-content">
            <div
              className="dashboard-donut"
              style={{
                background: donutBackground,
              }}
            >
              <div className="dashboard-donut-center">
                <strong>
                  {totalIndicators.toLocaleString('pt-BR')}
                </strong>

                <span>Indicadores</span>
              </div>
            </div>

            <div className="dashboard-status-legend">
              {status.map((item) => (
                <div
                  className="dashboard-status-item"
                  key={item.name}
                >
                  <div>
                    <i style={{ background: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <strong>
                    {item.value.toLocaleString('pt-BR')}
                  </strong>
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

              <p>
                Tipos de indicadores cadastrados pelos estudantes.
              </p>
            </div>
          </div>

          <div className="dashboard-category-list">
            {categories.length === 0 ? (
              <p>Nenhum indicador cadastrado.</p>
            ) : (
              categories.map((category) => (
                <div
                  className="dashboard-category"
                  key={category.name}
                >
                  <div className="dashboard-category-info">
                    <span>{category.name}</span>

                    <strong>
                      {category.value.toLocaleString('pt-BR')}
                    </strong>
                  </div>

                  <div className="dashboard-progress">
                    <span
                      style={{
                        width: `${(category.value / maxCategory) * 100}%`,
                        background: category.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {/* BEM-ESTAR */}
      <section className="dashboard-panel dashboard-wellbeing">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Panorama do bem-estar</h2>

            <p>
              Quantidade de registros realizados pelos estudantes.
            </p>
          </div>
        </div>

        <div className="dashboard-wellbeing-grid">
          {wellbeing.map((item) => (
            <div
              className="dashboard-wellbeing-card"
              key={item.name}
            >
              <div className="dashboard-wellbeing-title">
                <span className="wellbeing-emoji">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </div>

              <strong>
                {item.value.toLocaleString('pt-BR')}
              </strong>

              <div className="dashboard-progress">
                <span
                  style={{
                    width: `${item.percentage}%`,
                    background: item.color,
                  }}
                />
              </div>

              <small>
                {item.name === 'Hidratação'
                  ? 'Registros de consumo de água'
                  : 'Aguardando integração dos dados'}
              </small>
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
