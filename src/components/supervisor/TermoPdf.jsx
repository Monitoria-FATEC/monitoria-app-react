import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import logo from '../../assets/pdf/logo-cps-sp.png'

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const VAZIO = '________'

const NOTA_1 =
  '¹ Este documento integra o expediente administrativo da Fatec quanto ao Programa de Monitoria de Disciplina, devendo ser arquivado para fins de controle institucional, administrativo e eventual auditoria.'

const NOTA_2 =
  '² Considerar o mínimo, 4 (quatro) e, no máximo, 8 (oito) horas semanais, conforme o Artigo 5º da Deliberação Ceeteps n. 111/ 2026, que dispõe sobre o Programa de Monitoria de Disciplina nas Faculdades de Tecnologia do Centro Estadual de Educação Tecnológica “Paula Souza” - CEETEPS.'

const styles = StyleSheet.create({
  page: {
    paddingTop: 100,
    paddingBottom: 70,
    paddingHorizontal: 62,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: '#000000',
  },
  header: {
    position: 'absolute',
    top: 24,
    left: 62,
    right: 62,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerSide: { width: 150 },
  headerCenter: { flex: 1, alignItems: 'center', paddingTop: 16 },
  headerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8 },
  headerSub: { fontSize: 7.5 },
  logo: { width: 150, height: 45 },
  footnote: {
    position: 'absolute',
    bottom: 26,
    left: 62,
    right: 62,
    fontSize: 7.5,
    lineHeight: 1.3,
    textAlign: 'justify',
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  centro: { textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  anexo: { marginTop: 4, marginBottom: 10, fontSize: 11 },
  titulo: { marginBottom: 6, fontSize: 11 },
  p: { marginBottom: 9, textAlign: 'justify' },
  clausula: { marginTop: 8 },
  clausulaTitulo: { marginBottom: 6, fontSize: 10.5 },
  item: { marginBottom: 4, textAlign: 'justify' },
  nota: { marginTop: 4, marginBottom: 9, fontSize: 7.5, lineHeight: 1.3 },
  assinaturaBloco: { alignItems: 'center', marginTop: 26 },
  assinaturaImg: { height: 44, objectFit: 'contain', marginBottom: 2 },
  assinaturaEspaco: { height: 46 },
  assinaturaLinha: {
    width: 210,
    borderTopWidth: 0.8,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
  },
  assinaturaTexto: { textAlign: 'center', fontSize: 10 },
  registro: { marginTop: 2, fontSize: 7, color: '#555555' },
})

function ou(valor) {
  return valor === null || valor === undefined || valor === '' ? VAZIO : valor
}

function dataBr(valor) {
  if (!valor) return VAZIO
  const [ano, mes, dia] = String(valor).split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

function dataHoraBr(valor) {
  if (!valor) return null
  const [, hora] = String(valor).split('T')
  return hora ? `${dataBr(valor)} às ${hora.slice(0, 5)}` : dataBr(valor)
}

function dataExtenso(valor) {
  if (!valor) return '___ de __________ de 202_'
  const [ano, mes, dia] = String(valor).split('T')[0].split('-')
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${ano}`
}

function B({ children }) {
  return <Text style={styles.bold}>{children}</Text>
}

function P({ children }) {
  return <Text style={styles.p}>{children}</Text>
}

function Item({ children }) {
  return <Text style={styles.item}>{children}</Text>
}

function Clausula({ numero, titulo, children }) {
  return (
    <View style={styles.clausula}>
      <View minPresenceAhead={70}>
        <Text style={[styles.centro, styles.clausulaTitulo]}>
          CLÁUSULA {numero}
        </Text>
        <Text style={[styles.centro, styles.clausulaTitulo]}>{titulo}</Text>
      </View>
      {children}
    </View>
  )
}

function Assinatura({ rotulo, nome, ra, imagem, registro }) {
  return (
    <View style={styles.assinaturaBloco} wrap={false}>
      {imagem ? (
        <Image src={imagem} style={styles.assinaturaImg} />
      ) : (
        <View style={styles.assinaturaEspaco} />
      )}
      <View style={styles.assinaturaLinha} />
      <Text style={styles.assinaturaTexto}>{rotulo}</Text>
      {nome ? <Text style={styles.assinaturaTexto}>{nome}</Text> : null}
      {ra ? <Text style={styles.assinaturaTexto}>RA nº {ra}</Text> : null}
      {registro ? <Text style={styles.registro}>{registro}</Text> : null}
    </View>
  )
}

export default function TermoPdf({ termo }) {
  const t = termo ?? {}

  const nomeUnidade = String(t.unidade ?? '')
    .replace(/^fatec\s*/i, '')
    .toUpperCase()
  const fatec = `FATEC ${nomeUnidade || '[NOME DA UNIDADE]'}`

  const marca = (valor) => (t.oferta === valor ? '( X )' : '(   )')
  const oferta = `de oferta ${marca('anual')} anual / ${marca('semestral')} semestral`

  const registro = t.dataEnvio
    ? `Assinatura digital registrada no sistema em ${dataHoraBr(t.dataEnvio)}`
    : null

  return (
    <Document
      title={`Termo de Monitoria - ${t.nomeEstudante ?? ''}`}
      author={fatec}
      subject="Anexo II - Termo de Compromisso de Monitoria"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerSide} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Administração Central</Text>
            <Text style={styles.headerSub}>
              Coordenadoria Geral de Ensino Superior de Graduação
            </Text>
          </View>
          <Image src={logo} style={styles.logo} />
        </View>

        <Text
          style={styles.footnote}
          fixed
          render={({ pageNumber }) => (pageNumber === 1 ? NOTA_1 : '')}
        />

        <Text style={[styles.centro, styles.anexo]}>ANEXO II</Text>
        <Text style={[styles.centro, styles.titulo]}>
          TERMO DE MONITORIA DE DISCIPLINA¹
        </Text>
        <Text style={[styles.centro, styles.titulo]}>
          PROGRAMA DE MONITORIA - MONITORIA DE DISCIPLINA
        </Text>
        <Text style={[styles.centro, styles.titulo, { marginBottom: 14 }]}>
          {fatec}
        </Text>

        <P>Pelo presente instrumento, de um lado:</P>

        <P>
          <B>FACULDADE DE TECNOLOGIA - {fatec}</B>, Unidade de Ensino Superior
          de Graduação do Centro Estadual de Educação Tecnológica “Paula Souza”
          - CEETEPS, neste ato representada por seu(sua) Coordenador(a) de
          Fatec;
        </P>

        <P>e, de outro lado,</P>

        <P>
          <B>{ou(t.nomeEstudante)}</B>, RA nº {ou(t.ra)}, regularmente
          matriculado(a) no Curso de {ou(t.curso)}, CPF nº {ou(t.cpf)},
          doravante denominado(a) <B>MONITOR(A)</B>;
        </P>

        <P>com a orientação docente do(a)</P>

        <P>
          <B>{ou(t.nomeProfessor)}</B>, professor(a) que ministra a disciplina{' '}
          {ou(t.disciplina)}, doravante denominado(a){' '}
          <B>PROFESSOR(A) ORIENTADOR(A) RESPONSÁVEL</B>; e
        </P>

        <P>com o acompanhamento do(a)</P>

        <P>
          <B>{ou(t.nomeCoordenador)}</B>, Coordenador(a) do Curso Superior de
          Graduação em {ou(t.curso)}, cuja disciplina {ou(t.disciplina)},{' '}
          {oferta}, integra o Programa de Monitoria de Disciplina, nesta Fatec,
          doravante denominado(a) <B>COORDENADOR(A) DE CURSO</B>;
        </P>

        <P>
          têm entre si justo e acordado o presente{' '}
          <B>TERMO DE COMPROMISSO DE MONITORIA</B>, que segue as diretrizes
          dispostas na Deliberação CEETEPS n. 111, de 15 de janeiro de 2026, na
          Instrução CGESG n. 11/2026, no Edital n. {ou(t.editalNumero)} da
          Fatec e pelas cláusulas e condições seguintes:
        </P>

        <Clausula numero="PRIMEIRA" titulo="DO OBJETO">
          <P>
            O presente Termo tem por objeto a formalização da participação
            do(a) MONITOR(A) no Programa de Monitoria de Disciplina, na
            disciplina {ou(t.disciplina)}, {oferta}.
          </P>
        </Clausula>

        <Clausula numero="SEGUNDA" titulo="DA FINALIDADE">
          <P>
            A Monitoria de Disciplina constitui atividade acadêmica de apoio
            aos processos de ensino e de aprendizagem, desenvolvida sob
            orientação e supervisão direta do(a) PROFESSOR(A) ORIENTADOR(A)
            RESPONSÁVEL, com finalidade exclusivamente pedagógica, visando a
            melhoria da aprendizagem, para o melhor desempenho da turma nas
            atividades propostas pela disciplina e diminuição do número de
            reprovações.
          </P>
          <P>
            Parágrafo único - A Monitoria não substitui a docência nem autoriza
            o exercício de atribuições privativas de Professor de Ensino
            Superior.
          </P>
        </Clausula>

        <Clausula numero="TERCEIRA" titulo="DA CARGA HORÁRIA E VIGÊNCIA">
          <P>
            A Monitoria de Disciplina será desenvolvida com carga horária de{' '}
            {ou(t.cargaHoraria)} horas semanais², no período letivo de{' '}
            {dataBr(t.periodoInicio)} a {dataBr(t.periodoFim)}, conforme
            previsto no Edital, respeitada a oferta do Curso Superior de
            Graduação em {ou(t.curso)} e o Calendário Acadêmico da Fatec.
          </P>
          <Text style={styles.nota}>{NOTA_2}</Text>
          <P>
            §1º - O cumprimento da carga horária deverá observar o Plano de
            Atividades de Monitoria definido pelo(a) PROFESSOR(A) ORIENTADOR(A)
            RESPONSÁVEL.
          </P>
          <P>
            §2º - A frequência será registrada conforme procedimentos
            estabelecidos para o Programa de Monitoria de Disciplina na Fatec.
          </P>
        </Clausula>

        <Clausula numero="QUARTA" titulo="DAS ATIVIDADES">
          <P>Compete ao(à) MONITOR(A):</P>
          <Item>
            I - apoiar atividades teóricas, práticas, laboratoriais e
            extensionistas da disciplina;
          </Item>
          <Item>II - orientar estudantes em exercícios e estudos dirigidos;</Item>
          <Item>
            III - colaborar na organização de materiais didáticos, sempre sob
            supervisão;
          </Item>
          <Item>
            IV - participar de reuniões de acompanhamento quando convocado(a);
          </Item>
          <Item>V - apresentar relatório final das atividades desenvolvidas.</Item>
        </Clausula>

        <Clausula numero="QUINTA" titulo="DAS VEDAÇÕES">
          <P>É expressamente vedado ao(à) MONITOR(A):</P>
          <Item>
            I - substituir o PROFESSOR(A) ORIENTADOR(A) RESPONSÁVEL em
            atividades de docência;
          </Item>
          <Item>II - ministrar aulas;</Item>
          <Item>
            III - corrigir provas ou instrumentos formais de avaliação;
          </Item>
          <Item>IV - exercer atribuições privativas de professor(a).</Item>
        </Clausula>

        <Clausula numero="SEXTA" titulo="DA BOLSA">
          <P>
            A Monitoria poderá ser contemplada com bolsa, conforme previsto no
            Edital e na normativa institucional vigente.
          </P>
          <P>
            §1º - A bolsa possui natureza acadêmica e não configura vínculo
            empregatício de qualquer natureza com o CEETEPS.
          </P>
          <P>§2º - O pagamento da bolsa está condicionado:</P>
          <Item>I - à disponibilidade orçamentária;</Item>
          <Item>II - ao cumprimento integral da carga horária;</Item>
          <Item>III - à regularidade acadêmica do(a) MONITOR(A);</Item>
          <Item>
            IV - à inexistência de pendência no CADIN (Cadastro Informativo dos
            Créditos não Quitados de Órgãos e Entidades Estaduais - CADIN
            Estadual);
          </Item>
          <Item>
            V - à manutenção de conta corrente individual ativa no Banco do
            Brasil.
          </Item>
          <P>
            §3º - O descumprimento das obrigações previstas neste Termo, na
            Deliberação Ceeteps n. 111/2026, ou demais disposições
            institucionais sobre o certame poderão ensejar suspensão ou
            cessação da bolsa.
          </P>
          <P>
            §4º - A concessão da bolsa não gera direito adquirido à recondução
            ou renovação automática.
          </P>
        </Clausula>

        <Clausula
          numero="SÉTIMA"
          titulo="DAS RESPONSABILIDADES DO(A) PROFESSOR(A) ORIENTADOR(A) RESPONSÁVEL"
        >
          <P>Compete ao(à) PROFESSOR(A) ORIENTADOR(A) RESPONSÁVEL:</P>
          <Item>I - orientar e supervisionar as atividades do(a) MONITOR(A);</Item>
          <Item>II - acompanhar e validar a frequência;</Item>
          <Item>III - avaliar o desempenho do(a) MONITOR(A);</Item>
          <Item>IV - apresentar relatório final de avaliação.</Item>
        </Clausula>

        <Clausula numero="OITAVA" titulo="DO DESLIGAMENTO">
          <P>O(A) MONITOR(A) poderá ser desligado(a):</P>
          <Item>I - por descumprimento das obrigações previstas;</Item>
          <Item>II - por ausência injustificada;</Item>
          <Item>
            III - por perda da condição de estudante regularmente
            matriculado(a);
          </Item>
          <Item>
            IV - por interesse da Administração, devidamente motivado.
          </Item>
          <P>
            Parágrafo único - Será assegurado ao(à) MONITOR(A) o direito à
            manifestação prévia.
          </P>
        </Clausula>

        <Clausula numero="NONA" titulo="DA NATUREZA JURÍDICA">
          <P>
            O presente Termo não cria vínculo empregatício, estatutário ou de
            qualquer natureza trabalhista entre o(a) MONITOR(A) e o CEETEPS.
          </P>
        </Clausula>

        <Clausula numero="DÉCIMA" titulo="DAS DISPOSIÇÕES FINAIS">
          <P>
            Os casos omissos serão resolvidos pela Coordenação da Fatec, ouvida
            a Coordenação de Curso, observadas as disposições da Deliberação
            CEETEPS n. 111/2026 e da Instrução CGESG n. 11/2026.
          </P>
          <P>
            E, por estarem de pleno acordo, firmam o presente Termo em{' '}
            {ou(t.numeroVias)} vias de igual teor.
          </P>
        </Clausula>

        <View break>
          <Text style={[styles.p, { textAlign: 'center', fontSize: 11 }]}>
            {t.cidade ?? '[Cidade]'}, {dataExtenso(t.dataAssinatura)}.
          </Text>

          <Assinatura
            rotulo="Assinatura do estudante"
            nome={t.nomeEstudante}
            ra={t.ra}
            imagem={t.assinaturaEstudante}
            registro={registro}
          />

          <Assinatura
            rotulo="Assinatura do(a) Professor(a) Orientador(a) Responsável"
            nome={t.nomeProfessor}
          />

          <Assinatura
            rotulo="Assinatura do(a) Coordenador(a) do Curso"
            nome={t.nomeCoordenador}
          />

          <Assinatura rotulo="Assinatura do(a) Coordenador(a) da Fatec" />
        </View>
      </Page>
    </Document>
  )
}