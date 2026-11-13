
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getActiveGroups } from '../../groups/services/groupService';
import WorkshopCatalog from '../components/WorkshopCatalog';

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
        setError('Não foi possível carregar os grupos.');
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  const calendarDays = getCalendarDays(currentDate);

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

  function getMeetingsForDay(date) {
    const dayName = weekdays[date.getDay()];

    return groups
      .flatMap((group) => {
        const schedule = Array.isArray(group.schedule)
          ? group.schedule
          : [];

        return schedule
          .filter((meeting) => meeting.day === dayName)
          .map((meeting) => ({
            groupId: group.id,
            groupName: group.name,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
          }));
      })
      .sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
  }

  const todayKey = formatDateKey(new Date());

  return (
    <div className="workshops-screen">
      <div className="workshops-header">
        <div>
          <h1>Oficinas</h1>
          <p>
            Organize as oficinas e acompanhe os encontros dos grupos.
          </p>
        </div>
      </div>

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
                  const meetings = getMeetingsForDay(date);
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
                        {meetings.map((meeting, index) => (
                          <div
                            key={`${meeting.groupId}-${index}`}
                            className="calendar-meeting"
                            title={`${meeting.groupName}: ${meeting.startTime} às ${meeting.endTime}`}
                          >
                            <strong>{meeting.groupName}</strong>
                            <span>
                              {meeting.startTime} – {meeting.endTime}
                            </span>
                          </div>
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

        {activeTab === 'catalog' && (
          <WorkshopCatalog />
        )}
      </div>
    </div>
  );
}
