
import React from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import {
  useEstudos,
  dataLocal,
  formatarData,
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

const estilosCampoDataWeb = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: '46px',
  padding: '10px 13px',
  marginBottom: '13px',
  border: `1px solid ${CORES.borda}`,
  borderRadius: '11px',
  backgroundColor: '#FFFFFF',
  color: CORES.texto,
  fontSize: '14px',
  fontFamily: 'Arial, sans-serif',
};

export default function Atividades() {
  const router = useRouter();

  const {
    categorias,
    novaCategoria,
    setNovaCategoria,
    mostrarNovaCategoria,
    setMostrarNovaCategoria,
    campoDataAberto,
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
    mensagem,
    setMensagem,

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

        <Text style={styles.titulo}>Minhas atividades</Text>

        <Text style={styles.descricao}>
          Organize suas tarefas, acompanhe prazos e gerencie suas atividades escolares.
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

      {/* FORMULÁRIO */}
      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>
          Controle de atividades
        </Text>

        <Text style={styles.rotulo}>
          Tipo de atividade
        </Text>

        <View style={styles.listaMaterias}>
          {categorias.map((categoria) => (
            <Pressable
              key={categoria}
              onPress={() => setCategoriaSelecionada(categoria)}
              style={[
                styles.opcaoMateria,
                categoriaSelecionada === categoria &&
                  styles.opcaoSelecionada,
              ]}
            >
              <Text
                style={[
                  styles.textoMateria,
                  categoriaSelecionada === categoria &&
                    styles.textoSelecionado,
                ]}
              >
                {categoria}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() =>
              setMostrarNovaCategoria((anterior) => !anterior)
            }
            style={[
              styles.opcaoMateria,
              mostrarNovaCategoria && styles.opcaoSelecionada,
            ]}
          >
            <Text
              style={[
                styles.textoMateria,
                mostrarNovaCategoria && styles.textoSelecionado,
              ]}
            >
              + Criar categoria
            </Text>
          </Pressable>
        </View>

        {mostrarNovaCategoria && (
          <View style={styles.linhaCategoria}>
            <TextInput
              style={[styles.input, styles.inputCategoria]}
              value={novaCategoria}
              onChangeText={setNovaCategoria}
              placeholder="Nome da nova categoria"
              placeholderTextColor="#9297A8"
              onSubmitEditing={adicionarCategoria}
              returnKeyType="done"
            />

            <Pressable
              style={styles.botaoAdicionarCategoria}
              onPress={adicionarCategoria}
            >
              <Text style={styles.textoBotaoAdicionarCategoria}>
                Adicionar
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.tituloFormulario}>
          {editandoId ? 'Editar atividade' : 'Nova atividade'}
        </Text>

        <Text style={styles.rotulo}>
          Nome da atividade
        </Text>

        <TextInput
          style={styles.input}
          value={formAtividade.nome}
          onChangeText={(v) => atualizarCampoAtividade('nome', v)}
          placeholder="Ex.: Pesquisa sobre sustentabilidade"
          placeholderTextColor="#9297A8"
        />

        <Text style={styles.rotulo}>Matéria</Text>

        <TextInput
          style={styles.input}
          value={formAtividade.materia}
          onChangeText={(v) => atualizarCampoAtividade('materia', v)}
          placeholder="Ex.: Biologia"
          placeholderTextColor="#9297A8"
        />

        <Text style={styles.rotulo}>Descrição</Text>

        <TextInput
          style={[styles.input, styles.inputMultilinha]}
          value={formAtividade.descricao}
          onChangeText={(v) => atualizarCampoAtividade('descricao', v)}
          placeholder="Descreva o que precisa ser feito"
          placeholderTextColor="#9297A8"
          multiline
        />

        <Text style={styles.rotulo}>Nome do professor</Text>

        <TextInput
          style={styles.input}
          value={formAtividade.professor}
          onChangeText={(v) => atualizarCampoAtividade('professor', v)}
          placeholder="Nome do professor"
          placeholderTextColor="#9297A8"
        />

        {/* DATA DE INÍCIO */}
        <Text style={styles.rotulo}>Data de início</Text>

        {Platform.OS === 'web' ? (
          React.createElement('input', {
            type: 'date',
            value: formAtividade.dataInicio,
            onChange: (event) =>
              atualizarCampoAtividade(
                'dataInicio',
                event.target.value
              ),
            'aria-label': 'Data de início',
            style: estilosCampoDataWeb,
          })
        ) : (
          <Pressable
            style={styles.campoData}
            onPress={() => abrirCalendario('dataInicio')}
          >
            <Text style={styles.textoCampoData}>
              {formAtividade.dataInicio
                ? formatarData(formAtividade.dataInicio)
                : 'Selecionar data'}
            </Text>

            <Text style={styles.iconeCalendario}>▦</Text>
          </Pressable>
        )}

        {/* DATA DE ENTREGA */}
        <Text style={styles.rotulo}>Data de entrega</Text>

        {Platform.OS === 'web' ? (
          React.createElement('input', {
            type: 'date',
            value: formAtividade.dataEntrega,
            min: formAtividade.dataInicio || undefined,
            onChange: (event) =>
              atualizarCampoAtividade(
                'dataEntrega',
                event.target.value
              ),
            'aria-label': 'Data de entrega',
            style: estilosCampoDataWeb,
          })
        ) : (
          <Pressable
            style={styles.campoData}
            onPress={() => abrirCalendario('dataEntrega')}
          >
            <Text style={styles.textoCampoData}>
              {formAtividade.dataEntrega
                ? formatarData(formAtividade.dataEntrega)
                : 'Selecionar data'}
            </Text>

            <Text style={styles.iconeCalendario}>▦</Text>
          </Pressable>
        )}

        {/* CALENDÁRIO NATIVO */}
        {Platform.OS !== 'web' && campoDataAberto && (
          <DateTimePicker
            value={converterDataParaDate(
              formAtividade[campoDataAberto]
            )}
            mode="date"
            display="default"
            onChange={alterarData}
            minimumDate={
              campoDataAberto === 'dataEntrega'
                ? converterDataParaDate(formAtividade.dataInicio)
                : undefined
            }
            locale="pt-BR"
          />
        )}

        {/* STATUS */}
        <Text style={styles.rotulo}>Status</Text>

        <View style={styles.listaMaterias}>
          {['Pendente', 'Em andamento', 'Concluída'].map((status) => (
            <Pressable
              key={status}
              onPress={() => atualizarCampoAtividade('status', status)}
              style={[
                styles.opcaoMateria,
                formAtividade.status === status &&
                  styles.opcaoSelecionada,
              ]}
            >
              <Text
                style={[
                  styles.textoMateria,
                  formAtividade.status === status &&
                    styles.textoSelecionado,
                ]}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </View>

        <Botao
          titulo={editandoId ? 'Salvar alterações' : 'Cadastrar atividade'}
          onPress={salvarAtividade}
        />

        {editandoId && (
          <Botao
            titulo="Cancelar edição"
            secundario
            onPress={limparFormularioAtividade}
          />
        )}
      </View>

      {/* LISTA DE ATIVIDADES */}
      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>
          Minhas atividades
        </Text>

        <View style={styles.resumoTarefas}>
          <Text style={styles.textoResumo}>
            {atividadesPendentes} pendentes/em andamento
          </Text>

          <Text style={styles.textoResumo}>
            {atividadesConcluidas} concluídas
          </Text>
        </View>

        {/* FILTRO DE STATUS */}
        <Text style={styles.rotuloFiltro}>
          Filtrar por status
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosCategorias}
        >
          {['Todos', 'Pendente', 'Em andamento', 'Concluída'].map(
            (status) => (
              <Pressable
                key={status}
                onPress={() => setFiltroStatus(status)}
                style={[
                  styles.filtroCategoria,
                  filtroStatus === status && styles.filtroSelecionado,
                ]}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    filtroStatus === status &&
                      styles.textoFiltroSelecionado,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* FILTRO DE CATEGORIA */}
        <Text style={styles.rotuloFiltro}>
          Filtrar por tipo
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosCategorias}
        >
          <Pressable
            onPress={() => setFiltroCategoria('Todas')}
            style={[
              styles.filtroCategoria,
              filtroCategoria === 'Todas' && styles.filtroSelecionado,
            ]}
          >
            <Text
              style={[
                styles.textoFiltro,
                filtroCategoria === 'Todas' &&
                  styles.textoFiltroSelecionado,
              ]}
            >
              Todas
            </Text>
          </Pressable>

          {categorias.map((categoria) => (
            <Pressable
              key={categoria}
              onPress={() => setFiltroCategoria(categoria)}
              style={[
                styles.filtroCategoria,
                filtroCategoria === categoria && styles.filtroSelecionado,
              ]}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  filtroCategoria === categoria &&
                    styles.textoFiltroSelecionado,
                ]}
              >
                {categoria}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* RESULTADOS */}
        {atividadesFiltradas.length === 0 ? (
          <Text style={styles.vazio}>
            {atividades.length === 0
              ? 'Nenhuma atividade cadastrada ainda.'
              : 'Nenhuma atividade encontrada com esses filtros.'}
          </Text>
        ) : (
          atividadesFiltradas.map((item, indice) => (
            <View key={item.id} style={styles.cartaoAtividade}>
              {indice === 0 && item.status !== 'Concluída' && (
                <Text style={styles.rotuloProximaEntrega}>
                  ENTREGA MAIS PRÓXIMA
                </Text>
              )}

              <View style={styles.cabecalhoAtividade}>
                <View style={styles.infoAtividade}>
                  <Text style={styles.nomeAtividade}>
                    {item.nome}
                  </Text>

                  <Text style={styles.detalheAtividade}>
                    {item.categoria} • {item.materia}
                  </Text>

                  <Text style={styles.detalheAtividade}>
                    Professor(a): {item.professor}
                  </Text>
                </View>
              </View>

              {item.descricao ? (
                <Text style={styles.descricaoAtividade}>
                  {item.descricao}
                </Text>
              ) : null}

              <View style={styles.linhaStatusPrazo}>
                <View
                  style={[
                    styles.statusAtividade,
                    item.status === 'Concluída' &&
                      styles.statusConcluida,
                    item.status === 'Pendente' &&
                      styles.statusPendente,
                  ]}
                >
                  <Text
                    style={[
                      styles.textoStatusAtividade,
                      item.status === 'Concluída' &&
                        styles.textoStatusConcluida,
                      item.status === 'Pendente' &&
                        styles.textoStatusPendente,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.prazoAtividade}>
                  Entrega: {formatarData(item.dataEntrega)}
                </Text>
              </View>

              <Text style={styles.detalheAtividade}>
                Início: {formatarData(item.dataInicio)}
              </Text>

              {/* ALTERAR STATUS */}
              <View style={styles.listaStatusAtividade}>
                {['Pendente', 'Em andamento', 'Concluída'].map(
                  (status) => (
                    <Pressable
                      key={status}
                      onPress={() => alterarStatus(item.id, status)}
                      style={[
                        styles.opcaoMateria,
                        item.status === status &&
                          styles.opcaoSelecionada,
                      ]}
                    >
                      <Text
                        style={[
                          styles.textoMateria,
                          item.status === status &&
                            styles.textoSelecionado,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>

              {/* AÇÕES */}
              <View style={styles.acoesAtividade}>
                <Pressable
                  onPress={() => editarAtividade(item)}
                  style={styles.botaoAcaoAtividade}
                >
                  <Text style={styles.textoAcaoAtividade}>
                    Editar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => excluirAtividade(item.id)}
                  style={styles.botaoAcaoAtividade}
                >
                  <Text style={styles.textoExcluir}>
                    Excluir
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
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

  inputMultilinha: {
    minHeight: 80,
    textAlignVertical: 'top',
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

  linhaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  inputCategoria: {
    flex: 1,
    marginBottom: 13,
  },

  botaoAdicionarCategoria: {
    backgroundColor: CORES.principal,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 14,
    marginBottom: 13,
  },

  textoBotaoAdicionarCategoria: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  tituloFormulario: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 5,
  },

  campoData: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textoCampoData: {
    color: CORES.texto,
    fontSize: 14,
  },

  iconeCalendario: {
    color: CORES.principal,
    fontSize: 20,
    fontWeight: '700',
  },

  resumoTarefas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 13,
  },

  textoResumo: {
    color: CORES.secundario,
    fontSize: 12,
  },

  rotuloFiltro: {
    color: CORES.texto,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },

  filtrosCategorias: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },

  filtroCategoria: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: CORES.fundo,
  },

  filtroSelecionado: {
    backgroundColor: CORES.principalClaro,
  },

  textoFiltro: {
    color: CORES.secundario,
    fontSize: 13,
    fontWeight: '600',
  },

  textoFiltroSelecionado: {
    color: CORES.principal,
  },

  vazio: {
    color: CORES.secundario,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 14,
  },

  cartaoAtividade: {
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    paddingVertical: 15,
  },

  rotuloProximaEntrega: {
    color: CORES.secundario,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 7,
  },

  cabecalhoAtividade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 7,
  },

  infoAtividade: {
    flex: 1,
  },

  nomeAtividade: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: '700',
  },

  detalheAtividade: {
    color: CORES.secundario,
    fontSize: 12,
    marginTop: 4,
  },

  descricaoAtividade: {
    color: CORES.texto,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  linhaStatusPrazo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },

  statusAtividade: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCEBDD',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  statusConcluida: {
    backgroundColor: CORES.principalClaro,
  },

  statusPendente: {
    backgroundColor: '#ECEEF2',
  },

  textoStatusAtividade: {
    color: '#B65B20',
    fontSize: 11,
    fontWeight: '700',
  },

  textoStatusConcluida: {
    color: CORES.principal,
  },

  textoStatusPendente: {
    color: CORES.secundario,
  },

  listaStatusAtividade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },

  acoesAtividade: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 5,
  },

  botaoAcaoAtividade: {
    paddingVertical: 7,
    paddingHorizontal: 5,
  },

  textoAcaoAtividade: {
    color: CORES.principal,
    fontSize: 12,
    fontWeight: '700',
  },

  textoExcluir: {
    color: CORES.vermelho,
    fontSize: 12,
    fontWeight: '600',
  },

  mensagem: {
    backgroundColor: CORES.principalClaro,
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
