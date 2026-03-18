const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>图片去背景工具</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
  <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">🖼️ 图片去背景</h1>
    <p class="text-gray-500 text-sm mb-6">上传图片，自动去除背景，下载透明 PNG</p>

    <label id="drop-zone"
      class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
      <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span class="text-gray-500 text-sm">点击或拖拽图片到此处</span>
      <span class="text-gray-400 text-xs mt-1">支持 JPG、PNG、WEBP（最大 10MB）</span>
      <input id="file-input" type="file" accept="image/*" class="hidden" />
    </label>

    <div id="preview-section" class="hidden mt-6">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-500 mb-1 font-medium">原图</p>
          <img id="preview-original" class="rounded-lg w-full object-contain max-h-48 bg-gray-100" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1 font-medium">去背景结果</p>
          <div class="rounded-lg w-full h-48 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKElEQVQ4jWNgYGD4z8BQDwAAAP//AwBY3wlvAAAAAElFTkSuQmCC')] flex items-center justify-center">
            <img id="preview-result" class="hidden rounded-lg w-full object-contain max-h-48" />
            <span id="result-loading" class="hidden text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-lg">处理中，请稍候...</span>
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <button id="btn-process"
          class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          开始去背景
        </button>
        <a id="btn-download"
          class="hidden flex-1 text-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          下载结果
        </a>
      </div>
    </div>

    <div id="error-msg" class="hidden mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"></div>
  </div>

  <script>
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewSection = document.getElementById('preview-section');
    const previewOriginal = document.getElementById('preview-original');
    const previewResult = document.getElementById('preview-result');
    const resultLoading = document.getElementById('result-loading');
    const btnProcess = document.getElementById('btn-process');
    const btnDownload = document.getElementById('btn-download');
    const errorMsg = document.getElementById('error-msg');

    let selectedFile = null;

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('border-blue-400','bg-blue-50'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-blue-400','bg-blue-50'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-400','bg-blue-50');
      handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) { showError('图片不能超过 10MB'); return; }
      selectedFile = file;
      previewOriginal.src = URL.createObjectURL(file);
      previewSection.classList.remove('hidden');
      previewResult.classList.add('hidden');
      btnDownload.classList.add('hidden');
      errorMsg.classList.add('hidden');
    }

    btnProcess.addEventListener('click', async () => {
      if (!selectedFile) return;
      btnProcess.disabled = true;
      resultLoading.classList.remove('hidden');
      previewResult.classList.add('hidden');
      btnDownload.classList.add('hidden');
      errorMsg.classList.add('hidden');

      try {
        const formData = new FormData();
        formData.append('image_file', selectedFile);
        formData.append('size', 'auto');

        const res = await fetch('/remove-bg', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: '处理失败' }));
          throw new Error(err.error || '处理失败');
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        previewResult.src = url;
        previewResult.classList.remove('hidden');
        btnDownload.href = url;
        btnDownload.download = 'removed_bg.png';
        btnDownload.classList.remove('hidden');
      } catch (err) {
        showError(err.message);
      } finally {
        resultLoading.classList.add('hidden');
        btnProcess.disabled = false;
      }
    });

    function showError(msg) {
      errorMsg.textContent = '错误：' + msg;
      errorMsg.classList.remove('hidden');
    }
  <\/script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve frontend
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // Handle background removal
    if (request.method === 'POST' && url.pathname === '/remove-bg') {
      try {
        const formData = await request.formData();
        const imageFile = formData.get('image_file');

        if (!imageFile) {
          return Response.json({ error: '请上传图片' }, { status: 400 });
        }

        // Forward to Remove.bg API
        const removeBgForm = new FormData();
        removeBgForm.append('image_file', imageFile);
        removeBgForm.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': env.REMOVE_BG_API_KEY },
          body: removeBgForm,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const msg = errData?.errors?.[0]?.title || 'Remove.bg API 错误';
          return Response.json({ error: msg }, { status: response.status });
        }

        const imageData = await response.arrayBuffer();
        return new Response(imageData, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename="removed_bg.png"',
          },
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
