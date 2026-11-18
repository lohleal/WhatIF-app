
import React, { useEffect, useState } from 'react';

import {
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MATERIAS,
  formatarHora,
  useEstudos,
} from '../../../../features/study/context/EstudosContext';

const CORES = {
  fundo: '#F7F8FC',
  branco: '#FFFFFF',
  principal: '#378568',
  principalClaro: '#E4F4EC',
  texto: '#252A3A',
  secundario: '#777D90',
  borda: '#E6E8F0',
  verde: '#378568',
  verdeClaro: '#E4F4EC',
  vermelho: '#C95353',
};

function Botao({ titulo, onPress, secundario = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.botao,
        secundario && styles.botaoSecundario,
      ]}
    >
      <Text
        style={[
          styles.textoBotao,
          secundario && styles.textoBotaoSecundario,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

function formatarCronometro(milissegundos) {
  const segundosTotais = Math.floor(milissegundos / 1000);

  const horas = Math.floor(segundosTotais / 3600);
  const minutos = Math.floor((segundosTotais % 3600) / 60);
  const segundos = segundosTotais % 60;

  return [
    String(horas).padStart(2, '0'),
    String(minutos).padStart(2, '0'),
    String(segundos).padStart(2, '0'),
  ].join(':');
}

export default function RegistroEstudo() {
  const router = useRouter();

  const {
    materia,
    setMateria,
    materiaManual,
    setMateriaManual,
    minutosManuais,
    setMinutosManuais,
    sessaoAtiva,
    mensagem,
    setMensagem,
    adicionarTempoManual,
    iniciarSessao,
    pausarSessao,
    continuarSessao,
    finalizarSessao,
  } = useEstudos();

  const [atualizacao, setAtualizacao] = useState(Date.now());

  // Atualiza o cronômetro a cada segundo.
  useEffect(() => {
    if (!sessaoAtiva || sessaoAtiva.pausadaEm) {
      return;
    }

    const intervalo = setInterval(() => {
      setAtualizacao(Date.now());
    }, 1000);

    return () => clearInterval(intervalo);
  }, [sessaoAtiva]);

  // Calcula somente o tempo efetivamente estudado.
  const tempoDecorrido = sessaoAtiva
    ? sessaoAtiva.tempoAcumulado +
      (sessaoAtiva.inicioTrecho
        ? atualizacao -
          new Date(sessaoAtiva.inicioTrecho).getTime()
        : 0)
    : 0;

  // Finaliza a sessão e exibe a confirmação.
  function concluirSessao() {
    if (!sessaoAtiva || tempoDecorrido <= 0) {
      return;
    }

    finalizarSessao();
    setMensagem('SESSAO_REGISTRADA');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: CORES.fundo }} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.tela}
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          nestedScrollEnabled={true}
        >
      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <Pressable
          onPress={() => router.back()}
          style={styles.botaoVoltar}
        >
          <Text style={styles.textoVoltar}>‹ Voltar</Text>
        </Pressable>

        <Text style={styles.subtitulo}>BEM-ESTAR</Text>

        <Text style={styles.titulo}>Registro de estudo</Text>

        <Text style={styles.descricao}>
          Registre seu tempo de estudo e acompanhe sua rotina.
        </Text>
      </View>

      {/* MENSAGEM DE CONFIRMAÇÃO */}
      {mensagem === 'SESSAO_REGISTRADA' ? (
        <View style={styles.mensagemSucesso}>
          <Text style={styles.iconeSucesso}>✓</Text>

          <Text style={styles.tituloSucesso}>
            Sessão registrada!
          </Text>

          <Text style={styles.textoSucesso}>
            Seu tempo de estudo foi registrado com sucesso.
            Continue assim! Cada pequeno passo conta para
            alcançar seus objetivos.
          </Text>

          <Pressable
            style={styles.botaoFecharSucesso}
            onPress={() => setMensagem('')}
          >
            <Text style={styles.textoBotaoFechar}>
              Continuar
            </Text>
          </Pressable>
        </View>
      ) : mensagem !== '' ? (
        <Pressable
          style={styles.mensagem}
          onPress={() => setMensagem('')}
        >
          <Text style={styles.textoMensagem}>
            {mensagem}
          </Text>

          <Text style={styles.fecharMensagem}>
            Toque para fechar
          </Text>
        </Pressable>
      ) : null}

      {/* REGISTRO MANUAL */}
      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>
          Registrar tempo manualmente
        </Text>

        <Text style={styles.ajuda}>
          Para registrar um estudo que você já terminou.
        </Text>

        <Text style={styles.rotulo}>Matéria</Text>

        <View style={styles.listaMaterias}>
          {MATERIAS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setMateriaManual(item)}
              style={[
                styles.opcaoMateria,
                materiaManual === item &&
                  styles.opcaoSelecionada,
              ]}
            >
              <Text
                style={[
                  styles.textoMateria,
                  materiaManual === item &&
                    styles.textoSelecionado,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.rotulo}>
          Tempo estudado (em minutos)
        </Text>

        <TextInput
          style={styles.input}
          value={minutosManuais}
          onChangeText={setMinutosManuais}
          keyboardType="numeric"
          placeholder="Ex.: 45"
          placeholderTextColor="#9297A8"
        />

        <Botao
          titulo="Adicionar registro"
          onPress={adicionarTempoManual}
        />
      </View>

      {/* SESSÃO DE ESTUDO */}
      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>
          Sessão de estudo
        </Text>

        <Text style={styles.ajuda}>
          Inicie quando começar a estudar e finalize ao terminar.
        </Text>

        <Text style={styles.rotulo}>
          Matéria da sessão
        </Text>

        <View style={styles.listaMaterias}>
          {MATERIAS.map((item) => (
            <Pressable
              key={item}
              disabled={!!sessaoAtiva}
              onPress={() => setMateria(item)}
              style={[
                styles.opcaoMateria,
                materia === item &&
                  styles.opcaoSelecionada,
                !!sessaoAtiva &&
                  styles.opcaoDesabilitada,
              ]}
            >
              <Text
                style={[
                  styles.textoMateria,
                  materia === item &&
                    styles.textoSelecionado,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {sessaoAtiva ? (
          <View style={styles.sessaoAtiva}>
            <Text style={styles.textoSessao}>
              {sessaoAtiva.pausadaEm
                ? 'Sessão pausada'
                : 'Sessão em andamento'}
            </Text>

            <Text style={styles.textoAjudaSessao}>
              Matéria: {sessaoAtiva.materia}
            </Text>

            <Text style={styles.textoAjudaSessao}>
              Início: {formatarHora(sessaoAtiva.inicioOriginal)}
            </Text>

            <Text style={styles.rotuloCronometro}>
              TEMPO DE ESTUDO
            </Text>

            <Text style={styles.cronometro}>
              {formatarCronometro(tempoDecorrido)}
            </Text>

            {sessaoAtiva.pausadaEm ? (
              <Botao
                titulo="Continuar sessão"
                onPress={continuarSessao}
              />
            ) : (
              <Botao
                titulo="Pausar sessão"
                onPress={pausarSessao}
                secundario
              />
            )}

            <Botao
              titulo="Finalizar sessão"
              onPress={concluirSessao}
            />
          </View>
        ) : (
          <Botao
            titulo="Iniciar sessão"
            onPress={iniciarSessao}
          />
        )}
      </View>

      {/* RODAPÉ */}
      <View style={styles.rodape}>
        <Text style={styles.textoRodape}>
          Pequenos passos também fazem parte do progresso.
        </Text>
      </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },

  cabecalho: {
    marginTop: 12,
    marginBottom: 22,
  },

  botaoVoltar: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 5,
    paddingRight: 12,
  },

  textoVoltar: {
    color: CORES.principal,
    fontSize: 14,
    fontWeight: '700',
  },

  subtitulo: {
    color: CORES.principal,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  titulo: {
    fontSize: 29,
    fontWeight: '700',
    color: CORES.texto,
  },

  descricao: {
    color: CORES.secundario,
    fontSize: 14,
    marginTop: 7,
    lineHeight: 21,
  },

  cartao: {
    backgroundColor: CORES.branco,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },

  tituloSecao: {
    color: CORES.texto,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 7,
  },

  ajuda: {
    color: CORES.secundario,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },

  rotulo: {
    color: CORES.texto,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 9,
    marginTop: 7,
  },

  listaMaterias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },

  opcaoMateria: {
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },

  opcaoSelecionada: {
    backgroundColor: CORES.principalClaro,
    borderColor: CORES.principal,
  },

  opcaoDesabilitada: {
    opacity: 0.65,
  },

  textoMateria: {
    fontSize: 12,
    color: CORES.secundario,
  },

  textoSelecionado: {
    color: CORES.principal,
    fontWeight: '700',
  },

  input: {
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: CORES.texto,
    backgroundColor: '#FFFFFF',
    marginBottom: 13,
  },

  botao: {
    backgroundColor: CORES.principal,
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  botaoSecundario: {
    backgroundColor: CORES.principalClaro,
  },

  textoBotaoSecundario: {
    color: CORES.principal,
  },

  sessaoAtiva: {
    backgroundColor: CORES.verdeClaro,
    borderRadius: 12,
    padding: 14,
  },

  textoSessao: {
    color: CORES.verde,
    fontWeight: '700',
    fontSize: 15,
  },

  textoAjudaSessao: {
    color: CORES.texto,
    fontSize: 13,
    marginTop: 7,
  },

  rotuloCronometro: {
    color: CORES.secundario,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 22,
  },

  cronometro: {
    color: CORES.principal,
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginVertical: 10,
  },

  mensagem: {
    backgroundColor: CORES.verdeClaro,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  textoMensagem: {
    color: CORES.verde,
    fontSize: 13,
    fontWeight: '600',
  },

  fecharMensagem: {
    color: CORES.verde,
    fontSize: 10,
    marginTop: 4,
  },

  mensagemSucesso: {
    backgroundColor: '#E4F4EC',
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B8E2CC',
  },

  iconeSucesso: {
    width: 54,
    height: 54,
    lineHeight: 54,
    textAlign: 'center',
    borderRadius: 27,
    overflow: 'hidden',
    backgroundColor: '#378568',
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 14,
  },

  tituloSucesso: {
    color: '#286B52',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  textoSucesso: {
    color: '#426B59',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },

  botaoFecharSucesso: {
    backgroundColor: '#378568',
    paddingVertical: 13,
    paddingHorizontal: 35,
    borderRadius: 11,
    marginTop: 20,
  },

  textoBotaoFechar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  rodape: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  textoRodape: {
    color: CORES.secundario,
    fontSize: 12,
    textAlign: 'center',
  },
});
