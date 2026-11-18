import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAuth } from '../../../../features/auth/context/AuthContext';

import {
    buscarRegistrosSono,
    salvarRegistrosSono,
} from '../../../../features/wellbeing/services/sleepService';

const PURPLE = '#B37BC9';
const DARK_PURPLE = '#704486';
const LIGHT_PURPLE = '#FAF5FC';
const BORDER = '#E9D9F2';
const MUTED = '#95869D';
const WHITE = '#FFFFFF';

const OBJETIVO_HORAS = 8;

// Formata a duração em horas e minutos.
function formatarDuracao(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return `${horas}h ${String(resto).padStart(2, '0')}min`;
}

// Formata o horário.
function formatarHorario(data) {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Formata a data.
function formatarData(data) {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

// Cria o primeiro período de sono.
function criarPeriodoInicial() {
  const agora = new Date();

  const inicio = new Date(agora);
  inicio.setDate(inicio.getDate() - 1);
  inicio.setHours(23, 0, 0, 0);

  const fim = new Date(agora);
  fim.setHours(6, 30, 0, 0);

  if (fim <= inicio) {
    fim.setDate(fim.getDate() + 1);
  }

  return {
    id: `${Date.now()}-inicial`,
    inicio,
    fim,
  };
}

// Cria um novo período, com horários iniciais editáveis.
function criarPeriodoExtra() {
  const agora = new Date();

  const inicio = new Date(agora);
  inicio.setHours(14, 0, 0, 0);

  const fim = new Date(agora);
  fim.setHours(15, 0, 0, 0);

  return {
    id: `${Date.now()}-${Math.random()}`,
    inicio,
    fim,
  };
}

// Ajusta automaticamente a data final quando o sono atravessa a meia-noite.
function normalizarPeriodo(periodo) {
  const inicio = new Date(periodo.inicio);
  const fim = new Date(periodo.fim);

  if (fim <= inicio) {
    fim.setDate(fim.getDate() + 1);
  }

  return {
    ...periodo,
    inicio,
    fim,
  };
}

// Converte os registros recebidos do Firestore.
function converterRegistro(registro) {
  const inicio =
    registro.inicio?.toDate?.() ?? new Date(registro.inicio);

  const fim =
    registro.fim?.toDate?.() ?? new Date(registro.fim);

  return {
    ...registro,
    inicio,
    fim,
    duracaoMinutos:
      registro.duracaoMinutos ??
      Math.round((fim.getTime() - inicio.getTime()) / 60000),
  };
}

export default function RegistroSono() {
  const router = useRouter();

  const { usuario, carregando } = useAuth();

  const [periodos, setPeriodos] = useState(() => [
    criarPeriodoInicial(),
  ]);

  const [seletorVisivel, setSeletorVisivel] = useState(null);

  const [registros, setRegistros] = useState([]);

  const [salvando, setSalvando] = useState(false);

  const [carregandoRegistros, setCarregandoRegistros] = useState(true);

  // Busca os registros já salvos no Firestore.
  useEffect(() => {
    if (carregando) return;

    if (!usuario) {
      setCarregandoRegistros(false);
      return;
    }

    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarRegistrosSono(usuario.uid);

        if (ativo) {
          setRegistros(dados.map(converterRegistro));
        }
      } catch (error) {
        console.error('Erro ao carregar registros de sono:', error);

        if (ativo) {
          Alert.alert(
            'Ops!',
            'Não foi possível carregar seus registros de sono.'
          );
        }
      } finally {
        if (ativo) {
          setCarregandoRegistros(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [usuario, carregando]);

  // Calcula os períodos e suas durações.
  const periodosCalculados = useMemo(
    () => periodos.map(normalizarPeriodo),
    [periodos]
  );

  const duracoes = periodosCalculados.map((periodo) =>
    Math.round(
      (periodo.fim.getTime() - periodo.inicio.getTime()) / 60000
    )
  );

  // Soma todos os períodos.
  const duracaoTotal = duracoes.reduce(
    (total, duracao) => total + Math.max(0, duracao),
    0
  );

  const progresso = Math.min(
    (duracaoTotal / (OBJETIVO_HORAS * 60)) * 100,
    100
  );

  // Atualiza o horário escolhido pelo usuário.
  function atualizarHorario(event, dataEscolhida) {
    const seletor = seletorVisivel;

    setSeletorVisivel(null);

    if (event?.type !== 'set' || !dataEscolhida || !seletor) {
      return;
    }

    setPeriodos((atuais) =>
      atuais.map((periodo) => {
        if (periodo.id !== seletor.periodoId) {
          return periodo;
        }

        const atualizado = { ...periodo };

        const dataAtual =
          seletor.campo === 'inicio'
            ? new Date(periodo.inicio)
            : new Date(periodo.fim);

        dataAtual.setHours(
          dataEscolhida.getHours(),
          dataEscolhida.getMinutes(),
          0,
          0
        );

        atualizado[seletor.campo] = dataAtual;

        if (seletor.campo === 'inicio') {
          const fim = new Date(atualizado.fim);

          if (fim <= dataAtual) {
            fim.setDate(fim.getDate() + 1);
          }

          atualizado.fim = fim;
        } else {
          const fim = new Date(atualizado.fim);

          if (fim <= atualizado.inicio) {
            fim.setDate(fim.getDate() + 1);
          }

          atualizado.fim = fim;
        }

        return atualizado;
      })
    );
  }

  // Adiciona outro período de sono.
  function adicionarPeriodo() {
    setPeriodos((atuais) => [
      ...atuais,
      criarPeriodoExtra(),
    ]);
  }

  // Remove um período antes de salvar.
  function removerPeriodo(periodoId) {
    if (periodos.length === 1) {
      Alert.alert(
        'Atenção',
        'É necessário manter pelo menos um período de sono.'
      );

      return;
    }

    setPeriodos((atuais) =>
      atuais.filter((periodo) => periodo.id !== periodoId)
    );
  }

  // Verifica se os horários são válidos e não se sobrepõem.
  function validarPeriodos() {
    const ordenados = [...periodosCalculados].sort(
      (a, b) => a.inicio.getTime() - b.inicio.getTime()
    );

    for (let i = 0; i < ordenados.length; i += 1) {
      const duracao =
        (ordenados[i].fim.getTime() -
          ordenados[i].inicio.getTime()) /
        60000;

      if (
        !Number.isFinite(duracao) ||
        duracao <= 0 ||
        duracao > 1440
      ) {
        Alert.alert(
          'Horários inválidos',
          'Cada período precisa ter duração maior que zero e de até 24 horas.'
        );

        return false;
      }

      if (
        i > 0 &&
        ordenados[i].inicio.getTime() <
          ordenados[i - 1].fim.getTime()
      ) {
        Alert.alert(
          'Horários sobrepostos',
          'Dois períodos estão acontecendo ao mesmo tempo. Confira os horários.'
        );

        return false;
      }
    }

    return true;
  }

  // Salva todos os períodos no Firestore.
  async function registrarSono() {
    if (carregando || !usuario) {
      Alert.alert(
        'Aguarde',
        'Estamos verificando sua sessão. Tente novamente.'
      );

      return;
    }

    if (!validarPeriodos()) return;

    setSalvando(true);

    try {
      const dadosParaSalvar = periodosCalculados.map((periodo) => ({
        inicio: periodo.inicio,
        fim: periodo.fim,
      }));

      await salvarRegistrosSono(
        usuario.uid,
        dadosParaSalvar
      );

      const atualizados = await buscarRegistrosSono(usuario.uid);

      setRegistros(atualizados.map(converterRegistro));

      Alert.alert(
        'Registro salvo!',
        'Seus períodos de sono foram registrados.'
      );

      setPeriodos([criarPeriodoInicial()]);

      router.back();
    } catch (error) {
      console.error('Erro ao salvar sono:', error);

      Alert.alert(
        'Não foi possível salvar',
        error?.message || 'Ocorreu um erro ao registrar seu sono.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // Organiza os registros recentes.
  const registrosRecentes = [...registros]
    .sort(
      (a, b) => b.inicio.getTime() - a.inicio.getTime()
    )
    .slice(0, 7);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Voltar"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={DARK_PURPLE}
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Registro diário
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="sleep"
                size={25}
                color={PURPLE}
              />
            </View>
          </View>

          {/* RESUMO DO SONO */}
          <View style={styles.purpleSection}>
            <Text style={styles.cardEyebrow}>
              DURAÇÃO DOS PERÍODOS
            </Text>

            <Text style={styles.totalNumber}>
              {Math.floor(duracaoTotal / 60)}
              <Text style={styles.totalUnit}>h </Text>
              {String(duracaoTotal % 60).padStart(2, '0')}
              <Text style={styles.totalUnit}>min</Text>
            </Text>

            <View style={styles.sleepIllustration}>
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={54}
                color={WHITE}
              />
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progresso}%` },
                ]}
              />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                Tempo total de descanso
              </Text>

              <Text style={styles.progressGoal}>
                Objetivo: {OBJETIVO_HORAS}h
              </Text>
            </View>

            <Svg
              width="120%"
              height="48"
              viewBox="0 0 400 55"
              preserveAspectRatio="none"
              style={styles.wave}
            >
              <Path
                d="M0 20 C35 5 55 5 85 20 C115 35 140 45 175 25 C210 5 230 5 260 25 C295 45 320 45 350 25 C375 10 390 10 400 20 L400 55 L0 55 Z"
                fill="#FFFCFF"
              />
            </Svg>
          </View>

          {/* HORÁRIOS DE SONO */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.headingIcon}>
                <MaterialCommunityIcons
                  name="clock-time-four-outline"
                  size={22}
                  color={PURPLE}
                />
              </View>

              <View style={styles.headingText}>
                <Text style={styles.sectionTitle}>
                  Horários de sono
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Adicione todos os períodos em que dormiu, incluindo sonecas
                </Text>
              </View>
            </View>

            {/* LISTA DE PERÍODOS */}
            {periodos.map((periodo, index) => {
              const periodoAtual = normalizarPeriodo(periodo);

              const duracao = Math.max(
                0,
                Math.round(
                  (periodoAtual.fim.getTime() -
                    periodoAtual.inicio.getTime()) /
                    60000
                )
              );

              return (
                <View
                  key={periodo.id}
                  style={styles.periodCard}
                >
                  <View style={styles.periodHeader}>
                    <Text style={styles.periodTitle}>
                      {index === 0
                        ? 'Primeiro período'
                        : `Período ${index + 1}`}
                    </Text>

                    {periodos.length > 1 && (
                      <Pressable
                        onPress={() => removerPeriodo(periodo.id)}
                        hitSlop={8}
                        accessibilityLabel="Remover período"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={19}
                          color="#B66A78"
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* HORÁRIO DE INÍCIO */}
                  <Pressable
                    style={styles.timeCard}
                    onPress={() =>
                      setSeletorVisivel({
                        periodoId: periodo.id,
                        campo: 'inicio',
                      })
                    }
                  >
                    <View style={styles.timeIcon}>
                      <MaterialCommunityIcons
                        name="weather-night"
                        size={25}
                        color={PURPLE}
                      />
                    </View>

                    <View style={styles.timeInfo}>
                      <Text style={styles.timeTitle}>
                        Fui dormir
                      </Text>

                      <Text style={styles.timeDescription}>
                        {formatarData(periodoAtual.inicio)}
                      </Text>
                    </View>

                    <Text style={styles.timeValue}>
                      {formatarHorario(periodoAtual.inicio)}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={MUTED}
                    />
                  </Pressable>

                  {/* HORÁRIO DE TÉRMINO */}
                  <Pressable
                    style={styles.timeCard}
                    onPress={() =>
                      setSeletorVisivel({
                        periodoId: periodo.id,
                        campo: 'fim',
                      })
                    }
                  >
                    <View style={styles.timeIcon}>
                      <MaterialCommunityIcons
                        name="weather-sunny"
                        size={25}
                        color={PURPLE}
                      />
                    </View>

                    <View style={styles.timeInfo}>
                      <Text style={styles.timeTitle}>
                        Acordei
                      </Text>

                      <Text style={styles.timeDescription}>
                        {formatarData(periodoAtual.fim)}
                      </Text>
                    </View>

                    <Text style={styles.timeValue}>
                      {formatarHorario(periodoAtual.fim)}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={MUTED}
                    />
                  </Pressable>

                  <Text style={styles.periodDuration}>
                    Duração deste período: {formatarDuracao(duracao)}
                  </Text>
                </View>
              );
            })}

            {/* SELETOR DE HORÁRIO */}
            {seletorVisivel && (
              <DateTimePicker
                value={
                  periodos.find(
                    (periodo) =>
                      periodo.id === seletorVisivel.periodoId
                  )?.[seletorVisivel.campo] || new Date()
                }
                mode="time"
                display="default"
                onChange={atualizarHorario}
              />
            )}

            {/* ADICIONAR PERÍODO */}
            <Pressable
              style={styles.addPeriodButton}
              onPress={adicionarPeriodo}
            >
              <Ionicons
                name="add-circle-outline"
                size={21}
                color={DARK_PURPLE}
              />

              <Text style={styles.addPeriodText}>
                Adicionar outro período
              </Text>
            </Pressable>
          </View>

          <View style={styles.sectionDivider} />

          {/* DURAÇÃO TOTAL */}
          <View style={styles.durationCard}>
            <View style={styles.durationIcon}>
              <MaterialCommunityIcons
                name="bed-clock"
                size={26}
                color={PURPLE}
              />
            </View>

            <View style={styles.durationInfo}>
              <Text style={styles.durationTitle}>
                Tempo total de descanso
              </Text>

              <Text style={styles.durationSubtitle}>
                Soma de todos os períodos adicionados
              </Text>
            </View>

            <Text style={styles.durationValue}>
              {formatarDuracao(duracaoTotal)}
            </Text>
          </View>

          {/* BOTÃO SALVAR */}
          <Pressable
            style={({ pressed }) => [
              styles.registerButton,
              pressed && styles.registerButtonPressed,
              salvando && styles.registerButtonDisabled,
            ]}
            onPress={registrarSono}
            disabled={salvando || carregando}
          >
            {salvando ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="moon-waning-crescent"
                  size={22}
                  color={WHITE}
                />

                <Text style={styles.registerButtonText}>
                  Salvar registros
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={WHITE}
                />
              </>
            )}
          </Pressable>

          {/* REGISTROS RECENTES */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>
                Registros recentes
              </Text>

              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>
                  {registros.length}
                </Text>
              </View>
            </View>

            {carregandoRegistros ? (
              <ActivityIndicator
                color={PURPLE}
                style={{ marginVertical: 20 }}
              />
            ) : registrosRecentes.length === 0 ? (
              <View style={styles.emptyHistory}>
                <MaterialCommunityIcons
                  name="sleep"
                  size={32}
                  color={MUTED}
                />

                <Text style={styles.emptyText}>
                  Seus registros de sono aparecerão aqui
                </Text>
              </View>
            ) : (
              registrosRecentes.map((registro) => (
                <View
                  key={registro.id}
                  style={styles.historyItem}
                >
                  <View style={styles.historyIcon}>
                    <MaterialCommunityIcons
                      name="moon-waning-crescent"
                      size={24}
                      color={PURPLE}
                    />
                  </View>

                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>
                      Período de sono
                    </Text>

                    <Text style={styles.historyTime}>
                      {formatarData(registro.inicio)} ·{' '}
                      {formatarHorario(registro.inicio)} às{' '}
                      {formatarData(registro.fim)} ·{' '}
                      {formatarHorario(registro.fim)}
                    </Text>
                  </View>

                  <Text style={styles.historyAmount}>
                    {formatarDuracao(registro.duracaoMinutos)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  screen: {
    flex: 1,
    backgroundColor: '#FFFCFF',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 23,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: LIGHT_PURPLE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK_PURPLE,
    letterSpacing: -0.5,
  },

  headerIcon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    backgroundColor: LIGHT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  purpleSection: {
    backgroundColor: PURPLE,
    marginHorizontal: -22,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 60,
    marginBottom: 5,
    position: 'relative',
    overflow: 'hidden',
  },

  cardEyebrow: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  totalNumber: {
    color: WHITE,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -1,
  },

  totalUnit: {
    fontSize: 23,
    fontWeight: '600',
  },

  sleepIllustration: {
    position: 'absolute',
    right: 19,
    top: 25,
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },

  progressTrack: {
    height: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: WHITE,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  progressLabel: {
    color: WHITE,
    fontSize: 14,
  },

  progressGoal: {
    color: WHITE,
    fontSize: 14,
  },

  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
  },

  section: {
    marginTop: 17,
    marginBottom: 8,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },

  headingIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F1E4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headingText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK_PURPLE,
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
    lineHeight: 19,
  },

  periodCard: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 11,
    marginBottom: 12,
  },

  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingBottom: 9,
  },

  periodTitle: {
    color: DARK_PURPLE,
    fontSize: 15,
    fontWeight: '800',
  },

  timeCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: LIGHT_PURPLE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    marginBottom: 8,
    gap: 9,
  },

  timeIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: '#F1E4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeInfo: {
    flex: 1,
  },

  timeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK_PURPLE,
  },

  timeDescription: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },

  timeValue: {
    fontSize: 17,
    fontWeight: '800',
    color: DARK_PURPLE,
  },

  periodDuration: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 1,
  },

  addPeriodButton: {
    minHeight: 49,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
    backgroundColor: LIGHT_PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 3,
  },

  addPeriodText: {
    color: DARK_PURPLE,
    fontSize: 14,
    fontWeight: '700',
  },

  sectionDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 13,
    marginBottom: 15,
  },

  durationCard: {
    minHeight: 76,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: LIGHT_PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },

  durationIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#F1E4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  durationInfo: {
    flex: 1,
  },

  durationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK_PURPLE,
  },

  durationSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },

  durationValue: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK_PURPLE,
  },

  registerButton: {
    backgroundColor: PURPLE,
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 25,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },

  registerButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  registerButtonDisabled: {
    opacity: 0.7,
  },

  registerButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },

  historySection: {
    marginBottom: 8,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 13,
  },

  historyBadge: {
    backgroundColor: LIGHT_PURPLE,
    minWidth: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  historyBadgeText: {
    color: DARK_PURPLE,
    fontSize: 15,
    fontWeight: '800',
  },

  historyItem: {
    backgroundColor: LIGHT_PURPLE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F1E4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  historyInfo: {
    flex: 1,
  },

  historyName: {
    color: DARK_PURPLE,
    fontSize: 14,
    fontWeight: '700',
  },

  historyTime: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  historyAmount: {
    color: DARK_PURPLE,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 22,
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
  },

  emptyText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 7,
  },
});