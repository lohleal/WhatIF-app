
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase/firebaseConfig';

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
  // Aceita minutos fracionados para preservar segundos (ex.: 0,1667 min = 10 s).
  const totalSegundos = Math.max(0, Math.round(Number(minutos || 0) * 60));
  const horas = Math.floor(totalSegundos / 3600);
  const minutosInteiros = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  if (horas > 0) {
    return segundos > 0
      ? `${horas}h ${minutosInteiros}min ${segundos}s`
      : minutosInteiros > 0
        ? `${horas}h ${minutosInteiros}min`
        : `${horas}h`;
  }

  if (minutosInteiros > 0) {
    return segundos > 0
      ? `${minutosInteiros}min ${segundos}s`
      : `${minutosInteiros}min`;
  }

  return `${segundos}s`;
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
  const [uidAtual, setUidAtual] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const configuracaoCarregada = useRef(false);
  const ultimaConfiguracaoSincronizada = useRef(null);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuario) => {
      setUidAtual(usuario?.uid ?? null);
      setCarregandoAuth(false);
    });

    return cancelar;
  }, []);

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
  // SINCRONIZAÇÃO COM FIRESTORE
  // ------------------------------

  useEffect(() => {
    if (carregandoAuth) return undefined;

    configuracaoCarregada.current = false;
    ultimaConfiguracaoSincronizada.current = null;

    if (!uidAtual) {
      setRegistros([]);
      setAtividades([]);
      setMeta('120');
      setMetaEditavel('120');
      setCategorias(CATEGORIAS_PADRAO);
      setSessaoAtiva(null);
      setCarregandoDados(false);
      return undefined;
    }

    setCarregandoDados(true);
    setRegistros([]);
    setAtividades([]);
    setMeta('120');
    setMetaEditavel('120');
    setCategorias(CATEGORIAS_PADRAO);
    setSessaoAtiva(null);

    const cancelarRegistros = onSnapshot(
      collection(db, 'users', uidAtual, 'studyRecords'),
      (snapshot) => {
        setRegistros(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setCarregandoDados(false);
      },
      (error) => {
        console.error('[Estudos] Erro ao carregar registros:', error);
        setMensagem('Não foi possível carregar os registros de estudo.');
        setCarregandoDados(false);
      }
    );

    const cancelarAtividades = onSnapshot(
      collection(db, 'users', uidAtual, 'studyActivities'),
      (snapshot) => {
        setAtividades(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => {
        console.error('[Estudos] Erro ao carregar atividades:', error);
        setMensagem('Não foi possível carregar as atividades.');
      }
    );

    const cancelarConfiguracoes = onSnapshot(
      doc(db, 'users', uidAtual, 'studySettings', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          const dados = snapshot.data();
          const metaSalva = String(dados.meta ?? '120');
          const categoriasSalvas =
            Array.isArray(dados.categorias) && dados.categorias.length
              ? dados.categorias
              : CATEGORIAS_PADRAO;
          const sessaoSalva = dados.sessaoAtiva ?? null;

          ultimaConfiguracaoSincronizada.current = JSON.stringify({
            meta: metaSalva,
            categorias: categoriasSalvas,
            sessaoAtiva: sessaoSalva,
          });

          setMeta(metaSalva);
          setMetaEditavel(metaSalva);
          setCategorias(categoriasSalvas);
          setSessaoAtiva(sessaoSalva);
        }
        configuracaoCarregada.current = true;
      },
      (error) => {
        console.error('[Estudos] Erro ao carregar configurações:', error);
        setMensagem('Não foi possível carregar as configurações de estudo.');
        configuracaoCarregada.current = true;
      }
    );

    return () => {
      cancelarRegistros();
      cancelarAtividades();
      cancelarConfiguracoes();
      configuracaoCarregada.current = false;
    };
  }, [uidAtual, carregandoAuth]);

  useEffect(() => {
    if (!uidAtual || !configuracaoCarregada.current) return;

    const configuracaoAtual = JSON.stringify({ meta, categorias, sessaoAtiva });
    if (configuracaoAtual === ultimaConfiguracaoSincronizada.current) return;

    ultimaConfiguracaoSincronizada.current = configuracaoAtual;
    setDoc(
      doc(db, 'users', uidAtual, 'studySettings', 'main'),
      { meta, categorias, sessaoAtiva },
      { merge: true }
    ).catch((error) => {
      ultimaConfiguracaoSincronizada.current = null;
      console.error('[Estudos] Erro ao salvar configurações:', error);
    });
  }, [uidAtual, meta, categorias, sessaoAtiva]);

  function salvarRegistroNoFirestore(registro) {
    if (!uidAtual) return;
    setDoc(
      doc(db, 'users', uidAtual, 'studyRecords', String(registro.id)),
      registro
    ).catch((error) => {
      console.error('[Estudos] Erro ao salvar registro:', error);
      setMensagem('Não foi possível salvar o registro na nuvem.');
    });
  }

  function salvarAtividadeNoFirestore(atividade) {
    if (!uidAtual) return;
    setDoc(
      doc(db, 'users', uidAtual, 'studyActivities', String(atividade.id)),
      atividade
    ).catch((error) => {
      console.error('[Estudos] Erro ao salvar atividade:', error);
      setMensagem('Não foi possível salvar a atividade na nuvem.');
    });
  }

  // ------------------------------
  // CÁLCULOS
  // ------------------------------

  const metaMinutos = Math.max(0, Number(meta) || 0);

  const registrosHoje = registros.filter(
    (registro) => registro.data === hoje
  );

  const minutosHoje = registrosHoje.reduce(
    (total, registro) =>
      total + (Number.isFinite(registro.segundos)
        ? registro.segundos / 60
        : registro.minutos),
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
    (total, registro) =>
      total + (Number.isFinite(registro.segundos)
        ? registro.segundos / 60
        : registro.minutos),
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

  function adicionarRegistroSegundos(segundos, nomeMateria, inicio, fim) {
    const duracaoSegundos = Math.floor(Number(segundos));

    if (!Number.isFinite(duracaoSegundos) || duracaoSegundos <= 0) {
      setMensagem('Informe um tempo de estudo maior que zero.');
      return false;
    }

    const registro = {
      id: `${Date.now()}-${Math.random()}`,
      materia: nomeMateria,
      segundos: duracaoSegundos,
      // Mantém minutos como valor fracionado para compatibilidade com metas e telas existentes.
      minutos: duracaoSegundos / 60,
      data: dataLocal(new Date(fim)),
      inicio,
      fim,
    };

    setRegistros((anteriores) => [registro, ...anteriores]);
    salvarRegistroNoFirestore(registro);
    setMensagem('Registro de estudo adicionado!');
    setMinutosManuais('');
    return true;
  }

  function adicionarRegistro(minutos, nomeMateria, inicio, fim) {
    const duracao = Number(minutos);

    if (!Number.isFinite(duracao) || duracao <= 0) {
      setMensagem('Informe um tempo de estudo maior que zero.');
      return false;
    }

    return adicionarRegistroSegundos(
      Math.round(duracao * 60),
      nomeMateria,
      inicio,
      fim
    );
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
  const agora = new Date().toISOString();

  setSessaoAtiva({
    materia,
    inicioOriginal: agora,
    inicioTrecho: agora,
    tempoAcumulado: 0,
    pausadaEm: null,
  });

  setMensagem('Sessão iniciada. Bons estudos!');
}

function pausarSessao() {
  if (!sessaoAtiva || sessaoAtiva.pausadaEm) return;

  setSessaoAtiva((anterior) => ({
    ...anterior,
    tempoAcumulado:
      anterior.tempoAcumulado +
      (Date.now() - new Date(anterior.inicioTrecho).getTime()),
    inicioTrecho: null,
    pausadaEm: new Date().toISOString(),
  }));

  setMensagem('Sessão pausada. Descanse um pouco!');
}

function continuarSessao() {
  if (!sessaoAtiva || !sessaoAtiva.pausadaEm) return;

  setSessaoAtiva((anterior) => ({
    ...anterior,
    inicioTrecho: new Date().toISOString(),
    pausadaEm: null,
  }));

  setMensagem('Sessão retomada. Bons estudos!');
}

function finalizarSessao() {
  if (!sessaoAtiva) {
    return false;
  }

  const agora = Date.now();

  const tempoTotal =
    sessaoAtiva.tempoAcumulado +
    (sessaoAtiva.inicioTrecho
      ? agora - new Date(sessaoAtiva.inicioTrecho).getTime()
      : 0);

  // Não registra duração zero ou valores inválidos.
  if (!Number.isFinite(tempoTotal) || tempoTotal <= 0) {
    setMensagem('A sessão precisa ter algum tempo de duração.');
    return false;
  }

  // Registra o tempo real em segundos, sem arredondar para minutos.
  // Ex.: 10 segundos são armazenados como 10 segundos.
  const segundos = Math.floor(tempoTotal / 1000);

  const registrado = adicionarRegistroSegundos(
    segundos,
    sessaoAtiva.materia,
    sessaoAtiva.inicioOriginal,
    new Date(agora).toISOString()
  );

  if (!registrado) {
    return false;
  }

  // Encerra a sessão somente depois de adicionar o registro.
  setSessaoAtiva(null);
  return true;
}



  function excluirRegistro(id) {
    setRegistros((anteriores) =>
      anteriores.filter((registro) => registro.id !== id)
    );

    if (uidAtual) {
      deleteDoc(doc(db, 'users', uidAtual, 'studyRecords', String(id)))
        .catch((error) => {
          console.error('[Estudos] Erro ao excluir registro:', error);
          setMensagem('Não foi possível excluir o registro na nuvem.');
        });
    }

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
    setMetaEditavel(String(valor));
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
      salvarAtividadeNoFirestore(atividade);

      setMensagem('Atividade atualizada!');
    } else {
      setAtividades((anteriores) => [
        ...anteriores,
        atividade,
      ]);
      salvarAtividadeNoFirestore(atividade);

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

    if (uidAtual) {
      deleteDoc(doc(db, 'users', uidAtual, 'studyActivities', String(id)))
        .catch((error) => {
          console.error('[Estudos] Erro ao excluir atividade:', error);
          setMensagem('Não foi possível excluir a atividade na nuvem.');
        });
    }

    setMensagem('Atividade excluída.');
  }

  function alterarStatus(id, status) {
    const atividade = atividades.find((item) => item.id === id);
    if (!atividade) return;

    const atualizado = { ...atividade, status };
    setAtividades((anteriores) =>
      anteriores.map((item) => item.id === id ? atualizado : item)
    );
    salvarAtividadeNoFirestore(atualizado);
  }

  // ------------------------------
  // VALORES COMPARTILHADOS
  // ------------------------------

  const valor = {
    hoje,
    carregandoDados,

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
    adicionarRegistroSegundos,
    adicionarTempoManual,
    iniciarSessao,
    pausarSessao,
    continuarSessao,
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
