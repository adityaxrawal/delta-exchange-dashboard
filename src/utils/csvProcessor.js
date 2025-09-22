import Papa from "papaparse";

export function parseCSVToRows(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const rows = [];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunkSize: 1024 * 1024,
      step: (results, parser) => {
        rows.push(results.data);
      },
      chunk: (chunk) => {
        // approximate progress call for UX, caller can map percent
        onProgress(10);
      },
      complete: () => {
        // flatten rows if parser returned array of arrays
        const flattened = rows.flat();
        onProgress(40);
        resolve(flattened);
      },
      error: (err) => reject(err),
    });
  });
}
