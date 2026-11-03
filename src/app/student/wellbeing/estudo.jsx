
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
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

const CATEGORIAS_PADRAO = [
  'Prova',
  'Trabalho',
  'Slides',
  'Seminário',
  'Lista de exercícios',
];

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

  // Categorias criadas pelo próprio aluno e atividades cadastradas.
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

  const atividadesPendentes = atividades.filter((item) => item.status !== 'Concluída').length;
  const atividadesConcluidas = atividades.filter((item) => item.status === 'Concluída').length;

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

  function adicionarCategoria() {
    const nome = novaCategoria.trim();
    if (!nome) {
      setMensagem('Digite o nome da categoria.');
      return;
    }
    const existe = categorias.some((item) => item.toLowerCase() === nome.toLowerCase());
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

  function atualizarCampoAtividade(campo, valor) {
    setFormAtividade((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function abrirCalendario(campo) {
    setCampoDataAberto(campo);
  }

  function alterarData(event, dataSelecionada) {
    if (event.type === 'set' && dataSelecionada && campoDataAberto) {
      atualizarCampoAtividade(campoDataAberto, dataLocal(dataSelecionada));
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
      nome: '', materia: '', descricao: '', professor: '',
      dataInicio: dataLocal(), dataEntrega: '', status: 'Pendente',
    });
    setCategoriaSelecionada('');
    setEditandoId(null);
  }

  function salvarAtividade() {
    const { nome, materia, descricao, professor, dataInicio, dataEntrega, status } = formAtividade;
    if (!nome.trim() || !materia.trim() || !descricao.trim() || !professor.trim() || !dataInicio.trim() || !dataEntrega.trim() || !categoriaSelecionada) {
      setMensagem('Preencha os campos e selecione uma categoria.');
      return;
    }
    const dataValida = (valor) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
      const [ano, mes, dia] = valor.split('-').map(Number);
      const data = new Date(ano, mes - 1, dia);
      return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
    };
    if (!dataValida(dataInicio) || !dataValida(dataEntrega)) {
      setMensagem('Informe datas válidas no formato AAAA-MM-DD (ex.: 2026-11-03).');
      return;
    }
    if (dataEntrega < dataInicio) {
      setMensagem('A data de entrega não pode ser anterior à data de início.');
      return;
    }
    const atividade = {
      id: editandoId || `${Date.now()}-${Math.random()}`,
      nome: nome.trim(), materia: materia.trim(), descricao: descricao.trim(),
      professor: professor.trim(), dataInicio, dataEntrega,
      categoria: categoriaSelecionada, status,
    };
    if (editandoId) {
      setAtividades((anteriores) => anteriores.map((item) => item.id === editandoId ? atividade : item));
      setMensagem('Atividade atualizada!');
    } else {
      setAtividades((anteriores) => [...anteriores, atividade]);
      setMensagem('Atividade cadastrada!');
    }
    limparFormularioAtividade();
  }

  function editarAtividade(item) {
    setFormAtividade({
      nome: item.nome, materia: item.materia, descricao: item.descricao,
      professor: item.professor, dataInicio: item.dataInicio,
      dataEntrega: item.dataEntrega, status: item.status,
    });
    setCategoriaSelecionada(item.categoria);
    setEditandoId(item.id);
  }

  function excluirAtividade(id) {
    setAtividades((anteriores) => anteriores.filter((item) => item.id !== id));
    setMensagem('Atividade excluída.');
  }

  function alterarStatus(id, status) {
    setAtividades((anteriores) => anteriores.map((item) => item.id === id ? { ...item, status } : item));
  }

  const atividadesFiltradas = atividades
    .filter((item) => filtroCategoria === 'Todas' || item.categoria === filtroCategoria)
    .filter((item) => filtroStatus === 'Todos' || item.status === filtroStatus)
    .sort((a, b) => {
      if (a.status === 'Concluída' && b.status !== 'Concluída') return 1;
      if (a.status !== 'Concluída' && b.status === 'Concluída') return -1;
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
        <Text style={styles.tituloSecao}>Controle de atividades</Text>

        <Text style={styles.rotulo}>Tipo de atividade</Text>
        <View style={styles.listaMaterias}>
          {categorias.map((categoria) => (
            <Pressable
              key={categoria}
              onPress={() => setCategoriaSelecionada(categoria)}
              style={[styles.opcaoMateria, categoriaSelecionada === categoria && styles.opcaoSelecionada]}
            >
              <Text style={[styles.textoMateria, categoriaSelecionada === categoria && styles.textoSelecionado]}>
                {categoria}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setMostrarNovaCategoria((anterior) => !anterior)}
            style={[styles.opcaoMateria, mostrarNovaCategoria && styles.opcaoSelecionada]}
          >
            <Text style={[styles.textoMateria, mostrarNovaCategoria && styles.textoSelecionado]}>+ Criar categoria</Text>
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
            <Pressable style={styles.botaoAdicionarCategoria} onPress={adicionarCategoria}>
              <Text style={styles.textoBotaoAdicionarCategoria}>Adicionar</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.tituloFormulario}>{editandoId ? 'Editar atividade' : 'Nova atividade'}</Text>
        <Text style={styles.rotulo}>Nome da atividade</Text>
        <TextInput style={styles.input} value={formAtividade.nome} onChangeText={(v) => atualizarCampoAtividade('nome', v)} placeholder="Ex.: Pesquisa sobre sustentabilidade" placeholderTextColor="#9297A8" />
        <Text style={styles.rotulo}>Matéria</Text>
        <TextInput style={styles.input} value={formAtividade.materia} onChangeText={(v) => atualizarCampoAtividade('materia', v)} placeholder="Ex.: Biologia" placeholderTextColor="#9297A8" />
        <Text style={styles.rotulo}>Descrição</Text>
        <TextInput style={[styles.input, styles.inputMultilinha]} value={formAtividade.descricao} onChangeText={(v) => atualizarCampoAtividade('descricao', v)} placeholder="Descreva o que precisa ser feito" placeholderTextColor="#9297A8" multiline />
        <Text style={styles.rotulo}>Nome do professor</Text>
        <TextInput style={styles.input} value={formAtividade.professor} onChangeText={(v) => atualizarCampoAtividade('professor', v)} placeholder="Nome do professor" placeholderTextColor="#9297A8" />
        <Text style={styles.rotulo}>Data de início</Text>
        {Platform.OS === 'web' ? (
          React.createElement('input', {
            type: 'date',
            value: formAtividade.dataInicio,
            onChange: (event) => atualizarCampoAtividade('dataInicio', event.target.value),
            'aria-label': 'Data de início',
            style: estilosCampoDataWeb,
          })
        ) : (
          <Pressable style={styles.campoData} onPress={() => abrirCalendario('dataInicio')}>
            <Text style={styles.textoCampoData}>{formAtividade.dataInicio ? formatarData(formAtividade.dataInicio) : 'Selecionar data'}</Text>
            <Text style={styles.iconeCalendario}>▦</Text>
          </Pressable>
        )}

        <Text style={styles.rotulo}>Data de entrega</Text>
        {Platform.OS === 'web' ? (
          React.createElement('input', {
            type: 'date',
            value: formAtividade.dataEntrega,
            min: formAtividade.dataInicio || undefined,
            onChange: (event) => atualizarCampoAtividade('dataEntrega', event.target.value),
            'aria-label': 'Data de entrega',
            style: estilosCampoDataWeb,
          })
        ) : (
          <Pressable style={styles.campoData} onPress={() => abrirCalendario('dataEntrega')}>
            <Text style={styles.textoCampoData}>{formAtividade.dataEntrega ? formatarData(formAtividade.dataEntrega) : 'Selecionar data'}</Text>
            <Text style={styles.iconeCalendario}>▦</Text>
          </Pressable>
        )}

        {Platform.OS !== 'web' && campoDataAberto && (
          <DateTimePicker
            value={converterDataParaDate(formAtividade[campoDataAberto])}
            mode="date"
            display="default"
            onChange={alterarData}
            minimumDate={campoDataAberto === 'dataEntrega' ? converterDataParaDate(formAtividade.dataInicio) : undefined}
            locale="pt-BR"
          />
        )}
        <Text style={styles.rotulo}>Status</Text>
        <View style={styles.listaMaterias}>
          {['Pendente', 'Em andamento', 'Concluída'].map((status) => (
            <Pressable key={status} onPress={() => atualizarCampoAtividade('status', status)} style={[styles.opcaoMateria, formAtividade.status === status && styles.opcaoSelecionada]}>
              <Text style={[styles.textoMateria, formAtividade.status === status && styles.textoSelecionado]}>{status}</Text>
            </Pressable>
          ))}
        </View>
        <Botao titulo={editandoId ? 'Salvar alterações' : 'Cadastrar atividade'} onPress={salvarAtividade} />
        {editandoId && <Botao titulo="Cancelar edição" secundario onPress={limparFormularioAtividade} />}

        <View style={styles.separadorAtividades} />
        <Text style={styles.tituloSecao}>Minhas atividades</Text>
        <View style={styles.resumoTarefas}>
          <Text style={styles.textoResumo}>{atividadesPendentes} pendentes/em andamento</Text>
          <Text style={styles.textoResumo}>{atividadesConcluidas} concluídas</Text>
        </View>

        <Text style={styles.rotuloFiltro}>Filtrar por status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosCategorias}>
          {['Todos', 'Pendente', 'Em andamento', 'Concluída'].map((status) => (
            <Pressable key={status} onPress={() => setFiltroStatus(status)} style={[styles.filtroCategoria, filtroStatus === status && styles.filtroSelecionado]}>
              <Text style={[styles.textoFiltro, filtroStatus === status && styles.textoFiltroSelecionado]}>{status}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.rotuloFiltro}>Filtrar por tipo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosCategorias}>
          <Pressable onPress={() => setFiltroCategoria('Todas')} style={[styles.filtroCategoria, filtroCategoria === 'Todas' && styles.filtroSelecionado]}>
            <Text style={[styles.textoFiltro, filtroCategoria === 'Todas' && styles.textoFiltroSelecionado]}>Todas</Text>
          </Pressable>
          {categorias.map((categoria) => (
            <Pressable key={categoria} onPress={() => setFiltroCategoria(categoria)} style={[styles.filtroCategoria, filtroCategoria === categoria && styles.filtroSelecionado]}>
              <Text style={[styles.textoFiltro, filtroCategoria === categoria && styles.textoFiltroSelecionado]}>{categoria}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {atividadesFiltradas.length === 0 ? (
          <Text style={styles.vazio}>{atividades.length === 0 ? 'Nenhuma atividade cadastrada ainda.' : 'Nenhuma atividade encontrada com esses filtros.'}</Text>
        ) : (
          atividadesFiltradas.map((item, indice) => (
            <View key={item.id} style={styles.cartaoAtividade}>
              {indice === 0 && item.status !== 'Concluída' && (
                <Text style={styles.rotuloProximaEntrega}>ENTREGA MAIS PRÓXIMA</Text>
              )}
              <View style={styles.cabecalhoAtividade}>
                <View style={styles.infoAtividade}>
                  <Text style={styles.nomeAtividade}>{item.nome}</Text>
                  <Text style={styles.detalheAtividade}>{item.categoria} • {item.materia}</Text>
                  <Text style={styles.detalheAtividade}>Professor(a): {item.professor}</Text>
                </View>
              </View>
              {item.descricao ? <Text style={styles.descricaoAtividade}>{item.descricao}</Text> : null}
              <View style={styles.linhaStatusPrazo}>
                <View style={[styles.statusAtividade, item.status === 'Concluída' && styles.statusConcluida, item.status === 'Pendente' && styles.statusPendente]}>
                  <Text style={[styles.textoStatusAtividade, item.status === 'Concluída' && styles.textoStatusConcluida, item.status === 'Pendente' && styles.textoStatusPendente]}>{item.status}</Text>
                </View>
                <Text style={styles.prazoAtividade}>Entrega: {formatarData(item.dataEntrega)}</Text>
              </View>
              <Text style={styles.detalheAtividade}>Início: {formatarData(item.dataInicio)}</Text>
              <View style={styles.listaStatusAtividade}>
                {['Pendente', 'Em andamento', 'Concluída'].map((status) => (
                  <Pressable key={status} onPress={() => alterarStatus(item.id, status)} style={[styles.opcaoMateria, item.status === status && styles.opcaoSelecionada]}>
                    <Text style={[styles.textoMateria, item.status === status && styles.textoSelecionado]}>{status}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.acoesAtividade}>
                <Pressable onPress={() => editarAtividade(item)} style={styles.botaoAcaoAtividade}><Text style={styles.textoAcaoAtividade}>Editar</Text></Pressable>
                <Pressable onPress={() => excluirAtividade(item.id)} style={styles.botaoAcaoAtividade}><Text style={styles.textoExcluir}>Excluir</Text></Pressable>
              </View>
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
    color: '#EAF5EF',
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
    backgroundColor: '#A8D5BF',
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
  linhaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  inputMultilinha: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  separadorAtividades: {
    height: 1,
    backgroundColor: CORES.borda,
    marginVertical: 20,
  },
  rotuloFiltro: {
    color: CORES.texto,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  rotuloProximaEntrega: {
    color: CORES.secundario,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 7,
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
  cartaoAtividade: {
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    paddingVertical: 15,
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
  prazoAtividade: {
    color: CORES.principal,
    fontWeight: '700',
    fontSize: 12,
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
  rotuloStatus: {
    color: CORES.texto,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 7,
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