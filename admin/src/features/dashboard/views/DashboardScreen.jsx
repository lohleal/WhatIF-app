
import './DashboardScreen.css';

export default function DashboardScreen() {
  return (
    <div className="dashboard-screen">
      <div className="dashboard-heading">
        <div>
          <h1>Meu Dashboard</h1>
          <p>
            Acompanhe o bem-estar dos estudantes e as
            atividades da escola.
          </p>
        </div>

        <button className="dashboard-button">
          + Novo registro
        </button>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span>Estudantes ativos</span>
          <strong>--</strong>
        </div>

        <div className="dashboard-card">
          <span>Grupos cadastrados</span>
          <strong>--</strong>
        </div>

        <div className="dashboard-card">
          <span>Atividades concluídas</span>
          <strong>--</strong>
        </div>

        <div className="dashboard-card">
          <span>Registros de bem-estar</span>
          <strong>--</strong>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h2>Bem-vindo ao WHAT IF APP Admin!</h2>
        <p>
          Aqui você poderá acompanhar os indicadores
          e o desenvolvimento dos estudantes.
        </p>
      </div>
    </div>
  );
}
