
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

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

const MATERIAS = [
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

function dataLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarTempo(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas}h`;

  return `${horas}h ${resto}min`;
}

function inicioDaSemana(data = new Date()) {
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

export default function Estudo() {
  const hoje = dataLocal();

  const [registros, setRegistros] = useState([]);
  const [materia, setMateria] = useState('Matemática');
  const [materiaManual, setMateriaManual] = useState('Matemática');
  const [minutosManuais, setMinutosManuais] = useState('');
  const [meta, setMeta] = useState('120');
  const [metaEditavel, setMetaEditavel] = useState('120');
  const [sessaoAtiva, setSessaoAtiva] = useState(null);

  const [novaTarefa, setNovaTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);

  const [periodo, setPeriodo] = useState('dia');
  const [mensagem, setMensagem] = useState('');

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

  const tarefasPendentes = tarefas.filter(
    (tarefa) => !tarefa.concluida
  ).length;

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.concluida
  ).length;

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

  function salvarMeta() {
    const valor = Number(metaEditavel);

    if (
      metaEditavel.trim() === '' ||
      !Number.isFinite(valor) ||
      valor < 1 ||
      !Number.isInteger(valor)
    ) {
      setMensagem('Defina uma meta em minutos, usando um número inteiro maior que zero.');
      return;
    }

    setMeta(String(valor));
    setMensagem('Meta diária atualizada!');
  }

  function adicionarTarefa() {
    const titulo = novaTarefa.trim();

    if (!titulo) {
      setMensagem('Digite o nome da tarefa.');
      return;
    }

    setTarefas((anteriores) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        titulo,
        concluida: false,
      },
      ...anteriores,
    ]);

    setNovaTarefa('');
    setMensagem('Tarefa adicionada!');
  }

  function alternarTarefa(id) {
    setTarefas((anteriores) =>
      anteriores.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa
      )
    );
  }

  function excluirTarefa(id) {
    setTarefas((anteriores) =>
      anteriores.filter((tarefa) => tarefa.id !== id)
    );
  }

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
    .sort((a, b) => new Date(b.fim) - new Date(a.fim));

  const totalPeriodo = registrosFiltrados.reduce(
    (total, registro) => total + registro.minutos,
    0
  );

  const tituloPeriodo = {
    dia: 'Registros de hoje',
    semana: 'Registros desta semana',
    mes: 'Registros deste mês',
  };

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.cabecalho}>
        <Text style={styles.subtitulo}>BEM-ESTAR</Text>
        <Text style={styles.titulo}>Meus estudos</Text>
        <Text style={styles.descricao}>
          Organize seu tempo e acompanhe seu progresso.
        </Text>
      </View>

      {mensagem !== '' && (
        <Pressable
          style={styles.mensagem}
          onPress={() => setMensagem('')}
        >
          <Text style={styles.textoMensagem}>{mensagem}</Text>
          <Text style={styles.fecharMensagem}>Toque para fechar</Text>
        </Pressable>
      )}

      <View style={styles.cartaoMeta}>
        <Text style={styles.rotuloClaro}>TEMPO ESTUDADO HOJE</Text>

        <Text style={styles.tempoGrande}>
          {formatarTempo(minutosHoje)}
        </Text>

        <Text style={styles.textoMeta}>
          Meta: {formatarTempo(metaMinutos)}
        </Text>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraProgresso,
              { width: `${progresso}%` },
            ]}
          />
        </View>

        <Text style={styles.textoProgresso}>
          {metaMinutos > 0
            ? `${progresso}% da meta diária`
            : 'Defina uma meta para acompanhar o progresso'}
        </Text>

        <View style={styles.linhaMeta}>
          <TextInput
            style={styles.inputMeta}
            value={metaEditavel}
            onChangeText={setMetaEditavel}
            keyboardType="numeric"
            placeholder="Minutos por dia"
            placeholderTextColor="#777D90"
          />
          <Pressable
            style={styles.botaoMeta}
            onPress={salvarMeta}
          >
            <Text style={styles.textoBotaoMeta}>Salvar meta</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>Registrar tempo manualmente</Text>
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

        <Text style={styles.rotulo}>Tempo estudado (em minutos)</Text>
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

      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>Sessão de estudo</Text>
        <Text style={styles.ajuda}>
          Inicie quando começar a estudar e finalize ao terminar.
        </Text>

        <Text style={styles.rotulo}>Matéria da sessão</Text>

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

      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>Minhas tarefas</Text>
        <Text style={styles.ajuda}>
          Planeje o que precisa estudar e marque quando concluir.
        </Text>

        <View style={styles.resumoTarefas}>
          <Text style={styles.textoResumo}>
            {tarefasPendentes} pendentes
          </Text>
          <Text style={styles.textoResumo}>
            {tarefasConcluidas} concluídas
          </Text>
        </View>

        <TextInput
          style={styles.input}
          value={novaTarefa}
          onChangeText={setNovaTarefa}
          placeholder="Ex.: Revisar conteúdo de Biologia"
          placeholderTextColor="#9297A8"
          onSubmitEditing={adicionarTarefa}
          returnKeyType="done"
        />

        <Botao
          titulo="Adicionar tarefa"
          onPress={adicionarTarefa}
        />

        {tarefas.length === 0 ? (
          <Text style={styles.vazio}>
            Nenhuma tarefa adicionada ainda.
          </Text>
        ) : (
          tarefas.map((tarefa) => (
            <View key={tarefa.id} style={styles.linhaTarefa}>
              <Pressable
                onPress={() => alternarTarefa(tarefa.id)}
                style={styles.areaTarefa}
              >
                <View
                  style={[
                    styles.checkbox,
                    tarefa.concluida && styles.checkboxMarcado,
                  ]}
                >
                  {tarefa.concluida && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.textoTarefa,
                    tarefa.concluida && styles.tarefaConcluida,
                  ]}
                >
                  {tarefa.titulo}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => excluirTarefa(tarefa.id)}
                style={styles.botaoExcluir}
              >
                <Text style={styles.textoExcluir}>Excluir</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>Histórico de estudos</Text>

        <View style={styles.filtros}>
          {[
            { id: 'dia', nome: 'Dia' },
            { id: 'semana', nome: 'Semana' },
            { id: 'mes', nome: 'Mês' },
          ].map((filtro) => (
            <Pressable
              key={filtro.id}
              onPress={() => setPeriodo(filtro.id)}
              style={[
                styles.filtro,
                periodo === filtro.id && styles.filtroSelecionado,
              ]}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  periodo === filtro.id && styles.textoFiltroSelecionado,
                ]}
              >
                {filtro.nome}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.totalHistorico}>
          <Text style={styles.textoTotal}>
            Tempo no período
          </Text>
          <Text style={styles.valorTotal}>
            {formatarTempo(totalPeriodo)}
          </Text>
        </View>

        <Text style={styles.rotuloHistorico}>
          {tituloPeriodo[periodo]}
        </Text>

        {registrosFiltrados.length === 0 ? (
          <Text style={styles.vazio}>
            Nenhum registro neste período.
          </Text>
        ) : (
          registrosFiltrados.map((registro) => (
            <View key={registro.id} style={styles.registro}>
              <View style={styles.registroCabecalho}>
                <View style={styles.registroInfo}>
                  <Text style={styles.nomeMateria}>
                    {registro.materia}
                  </Text>
                  <Text style={styles.dataRegistro}>
                    {formatarData(registro.data)}
                  </Text>
                  <Text style={styles.dataRegistro}>
                    {formatarHora(registro.inicio)} –{' '}
                    {formatarHora(registro.fim)}
                  </Text>
                </View>

                <Text style={styles.duracao}>
                  {formatarTempo(registro.minutos)}
                </Text>
              </View>

              <Pressable
                onPress={() => excluirRegistro(registro.id)}
                style={styles.excluirRegistro}
              >
                <Text style={styles.textoExcluir}>
                  Excluir registro
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

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
  cartaoMeta: {
    backgroundColor: CORES.principal,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
  },
  rotuloClaro: {
    color: '#F0FFF7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tempoGrande: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 8,
  },
  textoMeta: {
    color: '#FFFFFF',
    marginTop: 5,
    fontSize: 14,
  },
  barraFundo: {
    height: 9,
    backgroundColor: '#A9D7BE',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 17,
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  textoProgresso: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  linhaMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 17,
  },
  inputMeta: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: CORES.texto,
  },
  botaoMeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textoBotaoMeta: {
    color: CORES.principal,
    fontWeight: '700',
    fontSize: 12,
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
  linhaTarefa: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    paddingVertical: 13,
    gap: 8,
  },
  areaTarefa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: CORES.principal,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: {
    backgroundColor: CORES.principal,
  },
  check: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  textoTarefa: {
    flex: 1,
    color: CORES.texto,
    fontSize: 13,
  },
  tarefaConcluida: {
    textDecorationLine: 'line-through',
    color: CORES.secundario,
  },
  botaoExcluir: {
    paddingVertical: 7,
    paddingHorizontal: 5,
  },
  textoExcluir: {
    color: CORES.vermelho,
    fontSize: 12,
    fontWeight: '600',
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 17,
  },
  filtro: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
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
  totalHistorico: {
    backgroundColor: CORES.fundo,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 17,
  },
  textoTotal: {
    color: CORES.secundario,
    fontSize: 12,
  },
  valorTotal: {
    color: CORES.texto,
    fontWeight: '700',
    fontSize: 17,
  },
  rotuloHistorico: {
    color: CORES.texto,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 10,
  },
  registro: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
  },
  registroCabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  registroInfo: {
    flex: 1,
  },
  nomeMateria: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  dataRegistro: {
    color: CORES.secundario,
    fontSize: 12,
    marginTop: 5,
  },
  duracao: {
    color: CORES.principal,
    fontSize: 15,
    fontWeight: '700',
  },
  excluirRegistro: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  vazio: {
    color: CORES.secundario,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 14,
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

// import { Text, View } from 'react-native';


// export default function Estudo() {
//     return (
//         <View>
//             <Text>Tela de estudo</Text>
//         </View>
//     );
// }
// import { Text, View } from 'react-native';


// export default function Estudo() {
//     return (
//         <View>
//             <Text>Tela de estudo</Text>
//         </View>
//     );
// }