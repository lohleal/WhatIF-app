
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';

import {
  getGroupById,
  updateGroup,
} from '../services/groupService';

import './CreateGroupScreen.css';

const weekdays = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function EditGroupScreen() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGroup() {
      try {
        setLoading(true);
        setError('');

        const group = await getGroupById(groupId);

        setName(group.name || '');
        setDescription(group.description || '');
        setSchedule(
          (group.schedule || []).map((meeting, index) => ({
            ...meeting,
            id: meeting.id ?? `existing-${index}`,
          }))
        );
      } catch (err) {
        console.error('Erro ao carregar grupo:', err);
        setError('Não foi possível carregar os dados do grupo.');
      } finally {
        setLoading(false);
      }
    }

    loadGroup();
  }, [groupId]);

  function addWorkshop() {
    setSchedule((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        day: '',
        startTime: '',
        endTime: '',
      },
    ]);
  }

  function removeWorkshop(id) {
    setSchedule((previous) =>
      previous.filter((meeting) => meeting.id !== id)
    );
  }

  function updateWorkshop(id, field, value) {
    setSchedule((previous) =>
      previous.map((meeting) =>
        meeting.id === id
          ? { ...meeting, [field]: value }
          : meeting
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome do grupo.');
      return;
    }

    if (
      !schedule.length ||
      schedule.some(
        (meeting) =>
          !meeting.day ||
          !meeting.startTime ||
          !meeting.endTime
      )
    ) {
      alert('Preencha todos os dias e horários dos encontros.');
      return;
    }

    if (
      schedule.some(
        (meeting) => meeting.startTime >= meeting.endTime
      )
    ) {
      alert('O horário de término deve ser posterior ao início.');
      return;
    }

    const selectedDays = schedule.map((meeting) => meeting.day);

    if (new Set(selectedDays).size !== selectedDays.length) {
      alert('Não selecione o mesmo dia mais de uma vez.');
      return;
    }

    try {
      setSaving(true);

      await updateGroup(groupId, {
        name,
        description,
        schedule,
      });

      alert('Grupo atualizado com sucesso!');
      navigate('/groups');
    } catch (err) {
      console.error('Erro ao atualizar grupo:', err);
      alert(`Erro ao atualizar: ${err.code || err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="create-group-screen">
        <p>Carregando dados do grupo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-group-screen">
        <p>{error}</p>

        <button
          type="button"
          className="create-group-back"
          onClick={() => navigate('/groups')}
        >
          <ArrowLeft size={17} />
          Voltar para grupos
        </button>
      </div>
    );
  }

  return (
    <div className="create-group-screen">
      <button
        type="button"
        className="create-group-back"
        onClick={() => navigate('/groups')}
      >
        <ArrowLeft size={17} />
        Voltar para grupos
      </button>

      <div className="create-group-heading">
        <span className="groups-eyebrow">GERENCIAMENTO</span>

        <h1>Editar grupo</h1>

        <p>
          Atualize as informações e os horários dos encontros.
        </p>
      </div>

      <form className="create-group-form" onSubmit={handleSubmit}>
        <section className="create-group-panel">
          <div className="create-group-section-title">
            <div className="create-group-icon">
              <Users size={19} />
            </div>

            <div>
              <h2>Informações do grupo</h2>
              <p>Atualize os dados principais do grupo.</p>
            </div>
          </div>

          <div className="create-group-field">
            <label htmlFor="group-name">Nome do grupo *</label>

            <input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Grupo A"
              maxLength={60}
              required
            />
          </div>

          <div className="create-group-field">
            <label htmlFor="group-description">Descrição</label>

            <textarea
              id="group-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva brevemente o grupo..."
              rows={4}
              maxLength={300}
            />
          </div>
        </section>

        <section className="create-group-panel">
          <div className="create-group-section-title">
            <div className="create-group-icon green">
              <Users size={19} />
            </div>

            <div>
              <h2>Dias e horários dos encontros</h2>
              <p>
                Altere os dias e horários em que os encontros acontecem.
              </p>
            </div>
          </div>

          <div className="create-group-workshops">
            {schedule.map((meeting, index) => (
              <div
                className="create-group-workshop"
                key={meeting.id}
              >
                <div className="create-group-workshop-heading">
                  <strong>Encontro {index + 1}</strong>

                  {schedule.length > 1 && (
                    <button
                      type="button"
                      className="create-group-remove"
                      onClick={() => removeWorkshop(meeting.id)}
                      aria-label="Remover encontro"
                    >
                      <Trash2 size={16} />
                      Remover
                    </button>
                  )}
                </div>

                <div className="create-group-schedule-fields">
                  <div className="create-group-field">
                    <label>Dia da semana *</label>

                    <select
                      value={meeting.day}
                      onChange={(event) =>
                        updateWorkshop(
                          meeting.id,
                          'day',
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">Selecione um dia</option>

                      {weekdays.map((day) => (
                        <option
                          key={day}
                          value={day}
                          disabled={schedule.some(
                            (other) =>
                              other.id !== meeting.id &&
                              other.day === day
                          )}
                        >
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="create-group-field">
                    <label>Horário de início *</label>

                    <input
                      type="time"
                      value={meeting.startTime}
                      onChange={(event) =>
                        updateWorkshop(
                          meeting.id,
                          'startTime',
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="create-group-field">
                    <label>Horário de término *</label>

                    <input
                      type="time"
                      value={meeting.endTime}
                      onChange={(event) =>
                        updateWorkshop(
                          meeting.id,
                          'endTime',
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="create-group-add"
            onClick={addWorkshop}
            disabled={schedule.length >= weekdays.length}
          >
            <Plus size={16} />
            Adicionar outro dia
          </button>
        </section>

        <div className="create-group-actions">
          <button
            type="button"
            className="create-group-cancel"
            onClick={() => navigate('/groups')}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="create-group-submit"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
