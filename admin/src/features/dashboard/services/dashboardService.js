
import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../../../services/firebase/firebaseConfig';

const CORES_CATEGORIAS = [
  '#6B91C8',
  '#73B9DD',
  '#AA8BC7',
  '#75A98A',
  '#D8B477',
  '#D18A8A',
];

const CORES_STATUS = {
  completed: '#65A889',
  doing: '#E9B85D',
  todo: '#A7B8C9',
};

// Converte Timestamp, Date ou número em Date.
function converterData(valor) {
  if (!valor) return null;

  if (typeof valor.toDate === 'function') {
    return valor.toDate();
  }

  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor === 'number') {
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  return null;
}

// Calcula o progresso e identifica quando o indicador foi concluído.
function calcularIndicador(indicador, registros) {
  const historico = [...registros].sort((a, b) => {
    const dataA = converterData(a.createdAt)?.getTime() || 0;
    const dataB = converterData(b.createdAt)?.getTime() || 0;

    return dataA - dataB;
  });

  const total = historico.reduce(
    (soma, registro) => soma + Number(registro.amount || 0),
    0
  );

  const meta = indicador.type === 'conclusao'
    ? 1
    : Number(indicador.target);

  const completed = Number.isFinite(meta) && meta > 0 && total >= meta;

  let completionDate = null;

  if (completed) {
    let acumulado = 0;

    for (const registro of historico) {
      acumulado += Number(registro.amount || 0);

      if (acumulado >= meta) {
        completionDate = converterData(registro.createdAt);
        break;
      }
    }
  }

  return {
    ...indicador,
    currentValue: total,
    completed,
    completionDate,
    recordsCount: historico.length,
  };
}

function gerarSemanasMesAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

  const semanas = [];

  for (let inicio = 1, numero = 1; inicio <= quantidadeDias; inicio += 7, numero++) {
    const fim = Math.min(inicio + 6, quantidadeDias);

    semanas.push({
      key: numero,
      startDay: inicio,
      endDay: fim,
      month: `Semana ${numero}`,
      created: 0,
      completed: 0,
    });
  }

  return semanas;
}



function obterNomeCategoria(tipo) {
  const nomes = {
    conclusao: 'Conclusão',
    quantidade: 'Quantidade',
    tempo: 'Tempo',
  };

  return nomes[tipo] || tipo || 'Não informado';
}

export async function buscarDadosDashboard() {
  // Buscar estudantes, grupos e indicadores.
  const [
    usuariosSnapshot,
    gruposSnapshot,
    indicadoresSnapshot,
  ] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'groups')),
    getDocs(collection(db, 'indicators')),
  ]);

  const usuarios = usuariosSnapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  const grupos = gruposSnapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  const todosIndicadores = indicadoresSnapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  // Consultar os históricos de progresso dos indicadores.
  const indicadoresComProgresso = await Promise.all(
    todosIndicadores.map(async (indicador) => {
      const progressoSnapshot = await getDocs(
        collection(db, 'indicators', indicador.id, 'progress')
      );

      const registros = progressoSnapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      return calcularIndicador(indicador, registros);
    })
  );

  // Consultar tarefas e registros de hidratação de cada estudante.
  const dadosUsuarios = await Promise.all(
    usuarios.map(async (usuario) => {
      const [tarefasSnapshot, aguaSnapshot] = await Promise.all([
        getDocs(
          collection(db, 'users', usuario.id, 'kanbanTasks')
        ),
        getDocs(
          collection(db, 'users', usuario.id, 'waterRecords')
        ),
      ]);

      const tarefas = tarefasSnapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      const registrosAgua = aguaSnapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      return {
        tarefas,
        registrosAgua,
      };
    })
  );

  // Desconsiderar indicadores arquivados nas estatísticas atuais.
  const indicadoresAtivos = indicadoresComProgresso.filter(
    (indicador) => indicador.active !== false
  );

  // Calcular status dos indicadores.
  const indicadoresConcluidos = indicadoresAtivos.filter(
    (indicador) => indicador.completed
  );

  const indicadoresEmAndamento = indicadoresAtivos.filter(
    (indicador) =>
      !indicador.completed && indicador.currentValue > 0
  );

  const indicadoresNaoIniciados = indicadoresAtivos.filter(
    (indicador) =>
      !indicador.completed && indicador.currentValue <= 0
  );

  const status = [
    {
      name: 'Concluídos',
      value: indicadoresConcluidos.length,
      color: CORES_STATUS.completed,
    },
    {
      name: 'Em andamento',
      value: indicadoresEmAndamento.length,
      color: CORES_STATUS.doing,
    },
    {
      name: 'Não iniciados',
      value: indicadoresNaoIniciados.length,
      color: CORES_STATUS.todo,
    },
  ];

  // Calcular tarefas do Kanban.
  const todasTarefas = dadosUsuarios.flatMap(
    (usuario) => usuario.tarefas
  );

  const tarefasAtivas = todasTarefas.filter(
    (tarefa) => !tarefa.archivedAt
  );

  const atividadesConcluidas = tarefasAtivas.filter(
    (tarefa) => tarefa.status === 'done'
  ).length;

  // Contar registros de hidratação.
  const registrosAgua = dadosUsuarios.flatMap(
    (usuario) => usuario.registrosAgua
  );

  // Preparar evolução mensal.
  // Preparar evolução semanal do mês atual.
const monthlyData = gerarSemanasMesAtual();

const hoje = new Date();
const anoAtual = hoje.getFullYear();
const mesAtual = hoje.getMonth();

// Contabilizar indicadores criados em cada semana.
todosIndicadores.forEach((indicador) => {
  const data = converterData(indicador.createdAt);

  if (
    !data ||
    data.getFullYear() !== anoAtual ||
    data.getMonth() !== mesAtual
  ) {
    return;
  }

  const semana = monthlyData.find(
    (item) =>
      data.getDate() >= item.startDay &&
      data.getDate() <= item.endDay
  );

  if (semana) {
    semana.created++;
  }
});

// Contabilizar indicadores concluídos em cada semana.
indicadoresComProgresso.forEach((indicador) => {
  const data = indicador.completionDate;

  if (
    !indicador.completed ||
    !data ||
    data.getFullYear() !== anoAtual ||
    data.getMonth() !== mesAtual
  ) {
    return;
  }

  const semana = monthlyData.find(
    (item) =>
      data.getDate() >= item.startDay &&
      data.getDate() <= item.endDay
  );

  if (semana) {
    semana.completed++;
  }
});
 

  // Agrupar indicadores por tipo.
  const categoriasAgrupadas = {};

  indicadoresAtivos.forEach((indicador) => {
    const nome = obterNomeCategoria(indicador.type);

    categoriasAgrupadas[nome] =
      (categoriasAgrupadas[nome] || 0) + 1;
  });

  const categories = Object.entries(categoriasAgrupadas)
    .map(([name, value], index) => ({
      name,
      value,
      color: CORES_CATEGORIAS[
        index % CORES_CATEGORIAS.length
      ],
    }))
    .sort((a, b) => b.value - a.value);

  // Bem-estar: sono e humor serão integrados quando
  // suas respectivas coleções estiverem disponíveis.
  const wellbeing = [
    {
      name: 'Hidratação',
      value: registrosAgua.length,
      color: '#75BDF8',
      icon: '💧',
    },
    {
      name: 'Sono',
      value: 0,
      color: '#B38BCB',
      icon: '🌙',
    },
    {
      name: 'Humor',
      value: 0,
      color: '#E6B85C',
      icon: '😊',
    },
  ];

  const totalBemEstar = wellbeing.reduce(
    (total, item) => total + item.value,
    0
  );

  const wellbeingComPercentual = wellbeing.map((item) => ({
    ...item,
    percentage: totalBemEstar > 0
      ? Math.round((item.value / totalBemEstar) * 100)
      : 0,
  }));

  const totalIndicadores = indicadoresAtivos.length;
  const totalConcluidos = indicadoresConcluidos.length;

  // Cards principais.
  const cards = [
    {
      title: 'Estudantes cadastrados',
      value: usuarios.length,
      detail: 'Total de estudantes cadastrados',
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Grupos cadastrados',
      value: grupos.length,
      detail: 'Total de grupos existentes',
      icon: '🏫',
      color: 'purple',
    },
    {
      title: 'Indicadores criados',
      value: totalIndicadores,
      detail: 'Indicadores ativos',
      icon: '🎯',
      color: 'orange',
    },
    {
      title: 'Indicadores completos',
      value: totalConcluidos,
      detail: totalIndicadores > 0
        ? `${((totalConcluidos / totalIndicadores) * 100).toFixed(1).replace('.', ',')}% de conclusão`
        : 'Nenhum indicador cadastrado',
      icon: '✓',
      color: 'green',
    },
    {
      title: 'Atividades concluídas',
      value: atividadesConcluidas,
      detail: 'Tarefas concluídas no Kanban',
      icon: '📋',
      color: 'blue',
    },
    {
      title: 'Registros de bem-estar',
      value: totalBemEstar,
      detail: 'Registros de hidratação disponíveis',
      icon: '💚',
      color: 'pink',
    },
  ];

  return {
    cards,
    monthlyData,
    categories,
    wellbeing: wellbeingComPercentual,
    status,
    totalIndicators: totalIndicadores,
  };
}
