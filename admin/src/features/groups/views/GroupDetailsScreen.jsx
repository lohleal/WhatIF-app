
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Users,
  ClipboardList,
  ChartNoAxesColumn,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { getGroupDetails } from '../services/groupDetailsService';
import './GroupDetailsScreen.css';

function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  });
}

export default function GroupDetailsScreen() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`;
  });

  function changeMonth(amount) {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + amount, 1);

    const newMonth = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    setSelectedMonth(newMonth);
  }

  function getMonthLabel() {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  useEffect(() => {
    async function loadGroupDetails() {
      try {
        if (!groupData) {
  setLoading(true);
}

setError('');

        const data = await getGroupDetails(groupId, selectedMonth);

        setGroupData(data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do grupo:', err);
        setError('Não foi possível carregar os detalhes do grupo.');
      } finally {
        setLoading(false);
      }
    }

    loadGroupDetails();
  }, [groupId, selectedMonth]);

  if (loading) {
    return (
      <div className="group-details-loading">
        Carregando informações do grupo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-details-page">
        <button
          className="group-back-button"
          onClick={() => navigate('/groups')}
        >
          <ArrowLeft size={18} />
          Voltar para grupos
        </button>

        <p className="group-details-error">{error}</p>
      </div>
    );
  }

  if (!groupData) {
    return null;
  }

  const { group, students, indicators, indicatorSummary } = groupData;

  const totalRecords = indicators.reduce(
    (total, indicator) =>
      total + indicator.monthlyRecords.length,
    0
  );

  const maxValue = Math.max(
    ...indicatorSummary.map((item) => item.total),
    1
  );

  function getStudentName(student) {
    const name = [
      student.nome,
      student.sobrenome,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      name ||
      student.name ||
      student.displayName ||
      student.email ||
      'Aluno sem nome'
    );
  }

  return (
    <main className="group-details-page">

      {/* BOTÃO VOLTAR */}
      <button
        className="group-back-button"
        onClick={() => navigate('/groups')}
      >
        <ArrowLeft size={18} />
        Voltar para grupos
      </button>

      {/* CABEÇALHO */}
      <header className="group-details-header">
        <div>
          <span className="group-details-eyebrow">
            GERENCIAMENTO DE GRUPOS
          </span>

          <h1>{group.name || 'Detalhes do grupo'}</h1>

          <p>
            {group.description ||
              'Acompanhe os indicadores e participantes deste grupo.'}
          </p>
        </div>

        <span
          className={`group-status ${
            group.active ? 'active' : 'inactive'
          }`}
        >
          {group.active ? 'Ativo' : 'Inativo'}
        </span>
      </header>

      {/* CARDS DE RESUMO */}
      <section className="group-details-summary">

        <article className="group-summary-card">
          <div className="group-summary-icon students-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Alunos participantes</span>
            <strong>{students.length}</strong>
          </div>
        </article>

        <article className="group-summary-card">
          <div className="group-summary-icon indicators-icon">
            <ClipboardList size={22} />
          </div>

          <div>
            <span>Indicadores utilizados</span>
            <strong>{indicators.length}</strong>
          </div>
        </article>

        <article className="group-summary-card">
          <div className="group-summary-icon records-icon">
            <ChartNoAxesColumn size={22} />
          </div>

          <div>
            <span>Registros no mês</span>
            <strong>{totalRecords}</strong>
          </div>
        </article>

      </section>

      {/* GRÁFICO DE INDICADORES */}
      <section className="group-details-section">

        <div className="group-section-heading">
          <div>
            <h2>Indicadores registrados</h2>

            <p>
              Totais registrados pelos participantes no mês selecionado
            </p>
          </div>

          <div className="group-month-selector">
  <button
    type="button"
    className="group-month-today"
    onClick={() => {
      const now = new Date();

      setSelectedMonth(
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, '0')}`
      );
    }}
  >
    Hoje
  </button>

  <button
    type="button"
    onClick={() => changeMonth(-1)}
    aria-label="Mês anterior"
  >
    <ChevronLeft size={21} />
  </button>

  <button
    type="button"
    onClick={() => changeMonth(1)}
    aria-label="Próximo mês"
  >
    <ChevronRight size={21} />
  </button>
</div>
        </div>

        {indicatorSummary.length === 0 ? (
          <p className="group-empty-message">
            Nenhum registro encontrado neste mês.
          </p>
        ) : (
          <div className="group-chart">

            {indicatorSummary.map((item) => {
              const percentage =
                (item.total / maxValue) * 100;

              return (
                <div
                  className="group-chart-item"
                  key={`${item.name}-${item.unit}`}
                >

                  <span className="group-chart-value">
                    {formatNumber(item.total)} {item.unit}
                  </span>

                  <div className="group-chart-column">
                    <div
                      className="group-chart-bar"
                      style={{
                        height: `${percentage}%`,
                      }}
                    />
                  </div>

                  <span className="group-chart-label">
                    {item.name}
                  </span>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* INDICADORES UTILIZADOS */}
      <section className="group-details-section">

        <div className="group-section-heading">
          <div>
            <h2>
              Indicadores utilizados

              <span className="group-section-count">
                {indicators.length}
              </span>
            </h2>

            <p>
              Indicadores ativos cadastrados pelos participantes
            </p>
          </div>
        </div>

        {indicators.length === 0 ? (
          <p className="group-empty-message">
            Nenhum indicador cadastrado até o momento.
          </p>
        ) : (
          <div className="group-indicators-list">

            {indicators.map((indicator) => (
              <article
                className="group-indicator-item"
                key={indicator.id}
              >

                <div className="group-indicator-icon">
                  <ClipboardList size={20} />
                </div>

                <div className="group-item-info">
                  <strong>
                    {indicator.name || 'Indicador sem nome'}
                  </strong>

                  <span>
                    {indicator.description || 'Sem descrição'}
                  </span>
                </div>

                <span className="group-indicator-records">
                  {formatNumber(indicator.monthlyTotal)}{' '}
                  {indicator.monthlyUnit}
                </span>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* ALUNOS PARTICIPANTES */}
      <section className="group-details-section">

        <div className="group-section-heading">
          <div>
            <h2>
              Alunos participantes

              <span className="group-section-count">
                {students.length}
              </span>
            </h2>

            <p>
              Estudantes vinculados a este grupo
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="group-empty-message">
            Ainda não existem alunos neste grupo.
          </p>
        ) : (
          <div className="group-students-list">

            {students.map((student) => (
              <article
                className="group-student-item"
                key={student.id}
              >

                <div className="group-student-avatar">
                  <Users size={20} />
                </div>

                <div className="group-item-info">
                  <strong>
                    {getStudentName(student)}
                  </strong>

                  {student.email && (
                    <span className="group-student-email">
                      <Mail size={14} />
                      {student.email}
                    </span>
                  )}
                </div>

                <span className="group-student-status">
                  Participante
                </span>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}
