
import {
  Activity,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Droplets,
  GraduationCap,
  Layers,
  Moon,
  Printer,
  Smile,
  Target,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import './ReportsScreen.css';


// Dados fictícios para demonstração
const reportsData = {
  '2026-09': {
    totalRecords: 2180,
    activeUsers: 112,
    groups: 3,
    water: {
      records: 420,
      total: '38.450 L',
    },
    sleep: {
      records: 365,
      total: '2.920 horas',
    },
    mood: {
      records: 390,
      total: '390 registros de humor',
    },
    studies: {
      records: 280,
      total: '560 horas',
    },
    indicators: {
      records: 310,
      total: '310 concluídos',
    },
    tasks: {
      records: 415,
      total: '415 tarefas concluídas',
    },
    workshops: [
      { name: 'Saúde mental e autocuidado', category: 'Saúde mental', participants: 32 },
      { name: 'Organização da rotina de estudos', category: 'Estudos', participants: 25 },
    ],
  },

  '2026-10': {
    totalRecords: 2510,
    activeUsers: 120,
    groups: 3,
    water: {
      records: 485,
      total: '46.280 L',
    },
    sleep: {
      records: 410,
      total: '3.280 horas',
    },
    mood: {
      records: 445,
      total: '445 registros de humor',
    },
    studies: {
      records: 325,
      total: '650 horas',
    },
    indicators: {
      records: 365,
      total: '365 concluídos',
    },
    tasks: {
      records: 480,
      total: '480 tarefas concluídas',
    },
    workshops: [
      { name: 'Autoconhecimento e emoções', category: 'Saúde mental', participants: 35 },
      { name: 'Hábitos saudáveis', category: 'Qualidade de vida', participants: 28 },
      { name: 'Planejamento e organização', category: 'Estudos', participants: 24 },
    ],
  },

  '2026-11': {
    totalRecords: 2845,
    activeUsers: 128,
    groups: 3,
    water: {
      records: 516,
      total: '51.651 L',
    },
    sleep: {
      records: 472,
      total: '3.776 horas',
    },
    mood: {
      records: 498,
      total: '498 registros de humor',
    },
    studies: {
      records: 385,
      total: '770 horas',
    },
    indicators: {
      records: 432,
      total: '432 concluídos',
    },
    tasks: {
      records: 542,
      total: '542 tarefas concluídas',
    },
    workshops: [
      { name: 'Saúde mental no ambiente escolar', category: 'Saúde mental', participants: 38 },
      { name: 'Ansiedade e estratégias de enfrentamento', category: 'Saúde mental', participants: 30 },
      { name: 'Autocuidado e qualidade de vida', category: 'Qualidade de vida', participants: 26 },
    ],
  },
};

const indicators = [
  {
    key: 'water',
    name: 'Hidratação',
    description: 'Consumo de água registrado',
    icon: Droplets,
    color: '#5796bd',
    background: '#edf6fb',
  },
  {
    key: 'sleep',
    name: 'Sono',
    description: 'Registros de sono',
    icon: Moon,
    color: '#8b79b5',
    background: '#f3f0fa',
  },
  {
    key: 'mood',
    name: 'Humor',
    description: 'Registros de humor',
    icon: Smile,
    color: '#c18d4b',
    background: '#fbf5eb',
  },
  {
    key: 'studies',
    name: 'Estudos',
    description: 'Registros de estudo',
    icon: BookOpen,
    color: '#54866a',
    background: '#edf5ef',
  },
  {
    key: 'indicators',
    name: 'Indicadores',
    description: 'Indicadores concluídos',
    icon: Target,
    color: '#6e8e72',
    background: '#eef4ed',
  },
  {
    key: 'tasks',
    name: 'Tarefas',
    description: 'Tarefas concluídas no Kanban',
    icon: CheckSquare,
    color: '#7d91a4',
    background: '#eff3f7',
  },
];

const monthOptions = [
  { value: '2026-11', label: 'Novembro de 2026' },
  { value: '2026-10', label: 'Outubro de 2026' },
  { value: '2026-09', label: 'Setembro de 2026' },
];

export default function ReportsScreen() {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  const data = reportsData[selectedMonth];

  const handleExportPDF = () => {
    window.print();
  };

  const monthLabel = monthOptions.find(
    (month) => month.value === selectedMonth
  )?.label;

  const maxRecords = Math.max(
    ...indicators.map((indicator) => data[indicator.key].records)
  );

  return (
    <main className="reports-page">

      {/* CABEÇALHO */}
      <header className="reports-heading">
        <div>
          <span className="reports-eyebrow">ACOMPANHAMENTO</span>

          <h1>Relatórios</h1>

          <p>
            Acompanhe os registros, indicadores e atividades
            realizados pelos estudantes.
          </p>
        </div>

        <button
          className="reports-export-button"
          onClick={handleExportPDF}
        >
          <Printer size={17} />
          Extrair PDF
        </button>
      </header>

      {/* FILTRO DE PERÍODO */}
      <section className="reports-period">
        <div className="reports-period-label">
          <CalendarDays size={18} />
          <span>Período do relatório</span>
        </div>

        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </section>

      {/* RESUMO GERAL */}
      <section className="reports-stats">

        <article className="reports-stat-card">
          <div className="reports-stat-top">
            <span>Registros totais</span>
            <Activity size={19} />
          </div>

          <strong>{data.totalRecords.toLocaleString('pt-BR')}</strong>
          <small>Registros realizados no mês</small>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-top">
            <span>Usuários ativos</span>
            <UserCheck size={19} />
          </div>

          <strong>{data.activeUsers}</strong>
          <small>Estudantes com participação</small>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-top">
            <span>Grupos acompanhados</span>
            <Layers size={19} />
          </div>

          <strong>{data.groups}</strong>
          <small>Grupos vinculados ao sistema</small>
        </article>

      </section>

      {/* REGISTROS POR INDICADOR */}
      <section className="reports-panel">

        <div className="reports-section-heading">
          <div>
            <h2>Registros por indicador</h2>
            <p>
              Resumo das atividades registradas pelos estudantes
              em {monthLabel}.
            </p>
          </div>

          <span className="reports-total">
            {indicators.reduce(
              (total, indicator) =>
                total + data[indicator.key].records,
              0
            ).toLocaleString('pt-BR')} registros
          </span>
        </div>

        <div className="reports-indicators-grid">

          {indicators.map((indicator) => {
            const Icon = indicator.icon;
            const item = data[indicator.key];
            const percentage = (item.records / maxRecords) * 100;

            return (
              <article
                className="reports-indicator-card"
                key={indicator.key}
              >
                <div className="reports-indicator-top">
                  <div
                    className="reports-indicator-icon"
                    style={{
                      color: indicator.color,
                      background: indicator.background,
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <span className="reports-indicator-count">
                    {item.records.toLocaleString('pt-BR')} registros
                  </span>
                </div>

                <h3>{indicator.name}</h3>
                <p>{indicator.description}</p>

                <div className="reports-progress-track">
                  <div
                    className="reports-progress-fill"
                    style={{
                      width: `${percentage}%`,
                      background: indicator.color,
                    }}
                  />
                </div>

                <strong className="reports-indicator-total">
                  {item.total}
                </strong>
              </article>
            );
          })}

        </div>
      </section>

      {/* OFICINAS */}
      <section className="reports-panel">

        <div className="reports-section-heading">
          <div>
            <h2>Oficinas realizadas</h2>
            <p>
              Atividades promovidas no período selecionado.
            </p>
          </div>

          <span className="reports-total">
            {data.workshops.length} oficinas
          </span>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Oficina</th>
                <th>Categoria</th>
                <th>Participantes</th>
              </tr>
            </thead>

            <tbody>
              {data.workshops.map((workshop, index) => (
                <tr key={index}>
                  <td>
                    <div className="reports-workshop-name">
                      <span className="reports-workshop-icon">
                        <GraduationCap size={17} />
                      </span>

                      <strong>{workshop.name}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="reports-category">
                      {workshop.category}
                    </span>
                  </td>

                  <td>{workshop.participants} estudantes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      {/* RODAPÉ */}
      <footer className="reports-footer">
        WHAT IF APP · Relatório demonstrativo com dados fictícios
      </footer>

    </main>
  );
}
