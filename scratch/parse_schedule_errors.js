const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderCrewSchedule =");
const endIdx = content.indexOf("const renderAwardPicks =");

const body = content.substring(startIdx, endIdx);

const mockCode = `
import React from 'react';
export function MockComponent() {
  const isSectionOpen = (s) => true;
  const toggleSection = (s) => {};
  const newCrewPhone = "";
  const setNewCrewPhone = (s) => {};
  const newCrewName = "";
  const setNewCrewName = (s) => {};
  const newCrewUsername = "";
  const setNewCrewUsername = (s) => {};
  const newCrewEmail = "";
  const setNewCrewEmail = (s) => {};
  const newCrewPassword = "";
  const setNewCrewPassword = (s) => {};
  const createdCrew = null;
  const setCreatedCrew = (s) => {};
  const crewError = "";
  const setCrewError = (s) => {};
  const scrollToRegistry = () => {};
  const crewAlertMsg = "";
  const setCrewAlertMsg = (s) => {};
  const crewAlertSending = false;
  const setCrewAlertSending = (s) => {};
  const crewAlertResult = null;
  const setCrewAlertResult = (s) => {};
  const crewAlertStats = null;
  const smsShows = [];
  const activeDropDay = null;
  const draggedCrewMemberId = null;
  const calendarView = "timeline";
  const getDayShow = (d) => null;
  const schedules = [];
  const selectedShowCrewDate = null;
  
  ${body}
  
  return null;
}
`;

const sourceFile = ts.createSourceFile(
  'mock_schedule.tsx',
  mockCode,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];
console.log(`Found ${diagnostics.length} diagnostics:`);
const lines = mockCode.split("\n");

for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: ${message}`);
  console.log(`  Code: "${lines[line].trim()}"`);
}
