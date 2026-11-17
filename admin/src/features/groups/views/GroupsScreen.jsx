
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  Layers,
  Clock,
  Plus,
  Search,
} from 'lucide-react';

import { getActiveGroups } from '../services/groupService';

import './GroupsScreen.css';

export default function GroupsScreen() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        setError('');

        const activeGroups = await getActiveGroups();
        setGroups(activeGroups);
      } catch (err) {
        console.error('Erro ao buscar grupos:', err);
        setError('Não foi possível carregar os grupos cadastrados.');
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  const totalMeetings = groups.reduce(
    (total, group) =>
      total + (Array.isArray(group.schedule) ? group.schedule.length : 0),
    0
  );

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return groups;

    return groups.filter((group) => {
      const scheduleText = (group.schedule || [])
        .map((meeting) =>
          `${meeting.day} ${meeting.startTime} ${meeting.endTime}`
        )
        .join(' ');

      return `${group.name} ${group.description || ''} ${scheduleText}`
        .toLowerCase()
        .includes(term);
    });
  }, [groups, search]);

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
            Gerencie os grupos e acompanhe os encontros cadastrados.
          </p>
        </div>

        <button
          className="groups-create-button"
          onClick={() => navigate('/groups/create')}
          type="button"
        >
          <Plus size={17} />
          Cadastrar grupo
        </button>
      </div>

      {/* RESUMO */}
      <section className="groups-stats">

        <div className="groups-stat-card">
          <div className="groups-stat-top">
            <span>Grupos ativos</span>

            <div className="groups-stat-icon purple">
              <Layers size={19} />
            </div>
          </div>

          <strong>{loading ? '—' : groups.length}</strong>
          <small>Grupos cadastrados no sistema</small>
        </div>

        <div className="groups-stat-card">
          <div className="groups-stat-top">
            <span>Horários cadastrados</span>

            <div className="groups-stat-icon blue">
              <Clock size={19} />
            </div>
          </div>

          <strong>{loading ? '—' : totalMeetings}</strong>
          <small>Encontros semanais configurados</small>
        </div>

      </section>

      {/* LISTAGEM DOS GRUPOS */}
      <section className="groups-panel">

        <div className="groups-list-heading">
          <div>
            <h2>Grupos cadastrados</h2>
            <p>
              Consulte os grupos e seus respectivos dias e horários.
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
            placeholder="Buscar grupo, descrição ou dia..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="groups-empty">
            Carregando grupos...
          </p>
        ) : error ? (
          <p className="groups-empty">
            {error}
          </p>
        ) : (
          <div className="groups-table-wrapper">
            <table className="groups-table">

              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Descrição</th>
                  <th>Dias e horários</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group.id}>

                    <td>
                      <strong>{group.name}</strong>
                    </td>

                    <td>
                      {group.description?.trim() || 'Sem descrição'}
                    </td>

                    <td>
                      <div className="groups-schedule-list">
                        {(group.schedule || []).map((meeting, index) => (
                          <div
                            key={meeting.id ?? index}
                            className="groups-schedule-item"
                          >
                            <span>{meeting.day}</span>

                            <small>
                              {meeting.startTime} às {meeting.endTime}
                            </small>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      <span className="groups-status">
                        Ativo
                      </span>
                    </td>

                  </tr>
                ))}

                {filteredGroups.length === 0 && (
                  <tr>
                    <td colSpan="4" className="groups-empty">
                      {search
                        ? 'Nenhum grupo encontrado para essa pesquisa.'
                        : 'Nenhum grupo ativo cadastrado.'}
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        )}

      </section>

      <footer className="groups-footer">
        WHAT IF APP · Gerenciamento de grupos
      </footer>

    </div>
  );
}
