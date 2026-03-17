const fs = require('fs');
const path = require('path');

const transcriptPath = path.join(
  process.env.HOME,
  '.cursor/projects/home-mateusparnoff-Documentos-projects-cursor/agent-transcripts',
  '562e2096-e004-4a34-a81f-f0387a7df844',
  '562e2096-e004-4a34-a81f-f0387a7df844.jsonl'
);
const outputPath = path.join(__dirname, 'stores-raw.tsv');

const SEARCH_MARKER = '66023855000146';
const TSV_HEADER_START = 'ID\tCNPJ\tNome Reduzido';

const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

let matchingLine = null;
for (const line of lines) {
  if (line.includes(SEARCH_MARKER)) {
    matchingLine = line;
    break;
  }
}

if (!matchingLine) {
  console.error('ERROR: Could not find line containing', SEARCH_MARKER);
  process.exit(1);
}

const parsed = JSON.parse(matchingLine);

let textContent = '';
const content = parsed?.message?.content;
if (Array.isArray(content)) {
  for (const block of content) {
    if (block.type === 'text' && block.text.includes(SEARCH_MARKER)) {
      textContent = block.text;
      break;
    }
  }
} else if (typeof content === 'string') {
  textContent = content;
}

if (!textContent) {
  console.error('ERROR: Could not extract text content from the JSON line');
  process.exit(1);
}

const headerIdx = textContent.indexOf(TSV_HEADER_START);
if (headerIdx === -1) {
  console.error('ERROR: Could not find TSV header in text content');
  process.exit(1);
}

let tsvData = textContent.substring(headerIdx);

const closingTag = '</user_query>';
const closingIdx = tsvData.indexOf(closingTag);
if (closingIdx !== -1) {
  tsvData = tsvData.substring(0, closingIdx);
}

tsvData = tsvData.trimEnd();

const tsvLines = tsvData.split('\n');
const cleanLines = [];
for (const line of tsvLines) {
  if (cleanLines.length === 0) {
    cleanLines.push(line);
    continue;
  }
  if (line.includes('\t')) {
    cleanLines.push(line);
  } else {
    break;
  }
}

const finalTsv = cleanLines.join('\n') + '\n';
fs.writeFileSync(outputPath, finalTsv, 'utf-8');

console.log(`SUCCESS: Wrote ${cleanLines.length} lines (1 header + ${cleanLines.length - 1} data rows)`);
console.log(`Output: ${outputPath}`);
