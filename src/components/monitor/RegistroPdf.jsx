import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import { linhasDeInformacao } from '../../utils/exportarFicha'
import { formatarDataBr, formatarDuracao, hojeEmIso, minutosEntre } from '../../utils/ficha'

// Largura de cada coluna da tabela, em % (soma 100).
const COLUNAS = [
  { titulo: 'Data', largura: '10%', centro: true },
  { titulo: 'Início', largura: '7%', centro: true },
  { titulo: 'Término', largura: '8%', centro: true },
  { titulo: 'Duração', largura: '8%', centro: true },
  { titulo: 'Aluno atendido', largura: '22%' },
  { titulo: 'RA do aluno (opcional)', largura: '13%', centro: true },
  { titulo: 'Atividade realizada', largura: '32%' },
]

const estilos = StyleSheet.create({
  pagina: { padding: 28, paddingBottom: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#243D38' },
  titulo: {
    backgroundColor: '#315C50',
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 10,
  },
  unidade: { marginTop: 4, marginBottom: 10, fontSize: 9, textAlign: 'center', fontFamily: 'Helvetica-Oblique' },
  info: { flexDirection: 'row', borderWidth: 0.5, borderColor: '#B8C4BC', borderTopWidth: 0 },
  infoTopo: { borderTopWidth: 0.5 },
  infoRotulo: { width: '22%', padding: 4, backgroundColor: '#E4EDE7', fontFamily: 'Helvetica-Bold' },
  infoValor: { width: '78%', padding: 4 },
  cabecalhoTabela: { flexDirection: 'row', marginTop: 12, backgroundColor: '#315C50' },
  celulaCabecalho: { padding: 5, color: '#FFFFFF', fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  linha: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#B8C4BC', borderLeftWidth: 0.5, borderLeftColor: '#B8C4BC', borderRightWidth: 0.5, borderRightColor: '#B8C4BC' },
  celula: { padding: 5 },
  total: { flexDirection: 'row', backgroundColor: '#E4EDE7', borderWidth: 0.5, borderColor: '#B8C4BC', fontFamily: 'Helvetica-Bold' },
  assinaturas: { marginTop: 48, flexDirection: 'row', justifyContent: 'space-between' },
  assinatura: { width: '44%', borderTopWidth: 0.8, borderTopColor: '#243D38', paddingTop: 4, textAlign: 'center' },
  legenda: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  nomeAssinatura: { fontSize: 9 },
  rodape: { position: 'absolute', bottom: 16, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#68766E' },
})

// Registro de atendimentos em A4 paisagem: cabeçalho, tabela com total e campos de assinatura.
export default function RegistroPdf({ registros, dados }) {
  const informacoes = linhasDeInformacao(dados)
  const ordenados = [...registros].sort((a, b) => `${a.data}T${a.inicio}`.localeCompare(`${b.data}T${b.inicio}`))
  const totalMinutos = ordenados.reduce((soma, item) => soma + minutosEntre(item.inicio, item.termino), 0)

  return (
    <Document title="Controle de Registro de Monitoria Acadêmica" author="Monitoria FATEC">
      <Page size="A4" orientation="landscape" style={estilos.pagina}>
        <Text style={estilos.titulo}>Controle de Registro de Monitoria Acadêmica</Text>
        <Text style={estilos.unidade}>Fatec Zona Leste</Text>

        <View>
          {informacoes.map(([rotulo, valor], indice) => (
            <View key={rotulo} style={[estilos.info, indice === 0 ? estilos.infoTopo : null]}>
              <Text style={estilos.infoRotulo}>{rotulo}</Text>
              <Text style={estilos.infoValor}>{valor || ''}</Text>
            </View>
          ))}
        </View>

        <View style={estilos.cabecalhoTabela} fixed>
          {COLUNAS.map((coluna) => (
            <Text key={coluna.titulo} style={[estilos.celulaCabecalho, { width: coluna.largura }]}>
              {coluna.titulo}
            </Text>
          ))}
        </View>

        {ordenados.length === 0 ? (
          <Text style={{ marginTop: 10 }}>Nenhum atendimento registrado neste período.</Text>
        ) : (
          ordenados.map((item, indice) => {
            const valores = [
              formatarDataBr(item.data),
              item.inicio,
              item.termino,
              formatarDuracao(minutosEntre(item.inicio, item.termino)),
              item.aluno,
              item.raAluno || '',
              item.atividade,
            ]
            return (
              <View
                key={item.id ?? `${item.data}-${item.inicio}-${indice}`}
                style={[estilos.linha, indice % 2 === 1 ? { backgroundColor: '#F6F9F4' } : null]}
                wrap={false}
              >
                {valores.map((valor, coluna) => (
                  <Text
                    key={COLUNAS[coluna].titulo}
                    style={[estilos.celula, { width: COLUNAS[coluna].largura, textAlign: COLUNAS[coluna].centro ? 'center' : 'left' }]}
                  >
                    {valor}
                  </Text>
                ))}
              </View>
            )
          })
        )}

        <View style={estilos.total} wrap={false}>
          <Text style={[estilos.celula, { width: '25%', textAlign: 'center' }]}>Total</Text>
          <Text style={[estilos.celula, { width: '8%', textAlign: 'center' }]}>{formatarDuracao(totalMinutos)}</Text>
          <Text style={[estilos.celula, { width: '67%' }]}>{ordenados.length} atendimento(s) registrado(s)</Text>
        </View>

        <View style={estilos.assinaturas} wrap={false}>
          <View style={estilos.assinatura}>
            <Text style={estilos.legenda}>Assinatura do(a) professor(a)</Text>
            <Text style={estilos.nomeAssinatura}>{dados?.professor || ''}</Text>
          </View>
          <View style={estilos.assinatura}>
            <Text style={estilos.legenda}>Assinatura do(a) monitor(a)</Text>
            <Text style={estilos.nomeAssinatura}>{dados?.nomeMonitor || ''}</Text>
          </View>
        </View>

        <View style={estilos.rodape} fixed>
          <Text>Documento gerado pelo sistema em {formatarDataBr(hojeEmIso())}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}