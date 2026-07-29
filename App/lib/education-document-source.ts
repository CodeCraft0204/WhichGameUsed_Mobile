import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import type { EducationDocument } from '@/constants/educationDocuments';

export type ResolvedDocumentSource =
  | { kind: 'pdf'; uri: string; local: boolean }
  | { kind: 'image'; uri?: string; imageSource?: EducationDocument['imageSource'] }
  | { kind: 'unavailable'; reason: string };

export async function resolveEducationDocument(
  doc: EducationDocument
): Promise<ResolvedDocumentSource> {
  if (doc.kind === 'image') {
    if (doc.remoteUri) return { kind: 'image', uri: doc.remoteUri };
    if (doc.imageSource) return { kind: 'image', imageSource: doc.imageSource };
    if (doc.assetModule != null) {
      const asset = Asset.fromModule(doc.assetModule);
      await asset.downloadAsync();
      if (asset.localUri || asset.uri) {
        return { kind: 'image', uri: asset.localUri ?? asset.uri };
      }
    }
    return { kind: 'unavailable', reason: 'Original image is not available yet.' };
  }

  if (doc.remoteUri) {
    return { kind: 'pdf', uri: doc.remoteUri, local: false };
  }

  // Web: serve from /public so the response is a real application/pdf stream.
  // Metro-bundled asset URLs often produce Chrome's "Failed to load PDF document."
  if (Platform.OS === 'web' && doc.webPublicPath) {
    const origin =
      typeof globalThis !== 'undefined' &&
      'location' in globalThis &&
      typeof (globalThis as { location?: { origin?: string } }).location?.origin === 'string'
        ? (globalThis as { location: { origin: string } }).location.origin
        : '';
    return {
      kind: 'pdf',
      uri: `${origin}${doc.webPublicPath}`,
      local: false
    };
  }

  if (doc.assetModule == null) {
    return { kind: 'unavailable', reason: 'PDF file is not packaged with this build.' };
  }

  const asset = Asset.fromModule(doc.assetModule);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    return { kind: 'unavailable', reason: 'Could not prepare the PDF for viewing.' };
  }
  return { kind: 'pdf', uri, local: true };
}

/** Android content:// URI that other apps / WebView can open more reliably. */
export async function toContentUriIfNeeded(fileUri: string): Promise<string> {
  if (Platform.OS !== 'android') return fileUri;
  if (fileUri.startsWith('content://') || fileUri.startsWith('http')) return fileUri;
  try {
    return await FileSystem.getContentUriAsync(fileUri);
  } catch {
    return fileUri;
  }
}

export function pdfViewerHtml(title: string, initialUrl?: string): string {
  // PDF.js CDN reader — RN injects base64/url after load, or initialUrl for web.
  const bootUrl = initialUrl ? JSON.stringify(initialUrl) : 'null';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4" />
  <title>${escapeHtml(title)}</title>
  <style>
    html, body { margin: 0; padding: 0; background: #F2EBDC; height: 100%; overflow: hidden; }
    #status { font-family: -apple-system, sans-serif; color: #5C4033; padding: 16px; text-align: center; }
    #scroll {
      position: absolute; inset: 0;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x pan-y;
    }
    #spacer { position: relative; min-width: 100%; min-height: 100%; }
    #viewport { transform-origin: 0 0; width: max-content; margin: 0 auto; }
    #pages { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 12px; }
    canvas { max-width: none; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.15); background: #fff; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="status">Preparing document…</div>
  <div id="scroll">
    <div id="spacer">
      <div id="viewport">
        <div id="pages"></div>
      </div>
    </div>
  </div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    var currentZoom = 1;

    function setStatus(msg) {
      var el = document.getElementById('status');
      if (el) el.textContent = msg;
    }

    function layoutZoom() {
      var vp = document.getElementById('viewport');
      var spacer = document.getElementById('spacer');
      if (!vp || !spacer) return;
      vp.style.transform = 'scale(' + currentZoom + ')';
      vp.style.transformOrigin = '0 0';
      // Measure unscaled size, then expand spacer so overflow scroll = drag/pan.
      vp.style.transform = 'none';
      var w = Math.max(vp.scrollWidth, vp.offsetWidth, 1);
      var h = Math.max(vp.scrollHeight, vp.offsetHeight, 1);
      vp.style.transform = 'scale(' + currentZoom + ')';
      spacer.style.width = Math.ceil(w * currentZoom) + 'px';
      spacer.style.height = Math.ceil(h * currentZoom) + 'px';
    }

    window.WGU_setZoom = function (z) {
      currentZoom = Math.min(4, Math.max(1, Number(z) || 1));
      layoutZoom();
    };

    function base64ToUint8Array(base64) {
      var raw = atob(base64);
      var arr = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return arr;
    }

    async function renderPdfFromBase64(base64) {
      setStatus('Rendering pages…');
      var data = base64ToUint8Array(base64);
      var pdf = await pdfjsLib.getDocument({ data: data }).promise;
      var container = document.getElementById('pages');
      container.innerHTML = '';
      for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setStatus('Rendering page ' + pageNum + ' of ' + pdf.numPages + '…');
        var page = await pdf.getPage(pageNum);
        var viewport = page.getViewport({ scale: 1.35 });
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        container.appendChild(canvas);
      }
      setStatus(pdf.numPages + ' page' + (pdf.numPages === 1 ? '' : 's'));
      layoutZoom();
    }

    async function renderPdfFromUrl(url) {
      setStatus('Loading document…');
      var pdf = await pdfjsLib.getDocument({
        url: url,
        withCredentials: false
      }).promise;
      var container = document.getElementById('pages');
      container.innerHTML = '';
      for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setStatus('Rendering page ' + pageNum + ' of ' + pdf.numPages + '…');
        var page = await pdf.getPage(pageNum);
        var viewport = page.getViewport({ scale: 1.35 });
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        container.appendChild(canvas);
      }
      setStatus(pdf.numPages + ' page' + (pdf.numPages === 1 ? '' : 's'));
      layoutZoom();
    }

    window.WGU_loadPdfBase64 = function (base64) {
      renderPdfFromBase64(base64).catch(function (err) {
        setStatus('Could not render PDF: ' + (err && err.message ? err.message : String(err)));
      });
    };

    window.WGU_loadPdfUrl = function (url) {
      renderPdfFromUrl(url).catch(function (err) {
        setStatus('Could not load PDF: ' + (err && err.message ? err.message : String(err)));
      });
    };

    var bootUrl = ${bootUrl};
    if (window.WGU_PDF_BASE64) window.WGU_loadPdfBase64(window.WGU_PDF_BASE64);
    else if (window.WGU_PDF_URL) window.WGU_loadPdfUrl(window.WGU_PDF_URL);
    else if (bootUrl) window.WGU_loadPdfUrl(bootUrl);
  </script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
