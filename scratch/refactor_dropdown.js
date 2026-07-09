const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Helper method definition to insert before renderCrewSchedule
const renderRoleDropdownNew = `  const renderRoleDropdown = () => {
    const defaultPresets = ["CAMERA", "BAND EQUIPMENT", "UNLOADING", "SERVER", "CHEF", "LINE COOK", "MANAGER", "AUDIO MIX"];
    const allRoles = customRoles.length > 0 ? customRoles : defaultPresets;
    const filteredSuggestions = isFilteringRoles && dropRole.trim()
      ? allRoles.filter(r => r.toLowerCase().includes(dropRole.toLowerCase()))
      : allRoles;

    return (
      <div className="absolute left-0 right-0 mt-1 bg-[#181820] border border-white/10 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto font-sans text-xs">
        {dropRole.trim() && !allRoles.includes(dropRole.trim().toUpperCase()) && (
          <button
            type="button"
            onClick={() => {
              saveCustomRole(dropRole.trim().toUpperCase());
              setDropRole(dropRole.trim().toUpperCase());
            }}
            className="w-full px-3 py-2 text-left hover:bg-amber-500/10 text-amber-400 font-extrabold border-b border-white/5 flex items-center justify-between cursor-pointer bg-transparent border-none"
          >
            <span>💾 Save "{dropRole.trim().toUpperCase()}"</span>
          </button>
        )}
        
        {filteredSuggestions.length === 0 ? (
          <div className="p-3 text-white/30 text-center italic text-[11px]">No suggestions</div>
        ) : (
          filteredSuggestions.map(role => {
            return (
              <div
                key={role}
                className="flex items-center justify-between hover:bg-white/5 text-white/80 hover:text-white px-3 py-1.5 cursor-pointer select-none"
                onClick={() => {
                  setDropRole(role);
                  setShowRoleDropdown(false);
                }}
              >
                <span className="font-bold tracking-wider">{role}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomRole(role);
                  }}
                  className="text-white/40 hover:text-rose-400 transition-colors bg-transparent border-none p-1 cursor-pointer text-[10px]"
                  title="Delete preset"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderCrewSchedule = () => {`;

// We will find "const renderCrewSchedule = () => {" and insert renderRoleDropdown before it
if (content.includes("const renderCrewSchedule = () => {")) {
  content = content.replace("const renderCrewSchedule = () => {", renderRoleDropdownNew);
  console.log("Successfully inserted renderRoleDropdown definition!");
} else {
  console.log("Error: const renderCrewSchedule not found!");
}

// Now replace the inline IIFE with the call to renderRoleDropdown()
const iifeOld = `                          {showRoleDropdown && (() => {
                            const defaultPresets = ["CAMERA", "BAND EQUIPMENT", "UNLOADING", "SERVER", "CHEF", "LINE COOK", "MANAGER", "AUDIO MIX"];
                            const allRoles = customRoles.length > 0 ? customRoles : defaultPresets;
                            const filteredSuggestions = isFilteringRoles && dropRole.trim()
                              ? allRoles.filter(r => r.toLowerCase().includes(dropRole.toLowerCase()))
                              : allRoles;
                            
                            return (
                              <div className="absolute left-0 right-0 mt-1 bg-[#181820] border border-white/10 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto font-sans text-xs">
                                {dropRole.trim() && !allRoles.includes(dropRole.trim().toUpperCase()) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      saveCustomRole(dropRole.trim().toUpperCase());
                                      setDropRole(dropRole.trim().toUpperCase());
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-amber-500/10 text-amber-400 font-extrabold border-b border-white/5 flex items-center justify-between cursor-pointer bg-transparent border-none"
                                  >
                                    <span>💾 Save "{dropRole.trim().toUpperCase()}"</span>
                                  </button>
                                )}
                                
                                {filteredSuggestions.length === 0 ? (
                                  <div className="p-3 text-white/30 text-center italic text-[11px]">No suggestions</div>
                                ) : (
                                  filteredSuggestions.map(role => {
                                    return (
                                      <div
                                        key={role}
                                        className="flex items-center justify-between hover:bg-white/5 text-white/80 hover:text-white px-3 py-1.5 cursor-pointer select-none"
                                        onClick={() => {
                                          setDropRole(role);
                                          setShowRoleDropdown(false);
                                        }}
                                      >
                                        <span className="font-bold tracking-wider">{role}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCustomRole(role);
                                          }}
                                          className="text-white/40 hover:text-rose-400 transition-colors bg-transparent border-none p-1 cursor-pointer text-[10px]"
                                          title="Delete preset"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            );
                          })()}`;

const iifeNew = `                          {showRoleDropdown && renderRoleDropdown()}`;

if (content.includes(iifeOld)) {
  content = content.replace(iifeOld, iifeNew);
  console.log("Successfully replaced inline IIFE with renderRoleDropdown()!");
} else {
  // Let's do a more robust substring replacement if exact spaces differed
  console.log("Warning: Exact IIFE match not found. Trying regex or fuzzy search.");
  
  // We can locate the start and end of the block in the file
  const startIdx = content.indexOf("{showRoleDropdown && (() => {");
  if (startIdx !== -1) {
    const endIdx = content.indexOf("})()}", startIdx);
    if (endIdx !== -1) {
      content = content.substring(0, startIdx) + iifeNew + content.substring(endIdx + "})()}".length);
      console.log("Successfully replaced fuzzy IIFE block!");
    } else {
      console.log("Error: could not find end of IIFE block!");
    }
  } else {
    console.log("Error: could not find start of IIFE block!");
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Write back completed.");
