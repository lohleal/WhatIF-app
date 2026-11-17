
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { getActiveGroups } from '../../groups/services/groupService';
import WorkshopCatalog from '../components/WorkshopCatalog';

import {
  getGroupMeetingsForMonth,
  saveGroupMeeting,
} from '../services/groupMeetingService';

import { getWorkshops } from '../services/workshop-Service';

import './WorkshopsScreen.css';

const weekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getCalendarDays(date) {
  const firstDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  );

  // A semana começa no domingo.
  const startOffset = firstDay.getDay();

  const days = [];

  for (let i = 0; i < startOffset; i++) {
    days.push(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1 - (startOffset - i)
      )
    );
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(
      new Date(date.getFullYear(), date.getMonth(), day)
    );
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - startOffset + 1;

    days.push(
      new Date(date.getFullYear(), date.getMonth(), nextDay)
    );
  }

  return days;
}

export default function WorkshopsScreen() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const [groups, setGroups] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados da janela de associação
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Carregar grupos e encontros personalizados do mês
  useEffect(() => {
    async function loadCalendarData() {
      try {
        setLoading(true);
        setError('');

        const [activeGroups, savedMeetings] = await Promise.all([
          getActiveGroups(),
          getGroupMeetingsForMonth(currentYear, currentMonth),
        ]);

        setGroups(activeGroups);
        setMeetings(savedMeetings);
      } catch (err) {
        console.error('Erro ao carregar calendário:', err);
        setError('Não foi possível carregar os encontros.');
      } finally {
        setLoading(false);
      }
    }

    loadCalendarData();
  }, [currentYear, currentMonth]);

  // Abrir janela e carregar catálogo
  async function openMeeting(meeting) {
    setSelectedMeeting(meeting);
    setSelectedWorkshopId(meeting.workshopId || '');
    setMeetingError('');

    try {
      setLoadingWorkshops(true);

      const activeWorkshops = await getWorkshops();

      setWorkshops(activeWorkshops);
    } catch (err) {
      console.error('Erro ao carregar oficinas:', err);
      setMeetingError(
        'Não foi possível carregar o catálogo de oficinas.'
      );
    } finally {
      setLoadingWorkshops(false);
    }
  }

  // Salvar oficina no encontro selecionado
  async function handleSaveMeeting() {
    if (!selectedMeeting || !selectedWorkshopId) {
      setMeetingError('Selecione uma oficina antes de salvar.');
      return;
    }

    const selectedWorkshop = workshops.find(
      (workshop) => workshop.id === selectedWorkshopId
    );

    if (!selectedWorkshop) {
      setMeetingError('A oficina selecionada não foi encontrada.');
      return;
    }

    if (
      selectedMeeting.scheduleId === undefined ||
      selectedMeeting.scheduleId === null
    ) {
      setMeetingError(
        'Este horário não possui identificador. Atualize o cadastro do grupo antes de associar uma oficina.'
      );
      return;
    }

    try {
      setSavingMeeting(true);
      setMeetingError('');

      await saveGroupMeeting({
        groupId: selectedMeeting.groupId,
        scheduleId: selectedMeeting.scheduleId,
        groupName: selectedMeeting.groupName,
        date: selectedMeeting.date,
        startTime: selectedMeeting.startTime,
        endTime: selectedMeeting.endTime,
        workshopId: selectedWorkshop.id,
        workshopName: selectedWorkshop.name,
      });

      const updatedMeeting = {
        ...selectedMeeting,
        workshopId: selectedWorkshop.id,
        workshopName: selectedWorkshop.name,
      };

      setMeetings((previous) => {
        const filtered = previous.filter(
          (meeting) =>
            !(
              meeting.groupId === updatedMeeting.groupId &&
              String(meeting.scheduleId) ===
                String(updatedMeeting.scheduleId) &&
              meeting.date === updatedMeeting.date
            )
        );

        return [...filtered, updatedMeeting];
      });

      setSelectedMeeting(null);
    } catch (err) {
      console.error('Erro ao associar oficina:', err);
      setMeetingError(
        'Não foi possível salvar a associação. Verifique as permissões do Firestore.'
      );
    } finally {
      setSavingMeeting(false);
    }
  }

  function changeMonth(amount) {
    setCurrentDate((previous) =>
      new Date(
        previous.getFullYear(),
        previous.getMonth() + amount,
        1
      )
    );
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  // Gerar encontros recorrentes e aplicar personalizações
  function getMeetingsForDay(date) {
    const dayName = weekdays[date.getDay()];
    const dateKey = formatDateKey(date);

    return groups
      .flatMap((group) => {
        const schedule = Array.isArray(group.schedule)
          ? group.schedule
          : [];

        return schedule
          .filter((meeting) => meeting.day === dayName)
          .map((meeting, index) => {
            const savedMeeting = meetings.find(
              (saved) =>
                saved.groupId === group.id &&
                String(saved.scheduleId) === String(meeting.id) &&
                saved.date === dateKey
            );

            return {
              groupId: group.id,
              scheduleId: meeting.id,
              groupName: group.name,
              date: dateKey,
              startTime: savedMeeting?.startTime ?? meeting.startTime,
              endTime: savedMeeting?.endTime ?? meeting.endTime,
              workshopId: savedMeeting?.workshopId || '',
              workshopName: savedMeeting?.workshopName || '',
              key: `${group.id}-${meeting.id ?? index}`,
            };
          });
      })
      .sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
  }

  const calendarDays = getCalendarDays(currentDate);
  const todayKey = formatDateKey(new Date());

  return (
    <div className="workshops-screen">

      {/* CABEÇALHO */}
      <div className="workshops-header">
        <div>
          <h1>Oficinas</h1>
          <p>
            Organize as oficinas e acompanhe os encontros dos grupos.
          </p>
        </div>
      </div>

      {/* ABAS */}
      <div className="workshops-tabs">
        <button
          type="button"
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          Calendário
        </button>

        <button
          type="button"
          className={activeTab === 'catalog' ? 'active' : ''}
          onClick={() => setActiveTab('catalog')}
        >
          Catálogo
        </button>
      </div>

      <div className="workshops-content">

        {/* CALENDÁRIO */}
        {activeTab === 'calendar' && (
          <div className="workshops-calendar">

            <div className="calendar-toolbar">
              <div className="calendar-month-title">
                <CalendarDays size={21} />

                <h2>
                  {monthNames[currentDate.getMonth()]}{' '}
                  {currentDate.getFullYear()}
                </h2>
              </div>

              <div className="calendar-navigation">
                <button
                  type="button"
                  onClick={goToToday}
                  className="calendar-today-button"
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="calendar-message">
                Carregando encontros...
              </p>
            ) : error ? (
              <p className="calendar-message calendar-error">
                {error}
              </p>
            ) : (
              <div className="calendar-grid">

                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                  (day) => (
                    <div className="calendar-weekday" key={day}>
                      {day}
                    </div>
                  )
                )}

                {calendarDays.map((date) => {
                  const dateKey = formatDateKey(date);
                  const dayMeetings = getMeetingsForDay(date);

                  const isCurrentMonth =
                    date.getMonth() === currentDate.getMonth();

                  const isToday = dateKey === todayKey;

                  return (
                    <div
                      key={dateKey}
                      className={[
                        'calendar-day',
                        !isCurrentMonth ? 'outside-month' : '',
                        isToday ? 'today' : '',
                      ].join(' ')}
                    >
                      <span className="calendar-day-number">
                        {date.getDate()}
                      </span>

                      <div className="calendar-day-meetings">
                        {dayMeetings.map((meeting) => (
                          <button
                            type="button"
                            key={meeting.key}
                            className="calendar-meeting"
                            onClick={() => openMeeting(meeting)}
                            title={`Editar encontro de ${meeting.groupName}`}
                          >
                            <strong>{meeting.groupName}</strong>

                            <span>
                              {meeting.startTime} – {meeting.endTime}
                            </span>

                            {meeting.workshopName && (
                              <span className="calendar-meeting-workshop">
                                {meeting.workshopName}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !error && groups.length === 0 && (
              <p className="calendar-message">
                Nenhum grupo ativo cadastrado.
              </p>
            )}
          </div>
        )}

        {/* CATÁLOGO */}
        {activeTab === 'catalog' && (
          <WorkshopCatalog />
        )}
      </div>

      {/* JANELA DE ASSOCIAÇÃO DE OFICINA */}
      {selectedMeeting && (
        <div
          className="meeting-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingMeeting) {
              setSelectedMeeting(null);
            }
          }}
        >
          <div
            className="meeting-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-modal-title"
          >
            <div className="meeting-modal-header">
              <div>
                <span className="meeting-modal-eyebrow">
                  GERENCIAMENTO DE ENCONTRO
                </span>

                <h2 id="meeting-modal-title">
                  {selectedMeeting.groupName}
                </h2>
              </div>

              <button
                type="button"
                className="meeting-modal-close"
                onClick={() => setSelectedMeeting(null)}
                disabled={savingMeeting}
                aria-label="Fechar janela"
              >
                <X size={20} />
              </button>
            </div>

            <div className="meeting-modal-details">
              <div>
                <span>Data</span>
                <strong>
                  {selectedMeeting.date.split('-').reverse().join('/')}
                </strong>
              </div>

              <div>
                <span>Horário</span>
                <strong>
                  {selectedMeeting.startTime} às {selectedMeeting.endTime}
                </strong>
              </div>
            </div>

            <div className="meeting-modal-field">
              <label htmlFor="meeting-workshop">
                Oficina do encontro
              </label>

              {loadingWorkshops ? (
                <p>Carregando catálogo...</p>
              ) : (
                <select
                  id="meeting-workshop"
                  value={selectedWorkshopId}
                  onChange={(event) =>
                    setSelectedWorkshopId(event.target.value)
                  }
                  disabled={savingMeeting}
                >
                  <option value="">
                    Selecione uma oficina
                  </option>

                  {workshops.map((workshop) => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </option>
                  ))}
                </select>
              )}

              {!loadingWorkshops && workshops.length === 0 && (
                <p className="meeting-modal-hint">
                  Nenhuma oficina ativa encontrada. Cadastre uma oficina
                  no catálogo primeiro.
                </p>
              )}
            </div>

            {meetingError && (
              <p className="meeting-modal-error">
                {meetingError}
              </p>
            )}

            <div className="meeting-modal-actions">
              <button
                type="button"
                className="meeting-modal-cancel"
                onClick={() => setSelectedMeeting(null)}
                disabled={savingMeeting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="meeting-modal-save"
                onClick={handleSaveMeeting}
                disabled={
                  loadingWorkshops ||
                  savingMeeting ||
                  !workshops.length
                }
              >
                {savingMeeting ? 'Salvando...' : 'Salvar oficina'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
