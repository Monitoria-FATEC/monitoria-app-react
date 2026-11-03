import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import { COLUNAS } from '../../utils/relatorioInscricoes'

// Largura de cada coluna, em % (soma 100).
const LARGURAS = {
  nome: '20%',
  ra: '11%',
  curso: '20%',
  disciplina: '16%',
  situacao: '13%',
  enviadoEm: '7%',
  prazo: '6%',
  atualizadoEm: '7%',
}

const estilos = StyleSheet.create({
  pagina: { padding: 28, fontSize: 8, fontFamily: 'Helvetica', color: '#2E4039' },
  cabecalho: { marginBottom: 12 },
  titulo: { fontSize: 15, fontFamily: 'Helvetica-Bold' },
  subtitulo: { marginTop: 3, fontSize: 9, color: '#68766e' },
  linhaCabecalho: {
    flexDirection: 'row',
    backgroundColor: '#E9F0E5',
    borderBottomWidth: 1,
    borderBottomColor: '#bcc8bf',
  },
  linha: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d5e2d2',
  },
  celula: { padding: 4 },
  celulaCabecalho: { padding: 4, fontFamily: 'Helvetica-Bold' },
  rodape: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#939E95',
  },
})

// Relatório em A4 paisagem, com o cabeçalho repetido a cada página.
export default function RelatorioPdf({ linhas, titulo, geradoEm }) {
  return (
    <Document title={`Relatório de monitoria - ${titulo}`} author="Monitoria FATEC">
      <Page size="A4" orientation="landscape" style={estilos.pagina}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>Relatório de monitoria — {titulo}</Text>
          <Text style={estilos.subtitulo}>
            Fatec Zona Leste · gerado em {geradoEm} · {linhas.length}{' '}
            {linhas.length === 1 ? 'registro' : 'registros'}
          </Text>
        </View>

        <View style={estilos.linhaCabecalho} fixed>
          {COLUNAS.map(({ chave, titulo: rotulo }) => (
            <Text key={chave} style={[estilos.celulaCabecalho, { width: LARGURAS[chave] }]}>
              {rotulo}
            </Text>
          ))}
        </View>

        {linhas.length === 0 ? (
          <Text style={{ marginTop: 12 }}>Nenhum registro neste filtro.</Text>
        ) : (
          linhas.map((linha) => (
            <View key={linha.id} style={estilos.linha} wrap={false}>
              {COLUNAS.map(({ chave }) => (
                <Text key={chave} style={[estilos.celula, { width: LARGURAS[chave] }]}>
                  {chave === 'situacao' && linha.atraso > 0
                    ? `${linha[chave]} (${linha.atraso}d)`
                    : linha[chave]}
                </Text>
              ))}
            </View>
          ))
        )}

        <View style={estilos.rodape} fixed>
          <Text>Sistema de Monitoria e Frequência Acadêmica</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}