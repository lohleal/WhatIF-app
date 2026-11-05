
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useEstudos,
  formatarTempo,
} from '../../../../features/study/context/EstudosContext';

const VERDE = '#A9D9BD';
const VERDE_CLARO = '#C9E9D6';
const VERDE_TEXTO = '#65A98A';
const VERDE_BARRA = '#B8E3CA';

export default function Estudo() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  const compactScreen = height < 800;

  const horizontalPadding = Math.max(
    18,
    Math.min(28, width * 0.055)
  );

  const heroHeight = compactScreen
    ? height * 0.43
    : height * 0.45;

  const progressSize = compactScreen
    ? 145
    : Math.min(175, width * 0.42);

  const cardHeight = compactScreen
    ? 76
    : Math.min(88, height * 0.10);

  const {
    minutosHoje,
    metaMinutos,
    metaEditavel,
    setMetaEditavel,
    progresso,
    salvarMeta,
    mensagem,
    setMensagem,
    atividadesPendentes,
    atividadesConcluidas,
  } = useEstudos();

  const progressoSeguro = Math.min(
    Math.max(Number(progresso) || 0, 0),
    100
  );

  const radius = progressSize * 0.36;
  const circumference = 2 * Math.PI * radius;

  const secoes = [
    {
      titulo: 'Registrar estudo',
      descricao: 'Cronometre ou registre seu tempo.',
      icone: 'clock-outline',
      rota: '/student/wellbeing/estudo/registro',
    },
    {
      titulo: 'Minhas atividades',
      descricao: 'Organize provas, trabalhos e tarefas.',
      icone: 'notebook-outline',
      rota: '/student/wellbeing/estudo/atividades',
    },
    {
      titulo: 'Progresso e histórico',
      descricao: 'Acompanhe sua evolução.',
      icone: 'chart-bar',
      rota: '/student/wellbeing/estudo/progresso',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* PARTE VERDE */}

        <View
          style={[
            styles.hero,
            { height: heroHeight },
          ]}
        >
          <Text
            style={[
              styles.title,
              compactScreen && styles.titleCompact,
            ]}
          >
            Meus estudos
          </Text>

          {/* PROGRESSO CIRCULAR */}

          <View
            style={[
              styles.progressContainer,
              {
                width: progressSize,
                height: progressSize,
              },
            ]}
          >
            <Svg
              width={progressSize}
              height={progressSize}
            >
              <Circle
                cx={progressSize / 2}
                cy={progressSize / 2}
                r={radius}
                stroke="#a8e2c4"
                strokeWidth={11}
                fill="transparent"
              />

              <Circle
                cx={progressSize / 2}
                cy={progressSize / 2}
                r={radius}
                stroke="#FFFFFF"
                strokeWidth={11}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference * (1 - progressoSeguro / 100)
                }
                rotation="-90"
                originX={progressSize / 2}
                originY={progressSize / 2}
              />
            </Svg>

            <View style={styles.progressTextContainer}>
              <Text style={styles.progressMainText}>
                {formatarTempo(minutosHoje)}
              </Text>
              
            </View>
          </View>

          <Text style={styles.amount}>
            {formatarTempo(minutosHoje)} / {formatarTempo(metaMinutos)}
          </Text>
          
        </View>

        {/* PARTE BRANCA */}

        <View
          style={[
            styles.detailsContainer,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailsContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* MENSAGEM */}

            {mensagem !== '' && (
              <Pressable
                style={styles.messageCard}
                onPress={() => setMensagem('')}
              >
                <Text style={styles.messageText}>
                  {mensagem}
                </Text>
                <Text style={styles.messageClose}>
                  Toque para fechar
                </Text>
              </Pressable>
            )}

            {/* BARRA DE PROGRESSO DA META DIÁRIA */}

            <View style={styles.progressBarCard}>
              <View style={styles.progressBarHeader}>
                <Text style={styles.progressBarTitle}>
                  Progresso do objetivo diário
                </Text>
                <Text style={styles.progressBarPercent}>
                  {progressoSeguro}%
                </Text>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressoSeguro}%` },
                  ]}
                />
              </View>
            </View>

            {/* NOVA META */}

            <View style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="target"
                  size={29}
                  color={VERDE_TEXTO}
                />
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>
                  Objetivo diário
                </Text>

                <Text style={styles.cardSubtitle}>
                  Defina quantos minutos deseja estudar.
                </Text>

                <View style={styles.metaInputRow}>
                  <TextInput
                    style={styles.inputMeta}
                    value={metaEditavel}
                    onChangeText={setMetaEditavel}
                    keyboardType="numeric"
                    placeholder="Minutos por dia"
                    placeholderTextColor="#999999"
                  />

                  <Pressable
                    style={styles.saveButton}
                    onPress={salvarMeta}
                  >
                    <Text style={styles.saveButtonText}>
                      Salvar
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* ATIVIDADES PENDENTES E CONCLUÍDAS */}

            <Pressable
              onPress={() =>
                router.push('/student/wellbeing/estudo/atividades')
              }
              style={({ pressed }) => [
                styles.infoCard,
                { minHeight: cardHeight },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="clipboard-list-outline"
                  size={29}
                  color={VERDE_TEXTO}
                />
              </View>

              <View style={styles.cardText}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>
                    Minhas atividades
                  </Text>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={21}
                    color="#AAAAAA"
                  />
                </View>

                <View style={styles.activityNumbers}>
                  <Text style={styles.cardSubtitle}>
                    {atividadesPendentes} pendentes
                  </Text>

                  <Text style={styles.activitySeparator}>•</Text>

                  <Text style={styles.cardSubtitle}>
                    {atividadesConcluidas} concluídas
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* ATALHOS DE NAVEGAÇÃO */}

            {secoes
              .filter((secao) => secao.titulo !== 'Minhas atividades')
              .map((secao) => (
                <Pressable
                  key={secao.rota}
                  onPress={() => router.push(secao.rota)}
                  style={({ pressed }) => [
                    styles.infoCard,
                    { height: cardHeight },
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={secao.icone}
                      size={29}
                      color={VERDE_TEXTO}
                    />
                  </View>

                  <View style={styles.cardText}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>
                        {secao.titulo}
                      </Text>

                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={21}
                        color="#AAAAAA"
                      />
                    </View>

                    <Text style={styles.cardSubtitle}>
                      {secao.descricao}
                    </Text>
                  </View>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: VERDE,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  hero: {
    backgroundColor: VERDE,
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  titleCompact: {
    fontSize: 30,
  },

  progressContainer: {
    marginTop: 17,
    borderRadius: 999,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  progressMainText: {
    fontSize: 27,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  progressSubText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 3,
  },

  amount: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  encouragement: {
    marginTop: 6,
    fontSize: 15,
    color: '#FFFFFF',
  },

  detailsContainer: {
    flex: 1,
    marginTop: -24,
    paddingTop: 29,
    paddingBottom: 12,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: '#FFFFFF',
  },

  detailsContent: {
    gap: 12,
    paddingBottom: 25,
  },

  progressBarCard: {
    width: '100%',
    backgroundColor: '#F2FAF5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.09,
    shadowRadius: 3,
    elevation: 3,
  },

  progressBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  progressBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: VERDE_TEXTO,
  },

  progressBarPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: VERDE_TEXTO,
  },

  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: VERDE_BARRA,
    borderRadius: 20,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: VERDE_TEXTO,
    borderRadius: 20,
  },

  infoCard: {
    width: '100%',
    minHeight: 88,
    borderRadius: 20,
    backgroundColor: '#F2FAF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.09,
    shadowRadius: 3,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  iconContainer: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardText: {
    flex: 1,
    marginLeft: 13,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: VERDE_TEXTO,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#999999',
  },

  activityNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  activitySeparator: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 4,
  },

  metaInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
  },

  inputMeta: {
    flex: 1,
    minWidth: 0,
    height: 37,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEDE2',
    borderRadius: 9,
    paddingHorizontal: 10,
    color: '#252A3A',
    fontSize: 12,
  },

  saveButton: {
    height: 37,
    backgroundColor: VERDE_TEXTO,
    borderRadius: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  messageCard: {
    backgroundColor: '#E8F5ED',
    borderRadius: 13,
    padding: 12,
  },

  messageText: {
    color: '#4D9874',
    fontSize: 13,
    fontWeight: '600',
  },

  messageClose: {
    color: '#4D9874',
    fontSize: 10,
    marginTop: 4,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 13,
  },

  footerText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
  },
});
