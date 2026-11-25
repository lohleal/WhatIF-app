
import { useMemo, useState } from 'react';
import { Search, Users, UserCheck, UserX } from 'lucide-react';

import { studentsData } from '../data/studentsData';
import './StudentsScreen.css';

export default function StudentsScreen() {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const activeCount = studentsData.filter(
    (student) => student.active
  ).length;

  const inactiveCount = studentsData.length - activeCount;

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return studentsData.filter((student) => {
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.group.toLowerCase().includes(term);

      const matchesGroup =
        groupFilter === 'Todos' ||
        student.group === groupFilter;

      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativo'
          ? student.active
          : !student.active);

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [search, groupFilter, statusFilter]);

  return (
    <main className="students-page">

      <header className="students-heading">
        <div>
          <span className="students-eyebrow">
            GERENCIAMENTO
          </span>

          <h1>Estudantes</h1>

          <p>
            Consulte os estudantes cadastrados e acompanhe
            seus vínculos com os grupos.
          </p>
        </div>
      </header>

      {/* RESUMO */}

      <section className="students-stats">

        <article className="students-stat-card">
          <div className="students-stat-top">
            <span>Total de estudantes</span>
            <Users size={19} />
          </div>

          <strong>{studentsData.length}</strong>
          <small>Estudantes cadastrados</small>
        </article>

        <article className="students-stat-card">
          <div className="students-stat-top">
            <span>Estudantes ativos</span>
            <UserCheck size={19} />
          </div>

          <strong>{activeCount}</strong>
          <small>Com vínculo ativo no sistema</small>
        </article>

        <article className="students-stat-card">
          <div className="students-stat-top">
            <span>Estudantes inativos</span>
            <UserX size={19} />
          </div>

          <strong>{inactiveCount}</strong>
          <small>Sem vínculo ativo</small>
        </article>

      </section>

      {/* LISTAGEM */}

      <section className="students-panel">

        <div className="students-list-heading">
          <div>
            <h2>Alunos cadastrados</h2>
            <p>
              Lista demonstrativa com dados fictícios
              para apresentação.
            </p>
          </div>

          <span className="students-total">
            {filteredStudents.length} estudantes
          </span>
        </div>

        {/* FILTROS */}

        <div className="students-filters">

          <label className="students-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por nome ou grupo..."
            />
          </label>

          <select
            value={groupFilter}
            onChange={(event) =>
              setGroupFilter(event.target.value)
            }
          >
            <option>Todos</option>
            <option>Grupo A</option>
            <option>Grupo B</option>
            <option>Grupo C</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

        </div>

        {/* TABELA */}

        <div className="students-table-wrapper">

          <table className="students-table">

            <thead>
              <tr>
                <th>Estudante</th>
                <th>Grupo</th>
                <th>Data de ingresso</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.map((student) => (

                <tr key={student.id}>

                  <td>
                    <div className="students-name-cell">

                      <span className="students-avatar">
                        {student.name
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>

                      <strong>{student.name}</strong>

                    </div>
                  </td>

                  <td>{student.group}</td>

                  <td>{student.joinedAt}</td>

                  <td>
                    <span
                      className={`students-status ${
                        student.active
                          ? 'is-active'
                          : 'is-inactive'
                      }`}
                    >
                      {student.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                </tr>

              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="4" className="students-empty">
                    Nenhum estudante encontrado.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

      <footer className="students-footer">
        WHAT IF APP · Gerenciamento de estudantes
      </footer>

    </main>
  );
}
