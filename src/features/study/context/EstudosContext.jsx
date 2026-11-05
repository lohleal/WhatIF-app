
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

const EstudosContext = createContext(null);

// ------------------------------
// CONSTANTES
// ------------------------------

export const CATEGORIAS_PADRAO = [
  'Prova',
  'Trabalho',
  'Slides',
  'Seminário',
  'Lista de exercícios',
];

export const MATERIAS = [
  'Matemática',
  'Português',
  'Biologia',
  'Química',
  'Física',
  'História',
  'Geografia',
  'Informática',
  'Inglês',
  'Outra',
];

// ------------------------------
// FUNÇÕES AUXILIARES
// ------------------------------

export function dataLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export function formatarData(data) {
  if (!data) return '';

  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatarTempo(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas}h`;

  return `${horas}h ${resto}min`;
}

export function inicioDaSemana(data = new Date()) {
  const inicio = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  );

  const diaSemana = inicio.getDay();
  const diferenca = diaSemana === 0 ? 6 : diaSemana - 1;

  inicio.setDate(inicio.getDate() - diferenca);

  return dataLocal(inicio);
}

// ------------------------------
// PROVIDER
// ------------------------------

export function EstudosProvider({ children }) {
  const hoje = dataLocal();

  // Registros e meta
  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState('120');
  const [metaEditavel, setMetaEditavel] = useState('120');

  // Registro de estudo
  const [materia, setMateria] = useState('Matemática');
  const [materiaManual, setMateriaManual] = useState('Matemática');
  const [minutosManuais, setMinutosManuais] = useState('');
  const [sessaoAtiva, setSessaoAtiva] = useState(null);

  // Categorias e atividades
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [campoDataAberto, setCampoDataAberto] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [atividades, setAtividades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [formAtividade, setFormAtividade] = useState({
    nome: '',
    materia: '',
    descricao: '',
    professor: '',
    dataInicio: dataLocal(),
    dataEntrega: '',
    status: 'Pendente',
  });

  // Histórico
  const [periodo, setPeriodo] = useState('dia');

  // Mensagens
  const [mensagem, setMensagem] = useState('');

  // ------------------------------
  // CÁLCULOS
  // ------------------------------

  const metaMinutos = Math.max(0, Number(meta) || 0);

  const registrosHoje = registros.filter(
    (registro) => registro.data === hoje
  );

  const minutosHoje = registrosHoje.reduce(
    (total, registro) => total + registro.minutos,
    0
  );

  const progresso = metaMinutos > 0
    ? Math.min(100, Math.round((minutosHoje / metaMinutos) * 100))
    : 0;

  const atividadesPendentes = atividades.filter(
    (item) => item.status !== 'Concluída'
  ).length;

  const atividadesConcluidas = atividades.filter(
    (item) => item.status === 'Concluída'
  ).length;

  const atividadesFiltradas = atividades
    .filter(
      (item) =>
        filtroCategoria === 'Todas' ||
        item.categoria === filtroCategoria
    )
    .filter(
      (item) =>
        filtroStatus === 'Todos' ||
        item.status === filtroStatus
    )
    .sort((a, b) => {
      if (a.status === 'Concluída' && b.status !== 'Concluída') {
        return 1;
      }

      if (a.status !== 'Concluída' && b.status === 'Concluída') {
        return -1;
      }

      return a.dataEntrega.localeCompare(b.dataEntrega);
    });

  const registrosFiltrados = registros
    .filter((registro) => {
      if (periodo === 'dia') {
        return registro.data === hoje;
      }

      if (periodo === 'semana') {
        return registro.data >= inicioDaSemana();
      }

      return registro.data.slice(0, 7) === hoje.slice(0, 7);
    })
    .sort(
      (a, b) => new Date(b.fim) - new Date(a.fim)
    );

  const totalPeriodo = registrosFiltrados.reduce(
    (total, registro) => total + registro.minutos,
    0
  );

  const tituloPeriodo = {
    dia: 'Registros de hoje',
    semana: 'Registros desta semana',
    mes: 'Registros deste mês',
  };

  // ------------------------------
  // REGISTROS DE ESTUDO
  // ------------------------------

  function adicionarRegistro(minutos, nomeMateria, inicio, fim) {
    const duracao = Number(minutos);

    if (!Number.isFinite(duracao) || duracao <= 0) {
      setMensagem('Informe um tempo de estudo maior que zero.');
      return;
    }

    const registro = {
      id: `${Date.now()}-${Math.random()}`,
      materia: nomeMateria,
      minutos: Math.round(duracao),
      data: dataLocal(new Date(fim)),
      inicio,
      fim,
    };

    setRegistros((anteriores) => [registro, ...anteriores]);
    setMensagem('Registro de estudo adicionado!');
    setMinutosManuais('');
  }

  function adicionarTempoManual() {
    const minutos = Number(minutosManuais);

    if (
      minutosManuais.trim() === '' ||
      !Number.isFinite(minutos) ||
      minutos <= 0
    ) {
      setMensagem('Digite uma quantidade válida de minutos.');
      return;
    }

    const fim = new Date();
    const inicio = new Date(
      fim.getTime() - Math.round(minutos) * 60000
    );

    adicionarRegistro(
      minutos,
      materiaManual,
      inicio.toISOString(),
      fim.toISOString()
    );
  }

  function iniciarSessao() {
    setSessaoAtiva({
      materia,
      inicio: new Date().toISOString(),
    });

    setMensagem('Sessão iniciada. Bons estudos!');
  }

  function finalizarSessao() {
    if (!sessaoAtiva) return;

    const fim = new Date();
    const inicio = new Date(sessaoAtiva.inicio);

    const minutos = Math.floor(
      (fim.getTime() - inicio.getTime()) / 60000
    );

    if (minutos < 1) {
      setMensagem(
        'A sessão durou menos de um minuto e não foi registrada. Tente novamente após um minuto.'
      );
      return;
    }

    adicionarRegistro(
      minutos,
      sessaoAtiva.materia,
      sessaoAtiva.inicio,
      fim.toISOString()
    );

    setSessaoAtiva(null);
  }

  function excluirRegistro(id) {
    setRegistros((anteriores) =>
      anteriores.filter((registro) => registro.id !== id)
    );

    setMensagem('Registro excluído.');
  }

  // ------------------------------
  // META DIÁRIA
  // ------------------------------

  function salvarMeta() {
    const valor = Number(metaEditavel);

    if (
      metaEditavel.trim() === '' ||
      !Number.isFinite(valor) ||
      valor < 1 ||
      !Number.isInteger(valor)
    ) {
      setMensagem(
        'Defina uma meta em minutos, usando um número inteiro maior que zero.'
      );
      return;
    }

    setMeta(String(valor));
    setMensagem('Meta diária atualizada!');
  }

  // ------------------------------
  // CATEGORIAS
  // ------------------------------

  function adicionarCategoria() {
    const nome = novaCategoria.trim();

    if (!nome) {
      setMensagem('Digite o nome da categoria.');
      return;
    }

    const existe = categorias.some(
      (item) => item.toLowerCase() === nome.toLowerCase()
    );

    if (existe) {
      setMensagem('Essa categoria já existe.');
      return;
    }

    setCategorias((anteriores) => [...anteriores, nome]);
    setCategoriaSelecionada(nome);
    setFiltroCategoria(nome);
    setNovaCategoria('');
    setMostrarNovaCategoria(false);
    setMensagem('Categoria criada!');
  }

  // ------------------------------
  // ATIVIDADES
  // ------------------------------

  function atualizarCampoAtividade(campo, valor) {
    setFormAtividade((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function abrirCalendario(campo) {
    setCampoDataAberto(campo);
  }

  function alterarData(event, dataSelecionada) {
    if (
      event.type === 'set' &&
      dataSelecionada &&
      campoDataAberto
    ) {
      atualizarCampoAtividade(
        campoDataAberto,
        dataLocal(dataSelecionada)
      );
    }

    setCampoDataAberto(null);
  }

  function converterDataParaDate(valor) {
    if (!valor) return new Date();

    const [ano, mes, dia] = valor.split('-').map(Number);

    return new Date(ano, mes - 1, dia, 12);
  }

  function limparFormularioAtividade() {
    setFormAtividade({
      nome: '',
      materia: '',
      descricao: '',
      professor: '',
      dataInicio: dataLocal(),
      dataEntrega: '',
      status: 'Pendente',
    });

    setCategoriaSelecionada('');
    setEditandoId(null);
  }

  function salvarAtividade() {
    const {
      nome,
      materia,
      descricao,
      professor,
      dataInicio,
      dataEntrega,
      status,
    } = formAtividade;

    if (
      !nome.trim() ||
      !materia.trim() ||
      !descricao.trim() ||
      !professor.trim() ||
      !dataInicio.trim() ||
      !dataEntrega.trim() ||
      !categoriaSelecionada
    ) {
      setMensagem('Preencha os campos e selecione uma categoria.');
      return;
    }

    const dataValida = (valor) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

      const [ano, mes, dia] = valor.split('-').map(Number);
      const data = new Date(ano, mes - 1, dia);

      return (
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia
      );
    };

    if (!dataValida(dataInicio) || !dataValida(dataEntrega)) {
      setMensagem(
        'Informe datas válidas no formato AAAA-MM-DD (ex.: 2026-11-03).'
      );
      return;
    }

    if (dataEntrega < dataInicio) {
      setMensagem(
        'A data de entrega não pode ser anterior à data de início.'
      );
      return;
    }

    const atividade = {
      id: editandoId || `${Date.now()}-${Math.random()}`,
      nome: nome.trim(),
      materia: materia.trim(),
      descricao: descricao.trim(),
      professor: professor.trim(),
      dataInicio,
      dataEntrega,
      categoria: categoriaSelecionada,
      status,
    };

    if (editandoId) {
      setAtividades((anteriores) =>
        anteriores.map((item) =>
          item.id === editandoId ? atividade : item
        )
      );

      setMensagem('Atividade atualizada!');
    } else {
      setAtividades((anteriores) => [
        ...anteriores,
        atividade,
      ]);

      setMensagem('Atividade cadastrada!');
    }

    limparFormularioAtividade();
  }

  function editarAtividade(item) {
    setFormAtividade({
      nome: item.nome,
      materia: item.materia,
      descricao: item.descricao,
      professor: item.professor,
      dataInicio: item.dataInicio,
      dataEntrega: item.dataEntrega,
      status: item.status,
    });

    setCategoriaSelecionada(item.categoria);
    setEditandoId(item.id);
  }

  function excluirAtividade(id) {
    setAtividades((anteriores) =>
      anteriores.filter((item) => item.id !== id)
    );

    setMensagem('Atividade excluída.');
  }

  function alterarStatus(id, status) {
    setAtividades((anteriores) =>
      anteriores.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  // ------------------------------
  // VALORES COMPARTILHADOS
  // ------------------------------

  const valor = {
    hoje,

    registros,
    setRegistros,
    registrosHoje,
    minutosHoje,
    meta,
    setMeta,
    metaEditavel,
    setMetaEditavel,
    metaMinutos,
    progresso,

    materia,
    setMateria,
    materiaManual,
    setMateriaManual,
    minutosManuais,
    setMinutosManuais,
    sessaoAtiva,
    setSessaoAtiva,

    categorias,
    novaCategoria,
    setNovaCategoria,
    mostrarNovaCategoria,
    setMostrarNovaCategoria,
    campoDataAberto,
    setCampoDataAberto,
    categoriaSelecionada,
    setCategoriaSelecionada,
    filtroCategoria,
    setFiltroCategoria,
    filtroStatus,
    setFiltroStatus,
    atividades,
    atividadesFiltradas,
    atividadesPendentes,
    atividadesConcluidas,
    editandoId,
    formAtividade,
    setFormAtividade,

    periodo,
    setPeriodo,
    registrosFiltrados,
    totalPeriodo,
    tituloPeriodo,

    mensagem,
    setMensagem,

    adicionarRegistro,
    adicionarTempoManual,
    iniciarSessao,
    finalizarSessao,
    excluirRegistro,
    salvarMeta,

    adicionarCategoria,
    atualizarCampoAtividade,
    abrirCalendario,
    alterarData,
    converterDataParaDate,
    limparFormularioAtividade,
    salvarAtividade,
    editarAtividade,
    excluirAtividade,
    alterarStatus,
  };

  return (
    <EstudosContext.Provider value={valor}>
      {children}
    </EstudosContext.Provider>
  );
}

// ------------------------------
// HOOK PARA ACESSAR O CONTEXTO
// ------------------------------

export function useEstudos() {
  const contexto = useContext(EstudosContext);

  if (!contexto) {
    throw new Error(
      'useEstudos deve ser utilizado dentro de EstudosProvider.'
    );
  }

  return contexto;
}
