
import { useState } from 'react';
import {
  Users,
  Layers,
  Target,
  Clock,
  Plus,
  Search,
  ChevronRight,
} from 'lucide-react';

import './GroupsScreen.css';

const groupsData = [
  {
    id: 1,
    name: 'Grupo A',
    code: 'WHAT-A01',
    students: 32,
    created: 85,
    completed: 62,
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Grupo B',
    code: 'WHAT-B02',
    students: 28,
    created: 72,
    completed: 48,
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Grupo C',
    code: 'WHAT-C03',
    students: 35,
    created: 94,
    completed: 78,
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'Grupo D',
    code: 'WHAT-D04',
    students: 24,
    created: 61,
    completed: 39,
    status: 'Ativo',
  },
];

export default function GroupsScreen() {
  const [search, setSearch] = useState('');

  const totalStudents = groupsData.reduce(
    (total, group) => total + group.students,
    0
  );

  const totalCreated = groupsData.reduce(
    (total, group) => total + group.created,
    0
  );

  const totalCompleted = groupsData.reduce(
    (total, group) => total + group.completed,
    0
  );

  const pendingRequests = 6;

  const filteredGroups = groupsData.filter((group) =>
    `${group.name} ${group.code}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const maxIndicators = Math.max(
    ...groupsData.map((group) => group.created),
    1
  );

  return (
    <div className="groups-screen">

      {/* CABEÇALHO */}
      <div className="groups-heading">
        <div>
          <span className="groups-eyebrow">
            GERENCIAMENTO
          </span>

          <h1>Grupos</h1>

          <p>
            Gerencie os grupos e acompanhe o desenvolvimento
            dos estudantes.
          </p>
        </div>

        <button className="groups-create-button">
          <Plus size={17} />
          Cadastrar grupo
        </button>
      </div>

      {/* RESUMO */}
      <section className="groups-stats">

        <div className="groups-stat-card">
          <div className="groups-stat-top">
            <span>Grupos cadastrados</span>
            <div className="groups-stat-icon purple">
              <Layers size={19} />
            </div>
          </div>
          <strong>{groupsData.length}</strong>
          <small>Grupos registrados</small>
        </div>

        <div className="groups-stat-card">
          <div className="groups-stat-top">
            <span>Alunos vinculados</span>
            <div className="groups-stat-icon blue">
              <Users size={19} />
            </div>
          </div>
          <strong>{totalStudents}</strong>
          <small>Em todos os grupos</small>
        </div>

        <div className="groups-stat-card">
          <div className="groups-stat-top">
            <span>Indicadores concluídos</span>
            <div className="groups-stat-icon green">
              <Target size={19} />
            </div>
          </div>
          <strong>{totalCompleted}</strong>
          <small>
            {totalCreated > 0
              ? `${Math.round((totalCompleted / totalCreated) * 100)}% dos criados`
              : 'Nenhum indicador'}
          </small>
        </div>

        <div className="groups-stat-card">
          <div className="groups-stat-top">
            <span>Solicitações pendentes</span>
            <div className="groups-stat-icon orange">
              <Clock size={19} />
            </div>
          </div>
          <strong>{pendingRequests}</strong>
          <small>Aguardando aprovação</small>
        </div>

      </section>

      {/* DESEMPENHO DOS GRUPOS */}
      <section className="groups-panel">

        <div className="groups-panel-heading">
          <div>
            <h2>Desempenho dos grupos</h2>
            <p>
              Comparação entre indicadores criados e concluídos.
            </p>
          </div>

          <div className="groups-chart-legend">
            <span>
              <i className="groups-legend-created" />
              Criados
            </span>
            <span>
              <i className="groups-legend-completed" />
              Concluídos
            </span>
          </div>
        </div>

        <div className="groups-chart">
          {groupsData.map((group) => (
            <div className="groups-chart-column" key={group.id}>

              <div className="groups-chart-values">
                <span>{group.created}</span>
                <span>{group.completed}</span>
              </div>

              <div className="groups-chart-bars">
                <div
                  className="groups-chart-bar created"
                  style={{
                    height: `${(group.created / maxIndicators) * 100}%`,
                  }}
                  title={`${group.created} indicadores criados`}
                />

                <div
                  className="groups-chart-bar completed"
                  style={{
                    height: `${(group.completed / maxIndicators) * 100}%`,
                  }}
                  title={`${group.completed} indicadores concluídos`}
                />
              </div>

              <span className="groups-chart-label">
                {group.name}
              </span>

            </div>
          ))}
        </div>
      </section>

      {/* LISTAGEM DOS GRUPOS */}
      <section className="groups-panel">

        <div className="groups-list-heading">
          <div>
            <h2>Grupos cadastrados</h2>
            <p>
              Consulte os grupos e acompanhe seus integrantes.
            </p>
          </div>

          <span className="groups-total">
            {filteredGroups.length} grupos
          </span>
        </div>

        <div className="groups-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Buscar grupo ou código..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="groups-table-wrapper">
          <table className="groups-table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Código</th>
                <th>Estudantes</th>
                <th>Indicadores</th>
                <th>Conclusão</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredGroups.map((group) => {
                const percentage = group.created > 0
                  ? Math.round((group.completed / group.created) * 100)
                  : 0;

                return (
                  <tr key={group.id}>
                    <td>
                      <strong>{group.name}</strong>
                    </td>

                    <td>{group.code}</td>

                    <td>
                      <span className="groups-student-count">
                        <Users size={14} />
                        {group.students}
                      </span>
                    </td>

                    <td>
                      {group.created}
                    </td>

                    <td>
                      <div className="groups-completion">
                        <span>{percentage}%</span>
                        <div className="groups-progress">
                          <span
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="groups-status">
                        {group.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan="6" className="groups-empty">
                    Nenhum grupo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>

      <footer className="groups-footer">
        WHAT IF APP · Gerenciamento de grupos
      </footer>

    </div>
  );
}
