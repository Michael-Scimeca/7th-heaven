const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// 8. Restore CustomScrollbar closing tag in navigation (near line 6610)
const scrollbarNavOld = `             )}
           </div>

       </div>`;

const scrollbarNavNew = `             )}
           </div>
         </CustomScrollbar>
       </div>`;

if (content.includes(scrollbarNavOld)) {
  console.log("Restoring scrollbarNav closing tag...");
  content = content.replace(scrollbarNavOld, scrollbarNavNew);
} else {
  // Try matching with different newlines/spaces
  const alternativeOld = `            )}\n          </div>\n\n      </div>`;
  if (content.includes(alternativeOld)) {
    console.log("Restoring scrollbarNav closing tag (alternative)...");
    content = content.replace(alternativeOld, `            )}\n          </div>\n        </CustomScrollbar>\n      </div>`);
  } else {
    console.log("Warning: scrollbarNavOld block not found!");
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Patching complete!");
