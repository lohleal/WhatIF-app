import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useEstudos, formatarTempo, formatarData, formatarHora } from '../../../../features/study/context/EstudosContext';

export default function ProgressoEstudos() {
  const router = useRouter();

  const {
    periodo,
    setPeriodo,
    registrosFiltrados,
    totalPeriodo,
    tituloPeriodo,
    excluirRegistro,
  } = useEstudos();

  const registros = registrosFiltrados || [];

  // Estatísticas calculadas a partir dos registros do período
  const diasEstudados = useMemo(() => {
    return new Set(registros.map((registro) => registro.data)).size;
  }, [registros]);

  const mediaDiaria = diasEstudados > 0
    ? Math.round((totalPeriodo || 0) / diasEstudados)
    : 0;

  const materiasEstudadas = useMemo(() => {
    return new Set(registros.map((registro) => registro.materia)).size;
  }, [registros]);

  // Organiza os dados para os gráficos
  const dadosPorDia = useMemo(() => {
    const agrupados = {};

    registros.forEach((registro) => {
      const chave = periodo === 'dia'
        ? registro.materia || 'Sem matéria'
        : registro.data;

      agrupados[chave] = (agrupados[chave] || 0) + Number(registro.minutos || 0);
    });

    return Object.entries(agrupados).map(([nome, minutos]) => [
      nome,
      minutos,
    ]);
  }, [registros, periodo]);

  const dadosPorMateria = useMemo(() => {
    const agrupados = {};

    registros.forEach((registro) => {
      const materia = registro.materia || 'Sem matéria';
      agrupados[materia] = (agrupados[materia] || 0) + Number(registro.minutos || 0);
    });

    return Object.entries(agrupados).map(([nome, minutos]) => [
      nome,
      minutos,
    ]);
  }, [registros]);

  // HTML dos gráficos Google Charts
  const htmlGraficos = useMemo(() => {
    const dadosTempo = JSON.stringify(dadosPorDia).replace(/</g, '\\u003c');
    const dadosMaterias = JSON.stringify(dadosPorMateria).replace(/</g, '\\u003c');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://www.gstatic.com/charts/loader.js"></script>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 8px;
              font-family: Arial, sans-serif;
              background: #FFFFFF;
              color: #252A3A;
            }
            .chart {
              width: 100%;
              height: 260px;
              margin-bottom: 18px;
            }
            .chart-title {
              font-size: 14px;
              font-weight: bold;
              margin: 8px 0 0 8px;
            }
          </style>
          <script>
            const dadosTempo = ${dadosTempo};
            const dadosMaterias = ${dadosMaterias};

            google.charts.load('current', { packages: ['corechart'] });
            google.charts.setOnLoadCallback(desenharGraficos);

            function desenharGraficos() {
              const tabelaTempo = new google.visualization.DataTable();
              tabelaTempo.addColumn('string', '${periodo === 'dia' ? 'Matéria' : 'Data'}');
              tabelaTempo.addColumn('number', 'Minutos');
              tabelaTempo.addRows(dadosTempo);

              const graficoTempo = new google.visualization.ColumnChart(
                document.getElementById('graficoTempo')
              );

              graficoTempo.draw(tabelaTempo, {
                height: 260,
                legend: { position: 'none' },
                colors: ['#378568'],
                backgroundColor: 'transparent',
                chartArea: { width: '82%', height: '72%' },
                vAxis: { minValue: 0, textStyle: { color: '#777D90' } },
                hAxis: { textStyle: { color: '#777D90' } },
                bar: { groupWidth: '55%' }
              });

              const tabelaMaterias = new google.visualization.DataTable();
              tabelaMaterias.addColumn('string', 'Matéria');
              tabelaMaterias.addColumn('number', 'Minutos');
              tabelaMaterias.addRows(dadosMaterias);

              const graficoMaterias = new google.visualization.PieChart(
                document.getElementById('graficoMaterias')
              );

              graficoMaterias.draw(tabelaMaterias, {
                height: 260,
                backgroundColor: 'transparent',
                pieHole: 0.55,
                colors: ['#378568', '#75B99A', '#B5DEC9', '#D9EFE3', '#A2A8B5'],
                chartArea: { width: '95%', height: '85%' },
                legend: {
                  position: 'bottom',
                  textStyle: { color: '#777D90', fontSize: 11 }
                }
              });
            }

            window.addEventListener('resize', desenharGraficos);
          </script>
        </head>
        <body>
          <div class="chart-title">Tempo de estudo</div>
          <div id="graficoTempo" class="chart"></div>
          <div class="chart-title">Distribuição por matéria</div>
          <div id="graficoMaterias" class="chart"></div>
        </body>
      </html>
    `;
  }, [dadosPorDia, dadosPorMateria, periodo]);

  function confirmarExclusao(id) {
    Alert.alert(
      'Excluir registro',
      'Tem certeza de que deseja excluir este registro de estudo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirRegistro(id),
        },
      ]
    );
  }

  function exibirData(data) {
    if (!data) return '';
    try {
      return formatarData(data);
    } catch {
      return data;
    }
  }

  function exibirHora(data) {
    if (!data) return '';
    try {
      return formatarHora(data);
    } catch {
      return '';
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#252A3A" />
        </TouchableOpacity>

        <View style={styles.headerTexto}>
          <Text style={styles.subtitulo}>BEM-ESTAR</Text>
          <Text style={styles.titulo}>Progresso e histórico</Text>
        </View>
      </View>

      {/* Filtro de período */}
      <View style={styles.filtros}>
        {[
          { valor: 'dia', texto: 'Dia' },
          { valor: 'semana', texto: 'Semana' },
          { valor: 'mes', texto: 'Mês' },
        ].map((item) => (
          <TouchableOpacity
            key={item.valor}
            style={[
              styles.filtro,
              periodo === item.valor && styles.filtroAtivo,
            ]}
            onPress={() => setPeriodo(item.valor)}
          >
            <Text
              style={[
                styles.filtroTexto,
                periodo === item.valor && styles.filtroTextoAtivo,
              ]}
            >
              {item.texto}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        <Text style={styles.periodoTitulo}>
            {tituloPeriodo?.[periodo] || 'Seu desempenho'}
        </Text>

      {/* Indicadores */}
      <View style={styles.gradeIndicadores}>
        <View style={styles.indicadorCard}>
          <View style={styles.iconeIndicador}>
            <Ionicons name="time-outline" size={21} color="#378568" />
          </View>
          <Text style={styles.indicadorValor}>
            {formatarTempo(totalPeriodo || 0)}
          </Text>
          <Text style={styles.indicadorLabel}>Tempo estudado</Text>
        </View>

        <View style={styles.indicadorCard}>
          <View style={styles.iconeIndicador}>
            <Ionicons name="calendar-outline" size={21} color="#378568" />
          </View>
          <Text style={styles.indicadorValor}>{diasEstudados}</Text>
          <Text style={styles.indicadorLabel}>Dias estudados</Text>
        </View>

        <View style={styles.indicadorCard}>
          <View style={styles.iconeIndicador}>
            <Ionicons name="bar-chart-outline" size={21} color="#378568" />
          </View>
          <Text style={styles.indicadorValor}>
            {formatarTempo(mediaDiaria)}
          </Text>
          <Text style={styles.indicadorLabel}>Média por dia</Text>
        </View>

        <View style={styles.indicadorCard}>
          <View style={styles.iconeIndicador}>
            <Ionicons name="book-outline" size={21} color="#378568" />
          </View>
          <Text style={styles.indicadorValor}>{materiasEstudadas}</Text>
          <Text style={styles.indicadorLabel}>Matérias estudadas</Text>
        </View>
      </View>

      {/* Gráficos */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Análise dos estudos</Text>
        <Text style={styles.secaoDescricao}>
          Visualize como seu tempo foi distribuído.
        </Text>

        <View style={styles.graficoCard}>
          {registros.length > 0 ? (
            Platform.OS === 'web' ? (
              React.createElement('iframe', {
                title: 'Gráficos de progresso dos estudos',
                srcDoc: htmlGraficos,
                style: {
                  width: '100%',
                  height: '550px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                },
              })
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{ html: htmlGraficos }}
                style={styles.webview}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled
              />
            )
          ) : (
            <View style={styles.graficoVazio}>
              <Ionicons name="analytics-outline" size={38} color="#A2A8B5" />
              <Text style={styles.vazioTitulo}>Ainda não há dados</Text>
              <Text style={styles.vazioTexto}>
                Registre seus estudos para visualizar os gráficos.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Histórico */}
      <View style={styles.secao}>
        <View style={styles.historicoCabecalho}>
          <View>
            <Text style={styles.secaoTitulo}>Histórico de estudos</Text>
            <Text style={styles.secaoDescricao}>
              Seus registros neste período.
            </Text>
          </View>

          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>{registros.length}</Text>
          </View>
        </View>

        {registros.length > 0 ? (
          [...registros]
            .sort((a, b) => new Date(b.inicio) - new Date(a.inicio))
            .map((registro) => (
              <View key={registro.id} style={styles.registroCard}>
                <View style={styles.registroIcone}>
                  <Ionicons name="book-outline" size={21} color="#378568" />
                </View>

                <View style={styles.registroInfo}>
                  <Text style={styles.registroMateria}>
                    {registro.materia}
                  </Text>
                  <Text style={styles.registroData}>
                    {exibirData(registro.data)}
                  </Text>
                  <Text style={styles.registroHorario}>
                    {exibirHora(registro.inicio)}
                    {registro.fim ? ` – ${exibirHora(registro.fim)}` : ''}
                  </Text>
                </View>

                <View style={styles.registroDireita}>
                  <Text style={styles.registroDuracao}>
                    {formatarTempo(registro.minutos)}
                  </Text>
                  <TouchableOpacity
                    style={styles.botaoExcluir}
                    onPress={() => confirmarExclusao(registro.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#D66A6A"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.historicoVazio}>
            <Ionicons name="document-text-outline" size={34} color="#A2A8B5" />
            <Text style={styles.vazioTitulo}>Nenhum estudo registrado</Text>
            <Text style={styles.vazioTexto}>
              Seus registros aparecerão aqui quando você estudar.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>
          Continue acompanhando sua evolução. Cada passo conta! 💚
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  headerTexto: {
    flex: 1,
  },
  subtitulo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#378568',
    letterSpacing: 1.3,
    marginBottom: 3,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#252A3A',
  },
  filtros: {
    flexDirection: 'row',
    backgroundColor: '#E9EBF2',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  filtro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 11,
  },
  filtroAtivo: {
    backgroundColor: '#FFFFFF',
  },
  filtroTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777D90',
  },
  filtroTextoAtivo: {
    color: '#378568',
  },
  periodoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252A3A',
    marginBottom: 13,
  },
  gradeIndicadores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  indicadorCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    minHeight: 130,
  },
  iconeIndicador: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#E4F4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  indicadorValor: {
    fontSize: 20,
    fontWeight: '700',
    color: '#252A3A',
    marginBottom: 4,
  },
  indicadorLabel: {
    fontSize: 12,
    color: '#777D90',
  },
  secao: {
    marginTop: 28,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252A3A',
  },
  secaoDescricao: {
    fontSize: 12,
    color: '#777D90',
    marginTop: 5,
    marginBottom: 14,
  },
  graficoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 8,
    overflow: 'hidden',
    minHeight: 220,
  },
  webview: {
    height: 550,
    backgroundColor: '#FFFFFF',
  },
  graficoVazio: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  vazioTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252A3A',
    marginTop: 10,
  },
  vazioTexto: {
    fontSize: 12,
    color: '#777D90',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
  historicoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contador: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E4F4EC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  contadorTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#378568',
  },
  registroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  registroIcone: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E4F4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  registroInfo: {
    flex: 1,
  },
  registroMateria: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252A3A',
    marginBottom: 4,
  },
  registroData: {
    fontSize: 11,
    color: '#777D90',
  },
  registroHorario: {
    fontSize: 11,
    color: '#777D90',
    marginTop: 3,
  },
  registroDireita: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  registroDuracao: {
    fontSize: 13,
    fontWeight: '700',
    color: '#378568',
  },
  botaoExcluir: {
    padding: 5,
    marginTop: 5,
  },
  historicoVazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 25,
    alignItems: 'center',
  },
  rodape: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 15,
  },
  rodapeTexto: {
    fontSize: 12,
    color: '#777D90',
    textAlign: 'center',
    lineHeight: 19,
  },
});