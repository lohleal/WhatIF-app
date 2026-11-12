
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { createGroup } from '../services/groupService';

import './CreateGroupScreen.css';

const weekdays = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];

export default function CreateGroupScreen() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [workshops, setWorkshops] = useState([
        { id: 1, day: '', startTime: '', endTime: '' },
    ]);

    function addWorkshop() {
        setWorkshops((previous) => [
            ...previous,
            {
                id: Date.now(),
                day: '',
                startTime: '',
                endTime: '',
            },
        ]);
    }

    function removeWorkshop(id) {
        setWorkshops((previous) =>
            previous.filter((workshop) => workshop.id !== id)
        );
    }

    function updateWorkshop(id, field, value) {
        setWorkshops((previous) =>
            previous.map((workshop) =>
                workshop.id === id
                    ? { ...workshop, [field]: value }
                    : workshop
            )
        );
    }


    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim()) {
            alert('Informe o nome do grupo.');
            return;
        }

        if (!workshops.length || workshops.some(
            (workshop) =>
                !workshop.day ||
                !workshop.startTime ||
                !workshop.endTime
        )) {
            alert('Preencha todos os dias e horários das oficinas.');
            return;
        }

        if (workshops.some(
            (workshop) => workshop.startTime >= workshop.endTime
        )) {
            alert('O horário de término deve ser posterior ao início.');
            return;
        }

        const selectedDays = workshops.map((workshop) => workshop.day);

        if (new Set(selectedDays).size !== selectedDays.length) {
            alert('Não selecione o mesmo dia mais de uma vez.');
            return;
        }

        try {
            setLoading(true);

            await createGroup({
                name,
                description,
                workshops,
            });

            navigate('/groups');
        } catch (error) {
            console.error('Erro ao cadastrar grupo:', error);
            console.error('Código:', error.code);
            console.error('Mensagem:', error.message);

            alert(`Erro ao cadastrar: ${error.code || error.message}`);
        
    } finally {
        setLoading(false);
    }
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
            <h1>Cadastrar grupo</h1>
            <p>
                Cadastre um novo grupo e configure os dias e horários
                das oficinas.
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
                        <p>Defina os dados principais do grupo.</p>
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
                        <h2>Dias e horários das oficinas</h2>
                        <p>
                            Adicione os dias e horários em que as oficinas
                            acontecem.
                        </p>
                    </div>
                </div>

                <div className="create-group-workshops">
                    {workshops.map((workshop, index) => (
                        <div className="create-group-workshop" key={workshop.id}>
                            <div className="create-group-workshop-heading">
                                <strong>Oficina {index + 1}</strong>

                                {workshops.length > 1 && (
                                    <button
                                        type="button"
                                        className="create-group-remove"
                                        onClick={() => removeWorkshop(workshop.id)}
                                        aria-label="Remover oficina"
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
                                        value={workshop.day}
                                        onChange={(event) =>
                                            updateWorkshop(
                                                workshop.id,
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
                                                disabled={workshops.some(
                                                    (other) =>
                                                        other.id !== workshop.id &&
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
                                        value={workshop.startTime}
                                        onChange={(event) =>
                                            updateWorkshop(
                                                workshop.id,
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
                                        value={workshop.endTime}
                                        onChange={(event) =>
                                            updateWorkshop(
                                                workshop.id,
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
                    disabled={workshops.length >= weekdays.length}
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
                    disabled={loading}
                >
                    {loading ? 'Cadastrando...' : 'Cadastrar grupo'}
                </button>
            </div>
        </form>
    </div>
);
}
