const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startKey = "        {selectedShowCrewDate && (() => {";
const startIdx = content.indexOf(startKey);

const endKey = "      </section>";
const endIdx = content.indexOf(endKey, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log("Error: Drawer boundaries not found!");
  process.exit(1);
}

// Slice drawer code
const drawerCode = content.substring(startIdx, endIdx);

const mockCode = `
import React from 'react';
export function Mock() {
  const getDayShow = (d) => null;
  const schedules = [];
  const selectedShowCrewDate = null;
  const crewMembers = [];
  const getAvatarColor = (n) => '';
  const formatTimeFrame = (s, e) => '';
  const editingShiftId = null;
  const setEditingShiftId = (s) => {};
  const deleteScheduleItem = (s) => {};
  const setActiveDropDay = (s) => {};
  const setDraggedCrewMemberId = (s) => {};
  const filledShifts = [];
  const openShifts = [];
  const handleEditShiftClick = (s) => {};
  const setSelectedShowCrewDate = (s) => {};
  const draggedShiftIdRef = { current: null };
  const draggedCrewMemberIdRef = { current: null };
  const setDragGuide = (s) => {};
  const getAvatarColorAndInitials = (n) => ({});
  const handleAddGroupToDay = (d, g) => {};
  const newGroupMemberSettings = {};
  const setNewGroupMemberSettings = (s) => {};
  const crewGroups = [];
  const setCrewGroups = (s) => {};
  const newGroupNameInput = '';
  const setGroupNameError = (s) => {};
  const createGroupForDate = null;
  const setCreateGroupForDate = (s) => {};
  const setIsCreateGroupModalOpen = (s) => {};

  return (
    <div>
      ${drawerCode}
    </div>
  );
}
`;

const sourceFile = ts.createSourceFile(
  'mock_drawer.tsx',
  mockCode,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diagnostics = sourceFile.parseDiagnostics || [];
console.log(`Found ${diagnostics.length} diagnostics in drawer:`);
const lines = mockCode.split("\n");

for (const diag of diagnostics) {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, diag.start);
  const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
  console.log(`Line ${line + 1}, Col ${character + 1}: ${message}`);
  console.log(`  Code: "${lines[line].trim()}"`);
}
