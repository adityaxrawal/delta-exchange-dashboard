import Papa from "papaparse";

const REQUIRED_COLUMNS = [
  "Time",
  "Contract",
  "Fill Type",
  "Filled Qty",
  "Exec.Price",
  "Value",
  "Fill ID",
  "Side",
  "Fee rate",
  "Rebate",
  "Fees paid",
  "Order Type",
  "Order Price",
  "Order Qty",
  "Unfilled Qty",
  "Order ID",
  "Client Order ID",
];

function validateColumns(headers) {
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col)
  );
  console.log("missingColumns:", missingColumns);
  return missingColumns;
}

export function parseCSVToRows(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Please select a file"));
      return;
    }

    const rows = [];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunkSize: 1024 * 1024,
      beforeFirstChunk: (chunk) => {
        // Parse the first chunk to get headers
        const firstLine = chunk.split("\n")[0];
        const headers = Papa.parse(firstLine, { header: false }).data[0];
        console.log("headers:", headers);
        const missingColumns = validateColumns(headers);
        if (missingColumns.length > 0) {
          // This error will be caught by useTradeData hook and displayed in ErrorPopup component
          reject(
            new Error(
              "Please upload Delta Exchange Fill History transaction log csv file"
            )
          );
        }
      },
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
      error: (err) => {
        reject(err);
        console.error("Error parsing CSV:", err);
        // Abort parsing if there's an error
        if (parser) parser.abort();
      },
    });
  });
}
