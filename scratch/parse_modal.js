const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startKey = "            {/* Set Shift Details Modal Overlays */}";
const startIdx = content.indexOf(startKey);

const endKey = "        {/* Relocated Modals from FeaturedTrack */}";
const endIdx = content.indexOf(endKey, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log("Error: Modal boundaries not found!");
  process.exit(1);
}

const modalCode = content.substring(startIdx, endIdx);

const mockCode = `
import React from 'react';
export function Mock() {
  const activeDropDay = null;
  const draggedCrewMemberId = null;
  const editingShiftId = null;
  const crewMembers = [];
  const users = [];
  const setDropStartHour = (s) => {};
  const setDropEndHour = (s) => {};
  const setDropRole = (s) => {};
  const setIsFilteringRoles = (s) => {};
  const setShowRoleDropdown = (s) => {};
  const deleteCustomRole = (s) => {};
  const saveCustomRole = (s) => {};
  const setDropLocation = (s) => {};
  const setDropNotes = (s) => {};
  const dropStartHour = 0;
  const dropEndHour = 0;
  const dropRole = '';
  const showRoleDropdown = false;
  const isFilteringRoles = false;
  const customRoles = [];
  const tourDates = [];
  const generateTimeOptions = () => [];
  const parseTimeString = (s) => ({});
  const addScheduleItem = () => {};
  const deleteScheduleItem = (s) => {};
  const setActiveDropDay = (s) => {};
  const setDraggedCrewMemberId = (s) => {};
  const setEditingShiftId = (s) => {};
  const dropLocation = '';
  const dropNotes = '';
  const maxTotalCols = 0;
  const dayShifts = [];
  const schedules = [];

  return (
    <div>
      ${modalCode}
    </div>
  );
}
`;

const sourceFile = ts.createSourceFile(
  'mock_modal.tsx',
  mockCode,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];
console.log(`Found ${diagnostics.length} diagnostics in modal:`);
const lines = mockCode.split("\n");

for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: ${message}`);
  console.log(`  Code: "${lines[line].trim()}"`);
}
