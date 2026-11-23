
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
} from 'firebase/firestore';

import { auth, db } from '../../../services/firebase/firebaseConfig';
import { useEstudos } from '../../../features/study/context/EstudosContext';

const COLORS = {
  primary: '#378568',
  dark: '#285B49',
  light: '#EAF5EF',
  background: '#F7FAF8',
  white: '#FFFFFF',
  text: '#26352A',
  muted: '#819087',
  border: '#E1EAE4',
  water: '#75BDF8',
  sleep: '#A985C5',
  mood: '#E6A64D',
  study: '#378568',
};

const PERIODOS = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mês', value: 'mes' },
];

function dataLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function converterData(valor) {
  if (!valor) return null;

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }

  if (typeof valor?.toDate === 'function') {
    return valor.toDate();
  }

  if (typeof valor === 'number') {
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  if (typeof valor === 'string') {
    const somenteData = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (somenteData) {
      const data = new Date(
        Number(somenteData[1]),
        Number(somenteData[2]) - 1,
        Number(somenteData[3])
      );
      return Number.isNaN(data.getTime()) ? null : data;
    }

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  return null;
}

function formatarLitros(ml) {
  return (ml / 1000).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  });
}

function formatarDuracao(minutos) {
  const total = Math.max(0, Math.round(minutos || 0));
  const horas = Math.floor(total / 60);
  const mins = total % 60;

  if (horas > 0 && mins > 0) return `${horas}h ${mins}min`;
  if (horas > 0) return `${horas}h`;
  return `${mins}min`;
}

function obterQuantidadeDias(periodo) {
  if (periodo === 'hoje') return 1;
  if (periodo === 'semana') return 7;
  return 30;
}

function obterDatasPeriodo(periodo) {
  const hoje = inicioDoDia(new Date());
  const quantidade = obterQuantidadeDias(periodo);

  return Array.from({ length: quantidade }, (_, index) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (quantidade - 1 - index));
    return data;
  });
}

function formatarDia(data) {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function agruparPorData(registros, obterData, obterValor, datas) {
  return datas.map((data) => {
    const chave = dataLocal(data);

    const total = registros.reduce((soma, registro) => {
      const dataRegistro = obterData(registro);

      if (!dataRegistro || dataLocal(dataRegistro) !== chave) {
        return soma;
      }

      return soma + Number(obterValor(registro) || 0);
    }, 0);

    return {
      data: chave,
      label: formatarDia(data),
      valor: total,
    };
  });
}

// No período mensal, reúne os registros em blocos de até sete dias.
function agruparDadosPorSemana(dadosDiarios, datas) {
  const valoresPorData = new Map(
    dadosDiarios.map((item) => [item.data, Number(item.valor) || 0])
  );

  const semanas = [];

  for (let inicio = 0; inicio < datas.length; inicio += 7) {
    const diasDaSemana = datas.slice(inicio, inicio + 7);
    const primeiroDia = diasDaSemana[0];
    const ultimoDia = diasDaSemana[diasDaSemana.length - 1];

    const total = diasDaSemana.reduce(
      (soma, dia) => soma + (valoresPorData.get(dataLocal(dia)) || 0),
      0
    );

    semanas.push({
      label: `${formatarDia(primeiroDia)}–${formatarDia(ultimoDia)}`,
      valor: total,
    });
  }

  return semanas;
}

export default function Relatorios() {
  const { registros: registrosEstudo, carregandoDados } = useEstudos();

  const [periodo, setPeriodo] = useState('semana');

  const [registrosAgua, setRegistrosAgua] = useState([]);
  const [metaAgua, setMetaAgua] = useState(2000);
  const [registrosSono, setRegistrosSono] = useState([]);
  const [registrosHumor, setRegistrosHumor] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  // Busca os dados do estudante autenticado.
  useEffect(() => {
    let cancelamentos = [];
    let ativo = true;

    const cancelarAuth = onAuthStateChanged(auth, (usuario) => {
      cancelamentos.forEach((cancelar) => cancelar());
      cancelamentos = [];

      if (!usuario) {
        setRegistrosAgua([]);
        setRegistrosSono([]);
        setRegistrosHumor([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(false);

      const uid = usuario.uid;

      const aguaRef = collection(db, 'users', uid, 'waterRecords');
      const objetivoRef = doc(
        db,
        'users',
        uid,
        'waterObjectives',
        'objective'
      );
      const sonoRef = collection(db, 'users', uid, 'sleepRecords');
      const humorRef = collection(db, 'users', uid, 'moodRecords');

      let carregamentosConcluidos = 0;

      function concluirCarregamento() {
        carregamentosConcluidos += 1;

        if (ativo && carregamentosConcluidos >= 4) {
          setCarregando(false);
        }
      }

      cancelamentos.push(
        onSnapshot(
          aguaRef,
          (snapshot) => {
            if (!ativo) return;

            setRegistrosAgua(
              snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }))
            );

            concluirCarregamento();
          },
          (error) => {
            console.error('[Relatórios] Erro ao carregar água:', error);
            if (ativo) {
              setErro(true);
              concluirCarregamento();
            }
          }
        )
      );

      cancelamentos.push(
        onSnapshot(
          objetivoRef,
          (snapshot) => {
            if (!ativo) return;

            if (snapshot.exists()) {
              const objetivo = Number(snapshot.data().dailyGoalMl);

              if (Number.isFinite(objetivo) && objetivo > 0) {
                setMetaAgua(objetivo);
              }
            }

            concluirCarregamento();
          },
          (error) => {
            console.error('[Relatórios] Erro ao carregar objetivo:', error);
            if (ativo) concluirCarregamento();
          }
        )
      );

      cancelamentos.push(
        onSnapshot(
          sonoRef,
          (snapshot) => {
            if (!ativo) return;

            setRegistrosSono(
              snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }))
            );

            concluirCarregamento();
          },
          (error) => {
            console.error('[Relatórios] Erro ao carregar sono:', error);
            if (ativo) {
              setErro(true);
              concluirCarregamento();
            }
          }
        )
      );

      cancelamentos.push(
        onSnapshot(
          humorRef,
          (snapshot) => {
            if (!ativo) return;

            setRegistrosHumor(
              snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }))
            );

            concluirCarregamento();
          },
          (error) => {
            console.error('[Relatórios] Erro ao carregar humor:', error);
            if (ativo) {
              setErro(true);
              concluirCarregamento();
            }
          }
        )
      );
    });

    return () => {
      ativo = false;
      cancelarAuth();
      cancelamentos.forEach((cancelar) => cancelar());
    };
  }, []);

  const datasPeriodo = useMemo(
    () => obterDatasPeriodo(periodo),
    [periodo]
  );

  const dataInicial = datasPeriodo[0];
  const dataFinal = datasPeriodo[datasPeriodo.length - 1];

  function estaNoPeriodo(data) {
    if (!data) return false;

    const dia = inicioDoDia(data).getTime();

    return (
      dia >= dataInicial.getTime() &&
      dia <= dataFinal.getTime()
    );
  }

  // Hidratação
  const aguaFiltrada = useMemo(() => {
    return registrosAgua.filter((registro) => {
      const data = converterData(registro.consumedAt);
      return estaNoPeriodo(data);
    });
  }, [registrosAgua, periodo]);

  const totalAgua = aguaFiltrada.reduce(
    (total, registro) => total + Number(registro.amountMl || 0),
    0
  );

  const metaPeriodoAgua = metaAgua * obterQuantidadeDias(periodo);

  const percentualAgua = metaPeriodoAgua > 0
    ? Math.round((totalAgua / metaPeriodoAgua) * 100)
    : 0;

  const dadosAgua = useMemo(() => {
    if (periodo === 'hoje') {
      return Array.from({ length: 6 }, (_, index) => {
        const horaInicial = index * 4;

        const total = aguaFiltrada.reduce((soma, registro) => {
          const data = converterData(registro.consumedAt);

          if (
            !data ||
            data.getHours() < horaInicial ||
            data.getHours() >= horaInicial + 4
          ) {
            return soma;
          }

          return soma + Number(registro.amountMl || 0);
        }, 0);

        return {
          label: `${String(horaInicial).padStart(2, '0')}h`,
          valor: total,
        };
      });
    }

    return agruparPorData(
      aguaFiltrada,
      (registro) => converterData(registro.consumedAt),
      (registro) => registro.amountMl,
      datasPeriodo
    );
  }, [aguaFiltrada, datasPeriodo, periodo]);

  // Sono
  const sonoFiltrado = useMemo(() => {
    return registrosSono.filter((registro) => {
      const data = converterData(registro.fim);
      return estaNoPeriodo(data);
    });
  }, [registrosSono, periodo]);

  const totalSono = sonoFiltrado.reduce(
    (total, registro) => total + Number(registro.duracaoMinutos || 0),
    0
  );

  const mediaSono = sonoFiltrado.length > 0
    ? Math.round(totalSono / sonoFiltrado.length)
    : 0;

  const dadosSono = useMemo(() => {
    return agruparPorData(
      sonoFiltrado,
      (registro) => converterData(registro.fim),
      (registro) => registro.duracaoMinutos,
      datasPeriodo
    );
  }, [sonoFiltrado, datasPeriodo]);

  // Humor
  const humorFiltrado = useMemo(() => {
    return registrosHumor.filter((registro) => {
      const data = registro.timestamp
        ? new Date(Number(registro.timestamp))
        : converterData(registro.dateKey);

      return estaNoPeriodo(data);
    });
  }, [registrosHumor, periodo]);

  const frequenciaHumor = useMemo(() => {
    const frequencia = {};

    humorFiltrado.forEach((registro) => {
      const lista = Array.isArray(registro.moods)
        ? registro.moods
        : registro.mood
          ? [registro.mood]
          : [];

      lista.forEach((humor) => {
        frequencia[humor] = (frequencia[humor] || 0) + 1;
      });
    });

    return Object.entries(frequencia)
      .map(([nome, quantidade]) => [nome, quantidade])
      .sort((a, b) => b[1] - a[1]);
  }, [humorFiltrado]);

  // Estudos
  const estudosFiltrados = useMemo(() => {
    return (registrosEstudo || []).filter((registro) => {
      if (!registro.data) return false;

      const partes = registro.data.split('-').map(Number);

      if (partes.length !== 3) return false;

      const data = new Date(partes[0], partes[1] - 1, partes[2]);

      return estaNoPeriodo(data);
    });
  }, [registrosEstudo, periodo]);

  const totalEstudos = estudosFiltrados.reduce(
    (total, registro) => {
      const minutos = Number.isFinite(Number(registro.segundos))
        ? Number(registro.segundos) / 60
        : Number(registro.minutos || 0);

      return total + minutos;
    },
    0
  );

  const dadosEstudos = useMemo(() => {
    return agruparPorData(
      estudosFiltrados,
      (registro) => {
        const [ano, mes, dia] = registro.data.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
      },
      (registro) => (
        Number.isFinite(Number(registro.segundos))
          ? Number(registro.segundos) / 60
          : Number(registro.minutos || 0)
      ),
      datasPeriodo
    );
  }, [estudosFiltrados, datasPeriodo]);

  // No mês, os dados são agrupados por semana para evitar 30 datas apertadas.
  const dadosAguaGrafico = useMemo(() => (
    periodo === 'mes'
      ? agruparDadosPorSemana(dadosAgua, datasPeriodo)
      : dadosAgua.map((item) => ({ label: item.label || item.data, valor: item.valor }))
  ), [dadosAgua, datasPeriodo, periodo]);

  const dadosSonoGrafico = useMemo(() => (
    periodo === 'mes'
      ? agruparDadosPorSemana(dadosSono, datasPeriodo)
      : dadosSono.map((item) => ({ label: item.label || item.data, valor: item.valor }))
  ), [dadosSono, datasPeriodo, periodo]);

  const dadosEstudosGrafico = useMemo(() => (
    periodo === 'mes'
      ? agruparDadosPorSemana(dadosEstudos, datasPeriodo)
      : dadosEstudos.map((item) => ({ label: item.label || item.data, valor: item.valor }))
  ), [dadosEstudos, datasPeriodo, periodo]);

  // Dados dos gráficos Google Charts.
  const htmlGraficos = useMemo(() => {
    const dados = {
      agua: dadosAguaGrafico.map((item) => [item.label, Number(item.valor) || 0]),
      sono: dadosSonoGrafico.map((item) => [
        item.label,
        Number(((item.valor || 0) / 60).toFixed(2)),
      ]),
      humor: frequenciaHumor,
      estudos: dadosEstudosGrafico.map((item) => [
        item.label,
        Number(((item.valor || 0) / 60).toFixed(2)),
      ]),
    };

    const dadosSeguros = JSON.stringify(dados).replace(/</g, '\\u003c');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://www.gstatic.com/charts/loader.js"></script>
        <style>
          * { box-sizing: border-box; }
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
            color: #26352A;
            background: #F7FAF8;
          }
          body { padding: 4px; }
          .chart-card {
            width: 100%;
            overflow: hidden;
            background: #FFFFFF;
            border-radius: 14px;
            padding: 12px 8px 8px;
            margin: 0 0 14px;
          }
          .chart-title {
            font-size: 14px;
            line-height: 19px;
            font-weight: bold;
            margin: 4px 8px 2px;
          }
          .chart-subtitle {
            color: #819087;
            font-size: 11px;
            line-height: 16px;
            margin: 0 8px 6px;
          }
          .chart {
            width: 100%;
            height: 250px;
            overflow: hidden;
          }
          .empty {
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #819087;
            font-size: 13px;
            text-align: center;
            padding: 16px;
          }
        </style>
      </head>
      <body>
        <div class="chart-card">
          <div class="chart-title">Humor</div>
          <div class="chart-subtitle">Frequência das emoções registradas</div>
          <div id="humor" class="chart"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Hidratação</div>
          <div class="chart-subtitle">Consumo de água em ml</div>
          <div id="agua" class="chart"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Sono</div>
          <div class="chart-subtitle">Duração registrada em horas</div>
          <div id="sono" class="chart"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Estudos</div>
          <div class="chart-subtitle">Tempo de estudo em horas</div>
          <div id="estudos" class="chart"></div>
        </div>
        <script>
          const dados = ${dadosSeguros};

          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(desenharGraficos);

          function desenharBarras(elemento, linhas, nomeColuna, cor) {
            const container = document.getElementById(elemento);

            if (!linhas.length || linhas.every((item) => Number(item[1]) === 0)) {
              container.style.height = '150px';
              container.innerHTML =
                '<div class="empty">Ainda não há registros neste período.</div>';
              return;
            }

            // Altura proporcional à quantidade de barras, sem ultrapassar o necessário.
            const alturaGrafico = Math.max(205, Math.min(300, linhas.length * 34 + 60));
            container.style.height = alturaGrafico + 'px';

            const tabela = new google.visualization.DataTable();
            tabela.addColumn('string', 'Data');
            tabela.addColumn('number', nomeColuna);
            tabela.addRows(linhas);

            // Ajusta a margem conforme o tamanho dos rótulos do eixo vertical.
            // Na semana (DD/MM), a margem fica menor; no mês (DD/MM–DD/MM), maior.
            const maiorRotulo = Math.max(
              ...linhas.map((item) => String(item[0] || '').length)
            );
            const margemEsquerda = Math.max(48, Math.min(112, maiorRotulo * 7 + 10));
            const larguraArea = maiorRotulo > 7 ? '72%' : '84%';

            const grafico = new google.visualization.BarChart(container);
            grafico.draw(tabela, {
              height: alturaGrafico,
              legend: { position: 'none' },
              colors: [cor],
              backgroundColor: 'transparent',
              chartArea: {
                left: margemEsquerda,
                right: 24,
                top: 12,
                bottom: 30,
                width: larguraArea,
                height: '82%'
              },
              hAxis: {
                minValue: 0,
                textStyle: { color: '#819087', fontSize: 10 },
                gridlines: { color: '#E8EFEA', count: 5 }
              },
              vAxis: {
                textStyle: { color: '#819087', fontSize: 10 }
              },
              bar: { groupWidth: '58%' }
            });
          }

          function desenharHumor() {
            const container = document.getElementById('humor');
            container.style.height = '250px';

            if (!dados.humor.length) {
              container.innerHTML =
                '<div class="empty">Ainda não há registros de humor neste período.</div>';
              return;
            }

            const tabela = new google.visualization.DataTable();
            tabela.addColumn('string', 'Humor');
            tabela.addColumn('number', 'Registros');
            tabela.addRows(dados.humor);

            const grafico = new google.visualization.PieChart(container);
            grafico.draw(tabela, {
              height: 250,
              backgroundColor: 'transparent',
              pieHole: 0.45,
              colors: [
                '#378568', '#75B99A', '#E6A64D', '#A985C5',
                '#75BDF8', '#D98C8C', '#B5C9B9'
              ],
              chartArea: { width: '95%', height: '78%' },
              legend: {
                position: 'bottom',
                textStyle: { color: '#819087', fontSize: 10 }
              }
            });
          }

          function desenharGraficos() {
            desenharBarras('agua', dados.agua, 'ml', '#75BDF8');
            desenharBarras('sono', dados.sono, 'Horas', '#A985C5');
            desenharHumor();
            desenharBarras('estudos', dados.estudos, 'Horas', '#378568');
          }

          window.addEventListener('resize', desenharGraficos);
        </script>
      </body>
      </html>
    `;
  }, [dadosAguaGrafico, dadosSonoGrafico, frequenciaHumor, dadosEstudosGrafico]);

  const quantidadeRegistros = {
    agua: aguaFiltrada.length,
    sono: sonoFiltrado.length,
    humor: humorFiltrado.length,
    estudos: estudosFiltrados.length,
  };

  // Altura total do conteúdo HTML: inclui os quatro cartões e seus títulos.
  const obterAlturaGrafico = (linhas) => {
    if (!linhas.length || linhas.every((item) => Number(item.valor) === 0)) return 150;
    return Math.max(205, Math.min(300, linhas.length * 34 + 60));
  };

  const alturaGraficos =
    obterAlturaGrafico(dadosAguaGrafico) +
    obterAlturaGrafico(dadosSonoGrafico) +
    250 + // gráfico de humor
    obterAlturaGrafico(dadosEstudosGrafico) +
    360; // títulos, margens, espaçamentos e cartões

  const carregandoTela = carregando || carregandoDados;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório</Text>
            <Text style={styles.subtitle}>
              Acompanhe seus registros e perceba seu progresso.
            </Text>
          </View>

        </View>

        <View style={styles.filterContainer}>
          {PERIODOS.map((item) => (
            <Text
              key={item.value}
              onPress={() => setPeriodo(item.value)}
              style={[
                styles.filter,
                periodo === item.value && styles.filterActive,
              ]}
            >
              {item.label}
            </Text>
          ))}
        </View>

        {carregandoTela ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              Carregando seus registros...
            </Text>
          </View>
        ) : (
          <>
            {erro && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#B66A43"
                />
                <Text style={styles.errorText}>
                  Alguns dados não puderam ser carregados. Verifique sua conexão.
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Resumo do período</Text>

            <View style={styles.cardsGrid}>
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: '#E8F5FD' }]}>
                  <MaterialCommunityIcons
                    name="water"
                    size={22}
                    color={COLORS.water}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {formatarLitros(totalAgua)} L
                </Text>

                <Text style={styles.summaryLabel}>Água consumida</Text>
                <Text style={styles.summaryDetail}>
                  {percentualAgua}% do objetivo do período
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: '#F3ECF8' }]}>
                  <MaterialCommunityIcons
                    name="sleep"
                    size={22}
                    color={COLORS.sleep}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {formatarDuracao(totalSono)}
                </Text>

                <Text style={styles.summaryLabel}>Sono registrado</Text>
                <Text style={styles.summaryDetail}>
                  {sonoFiltrado.length > 0
                    ? `Média por registro: ${formatarDuracao(mediaSono)}`
                    : 'Nenhum registro no período'}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: '#FFF4DF' }]}>
                  <MaterialCommunityIcons
                    name="emoticon-happy-outline"
                    size={22}
                    color={COLORS.mood}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {humorFiltrado.length}
                </Text>

                <Text style={styles.summaryLabel}>Registros de humor</Text>
                <Text style={styles.summaryDetail}>
                  {humorFiltrado.length === 1
                    ? 'Registro realizado'
                    : 'Registros realizados'}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: '#EAF5EF' }]}>
                  <MaterialCommunityIcons
                    name="book-open-page-variant-outline"
                    size={22}
                    color={COLORS.study}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {formatarDuracao(totalEstudos)}
                </Text>

                <Text style={styles.summaryLabel}>Tempo de estudo</Text>
                <Text style={styles.summaryDetail}>
                  {estudosFiltrados.length} registros no período
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Análise dos registros</Text>
              <Text style={styles.sectionDescription}>
                Visualize seus hábitos ao longo do tempo.
              </Text>
            </View>

            <View style={styles.chartsContainer}>
              {Platform.OS === 'web' ? (
                <View style={styles.webChart}>
                  <iframe
                    title="Gráficos de evolução pessoal"
                    srcDoc={htmlGraficos}
                    style={{
                      width: '100%',
                      height: `${alturaGraficos}px`,
                      border: 'none',
                      backgroundColor: COLORS.background,
                    }}
                  />
                </View>
              ) : (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: htmlGraficos }}
                  style={[styles.webView, { height: alturaGraficos }]}
                  scrollEnabled={false}
                  javaScriptEnabled
                  domStorageEnabled
                  automaticallyAdjustContentInsets={false}
                />
              )}
            </View>


            <Text style={styles.footer}>
              Seus registros representam seu próprio processo de evolução.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  overline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: COLORS.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 5,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filter: {
    flex: 1,
    textAlign: 'center',
    overflow: 'hidden',
    paddingVertical: 10,
    borderRadius: 10,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  filterActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 13,
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },

  summaryCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: 135,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 14,
  },

  summaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 5,
  },

  summaryDetail: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 5,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionDescription: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: -7,
  },

  chartsContainer: {
    gap: 12,
  },

  webChart: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 15,
  },

  webView: {
    width: '100%',
    height: 1400,
    backgroundColor: COLORS.background,
  },

  reflectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.light,
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    gap: 12,
  },

  reflectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reflectionText: {
    flex: 1,
  },

  reflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 5,
  },

  reflectionDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.dark,
  },

  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },

  loadingText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 12,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF4E9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#8D5837',
  },

  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 22,
  },
});
