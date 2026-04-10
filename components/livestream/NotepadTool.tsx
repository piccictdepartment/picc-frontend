import { useCallback } from 'react';
import { Download } from 'lucide-react';
import QuillEditor from '@/components/QuillEditor';
import { useNotepad } from '@/hooks/useLivestreamTools';

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

export default function NotepadTool() {
  const { notepadContent, setNotepadContent } = useNotepad();

  const handleDownloadPdf = useCallback(() => {
    if (!notepadContent || notepadContent === '<p><br></p>') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Livestream Notes - ${dateStr}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #1a1a1a;
              line-height: 1.7;
              padding: 48px 56px;
              max-width: 800px;
              margin: 0 auto;
            }

            .header {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
              margin-bottom: 32px;
            }

            .header h1 {
              font-size: 22px;
              font-weight: 700;
              color: #111;
              margin-bottom: 4px;
            }

            .header p {
              font-size: 12px;
              color: #6b7280;
            }

            .content {
              font-size: 14px;
            }

            .content p {
              margin-bottom: 8px;
            }

            .content ul, .content ol {
              margin-left: 24px;
              margin-bottom: 12px;
            }

            .content li {
              margin-bottom: 4px;
            }

            .content strong { font-weight: 700; }
            .content em { font-style: italic; }
            .content u { text-decoration: underline; }

            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Livestream Notes</h1>
            <p>${dateStr} &middot; ${timeStr}</p>
          </div>
          <div class="content">${notepadContent}</div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [notepadContent]);

  const hasContent = notepadContent && notepadContent !== '<p><br></p>';

  return (
    <div className="bg-black text-white p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Notepad</h3>
            <p className="text-white/70 text-sm">
              Take notes during the livestream. Your notes are saved locally in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!hasContent}
            title="Download notes as PDF"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              hasContent
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
        <div className="bg-white rounded-lg overflow-hidden text-black">
          <QuillEditor
            value={notepadContent}
            onChange={setNotepadContent}
            placeholder="Type your notes here..."
            modules={QUILL_MODULES}
          />
        </div>
      </div>
    </div>
  );
}
