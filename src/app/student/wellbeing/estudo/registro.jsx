
import React from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  useEstudos,
  MATERIAS,
  formatarHora,
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
    finalizarSessao,
  } = useEstudos();

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
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

      {/* MENSAGEM */}
      {mensagem !== '' && (
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
      )}

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
                materiaManual === item && styles.opcaoSelecionada,
              ]}
            >
              <Text
                style={[
                  styles.textoMateria,
                  materiaManual === item && styles.textoSelecionado,
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

      {/* CRONÔMETRO */}
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
                materia === item && styles.opcaoSelecionada,
                !!sessaoAtiva && styles.opcaoDesabilitada,
              ]}
            >
              <Text
                style={[
                  styles.textoMateria,
                  materia === item && styles.textoSelecionado,
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
              Sessão em andamento
            </Text>

            <Text style={styles.textoAjudaSessao}>
              Matéria: {sessaoAtiva.materia}
            </Text>

            <Text style={styles.textoAjudaSessao}>
              Início: {formatarHora(sessaoAtiva.inicio)}
            </Text>

            <Botao
              titulo="Finalizar sessão"
              onPress={finalizarSessao}
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
    marginTop: 5,
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
