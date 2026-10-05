import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'

import TermoPdf from './TermoPdf'

export default function TermoPdfModal({ termo, onClose }) {
  const nomeArquivo = `termo-monitoria-${termo?.ra ?? 'monitor'}.pdf`

  useEffect(() => {
    function aoPressionar(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', aoPressionar)
    return () => window.removeEventListener('keydown', aoPressionar)
  }, [onClose])

  // Portal: o modal lateral usa transform, o que prenderia um "fixed" dentro dele.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Termo de compromisso em PDF"
      className="fixed inset-0 z-[80] flex flex-col bg-black/60 backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-[#FAF9F6] px-6 py-3">
        <div>
          <p className="font-bold text-[#2E4039]">
            Termo de Compromisso de Monitoria
          </p>
          <p className="text-xs text-gray-500">
            {termo?.nomeEstudante} · RA {termo?.ra}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PDFDownloadLink
            document={<TermoPdf termo={termo} />}
            fileName={nomeArquivo}
            className="rounded-xl border border-transparent bg-[#2F5146] p-2 px-4 text-sm font-bold text-white no-underline transition-all hover:border-[#2F5146] hover:bg-white hover:text-[#2F5146]"
          >
            {({ loading }) => (loading ? 'Gerando PDF...' : 'Baixar PDF')}
          </PDFDownloadLink>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-2 px-4 text-sm font-bold text-black transition-all hover:border-gray-400"
          >
            Fechar
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-200">
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          <TermoPdf termo={termo} />
        </PDFViewer>
      </div>
    </div>,
    document.body
  )
}