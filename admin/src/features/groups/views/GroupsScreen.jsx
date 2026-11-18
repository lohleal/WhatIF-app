
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Check,
  Clock,
  Eye,
  Layers,
  Pencil,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import {
  approveGroupRequest,
  getActiveGroups,
  getPendingGroupRequests,
  rejectGroupRequest,
} from '../services/groupService';

import './GroupsScreen.css';

function formatRequestDate(timestamp) {
  if (!timestamp) return 'Data não disponível';

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Data não disponível';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GroupsScreen() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');

  const [processingRequestId, setProcessingRequestId] = useState(null);

  // CARREGAR GRUPOS
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

  // CARREGAR SOLICITAÇÕES PENDENTES
  async function loadRequests() {
    try {
      setLoadingRequests(true);
      setRequestError('');

      const pendingRequests = await getPendingGroupRequests();
      setRequests(pendingRequests);
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
      setRequestError(
        'Não foi possível carregar as solicitações de entrada.'
      );
    } finally {
      setLoadingRequests(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  // TOTAL DE ENCONTROS
  const totalMeetings = groups.reduce(
    (total, group) =>
      total + (Array.isArray(group.schedule) ? group.schedule.length : 0),
    0
  );

  // FILTRAR GRUPOS
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

  // APROVAR SOLICITAÇÃO
  async function handleApprove(request) {
    const confirmed = window.confirm(
      `Deseja aprovar a entrada de ${request.studentName} no grupo ${request.groupName}?`
    );

    if (!confirmed) return;

    try {
      setProcessingRequestId(request.id);
      setRequestError('');

      await approveGroupRequest(
        request.id,
        request.userId,
        request.groupId
      );

      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
    } catch (err) {
      console.error('Erro ao aprovar solicitação:', err);

      setRequestError(
        err.message || 'Não foi possível aprovar a solicitação.'
      );
    } finally {
      setProcessingRequestId(null);
    }
  }

  // RECUSAR SOLICITAÇÃO
  async function handleReject(request) {
    const confirmed = window.confirm(
      `Deseja recusar a solicitação de ${request.studentName}?`
    );

    if (!confirmed) return;

    try {
      setProcessingRequestId(request.id);
      setRequestError('');

      await rejectGroupRequest(request.id);

      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
    } catch (err) {
      console.error('Erro ao recusar solicitação:', err);

      setRequestError(
        err.message || 'Não foi possível recusar a solicitação.'
      );
    } finally {
      setProcessingRequestId(null);
    }
  }

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

      {/* SOLICITAÇÕES DE ENTRADA */}
      <section className="groups-panel">

        <div className="groups-list-heading">
          <div>
            <h2>Solicitações de entrada</h2>
            <p>
              Analise os pedidos dos alunos para participar dos grupos.
            </p>
          </div>

          <span className="groups-total">
            {loadingRequests ? '...' : `${requests.length} pendentes`}
          </span>
        </div>

        {requestError && (
          <p className="groups-error">
            {requestError}
          </p>
        )}

        {loadingRequests ? (
          <p className="groups-empty">
            Carregando solicitações...
          </p>
        ) : requests.length === 0 && !requestError ? (
          <div className="groups-requests-empty">
            <Users size={25} />
            <strong>Nenhuma solicitação pendente</strong>
            <span>
              Quando um aluno solicitar entrada em um grupo,
              o pedido aparecerá aqui.
            </span>
          </div>
        ) : (
          <div className="groups-requests-list">

            {requests.map((request) => {
              const processing =
                processingRequestId === request.id;

              return (
                <div
                  className="groups-request-card"
                  key={request.id}
                >

                  <div className="groups-request-student">
                    <div className="groups-request-avatar">
                      <UserRound size={20} />
                    </div>

                    <div className="groups-request-info">
                      <strong>{request.studentName}</strong>

                      <span>
                        {request.studentEmail || 'E-mail não informado'}
                      </span>
                    </div>
                  </div>

                  <div className="groups-request-details">
                    <span>Grupo solicitado</span>
                    <strong>{request.groupName}</strong>
                  </div>

                  <div className="groups-request-details">
                    <span>Data da solicitação</span>
                    <strong>
                      {formatRequestDate(request.requestedAt)}
                    </strong>
                  </div>

                  <div className="groups-request-actions">

                    <button
                      type="button"
                      className="groups-approve-button"
                      onClick={() => handleApprove(request)}
                      disabled={processing || processingRequestId !== null}
                    >
                      <Check size={15} />
                      {processing ? 'Processando...' : 'Aprovar'}
                    </button>

                    <button
                      type="button"
                      className="groups-reject-button"
                      onClick={() => handleReject(request)}
                      disabled={processing || processingRequestId !== null}
                    >
                      <X size={15} />
                      Recusar
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

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
                  <th>Ações</th>
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

                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                        <button
                          type="button"
                          className="groups-edit-button"
                          onClick={() => navigate(`/groups/${group.id}`)}
                          title={`Ver detalhes de ${group.name}`}
                          aria-label={`Ver detalhes de ${group.name}`}
                        >
                          <Eye size={15} />
                          Detalhes
                        </button>

                        <button
                          type="button"
                          className="groups-edit-button"
                          onClick={() => navigate(`/groups/${group.id}/edit`)}
                          title={`Editar ${group.name}`}
                          aria-label={`Editar ${group.name}`}
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

                {filteredGroups.length === 0 && (
                  <tr>
                    <td colSpan="5" className="groups-empty">
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
