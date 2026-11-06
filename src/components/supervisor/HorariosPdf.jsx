import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import { formatarIntervalo } from '../../utils/horarios'

const estilos = StyleSheet.create({
  pagina: { padding: 32, paddingBottom: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#2E4039' },
  cabecalho: { marginBottom: 14, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#315c50' },
  titulo: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  subtitulo: { marginTop: 4, fontSize: 10, color: '#68766e' },
  dia: { marginTop: 12 },
  nomeDia: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#315c50', marginBottom: 4 },
  linhaCabecalho: { flexDirection: 'row', backgroundColor: '#E9F0E5', borderBottomWidth: 1, borderBottomColor: '#bcc8bf' },
  linha: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#d5e2d2' },
  celula: { padding: 5 },
  celulaCabecalho: { padding: 5, fontFamily: 'Helvetica-Bold' },
  rodape: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#939E95',
  },
})

const COLUNAS = [
  { chave: 'horario', titulo: 'Horário', largura: '15%' },
  { chave: 'nome', titulo: 'Monitor', largura: '21%' },
  { chave: 'disciplina', titulo: 'Disciplina', largura: '23%' },
  { chave: 'professor', titulo: 'Professor(a)', largura: '21%' },
  { chave: 'local', titulo: 'Local', largura: '20%' },
]

// Cartaz dos horários de monitoria (A4 retrato), para expor na Fatec.
export default function HorariosPdf({ dias, atualizadoEm, filtro }) {
  return (
    <Document title="Horários de monitoria" author="Monitoria FATEC">
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>Horários de monitoria</Text>
          <Text style={estilos.subtitulo}>
            Fatec Zona Leste · {filtro ? `${filtro} · ` : ''}atualizado em {atualizadoEm}
          </Text>
        </View>

        {dias.length === 0 ? (
          <Text>Nenhum horário publicado.</Text>
        ) : (
          dias.map((dia) => (
            <View key={dia.valor} style={estilos.dia}>
              <Text style={estilos.nomeDia}>{dia.rotulo}</Text>

              <View style={estilos.linhaCabecalho} wrap={false}>
                {COLUNAS.map((coluna) => (
                  <Text key={coluna.chave} style={[estilos.celulaCabecalho, { width: coluna.largura }]}>
                    {coluna.titulo}
                  </Text>
                ))}
              </View>

              {dia.horarios.map((horario) => (
                <View key={horario.id} style={estilos.linha} wrap={false}>
                  <Text style={[estilos.celula, { width: COLUNAS[0].largura, fontFamily: 'Helvetica-Bold' }]}>
                    {formatarIntervalo(horario)}
                  </Text>
                  <Text style={[estilos.celula, { width: COLUNAS[1].largura }]}>{horario.nome}</Text>
                  <Text style={[estilos.celula, { width: COLUNAS[2].largura }]}>{horario.disciplina}</Text>
                  <Text style={[estilos.celula, { width: COLUNAS[3].largura }]}>{horario.professor ?? '-'}</Text>
                  <Text style={[estilos.celula, { width: COLUNAS[4].largura }]}>{horario.local}</Text>
                </View>
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
