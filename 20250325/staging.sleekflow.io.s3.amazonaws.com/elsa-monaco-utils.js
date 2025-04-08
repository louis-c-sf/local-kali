const win = window;
const require = win.require;
let isInitialized;
export function initializeMonacoWorker(libPath) {
  if (isInitialized)
    return win.monaco;
  const origin = document.location.origin;
  const baseUrl = libPath.startsWith('http') ? libPath : `${origin}/${libPath}`;
  require.config({ paths: { 'vs': `${baseUrl}/vs` } });
  win.MonacoEnvironment = { getWorkerUrl: () => proxy };
  let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: '${baseUrl}'
	};
	importScripts('${baseUrl}/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));
  return new Promise(resolve => {
    require(["vs/editor/editor.main"], () => {
      isInitialized = true;
      resolve(win.monaco);
    });
  });
}
