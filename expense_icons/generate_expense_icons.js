/**
 * generate_expense_icons.js
 * Generates SVG icons for expense-management-og and builds index.js
 * Run: node generate_expense_icons.js
 */

const fs = require('fs');
const path = require('path');

// ─── SVG Icon Definitions ─────────────────────────────────────────────────────

const ICONS = {
    // Rejected icon - red X on document
    expenseRejectedIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#b91c1c" flood-opacity="0.22"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="rgba(0,0,0,0.15)" flood-opacity="1"/>
    </filter>
    <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8f0f0"/>
    </linearGradient>
    <linearGradient id="redBadge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <radialGradient id="shine" cx="30%" cy="22%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.5)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Document shadow -->
  <rect x="62" y="48" width="132" height="168" rx="16" ry="16" fill="rgba(0,0,0,0.06)" transform="translate(4,10)"/>
  <!-- Document body -->
  <rect x="62" y="38" width="132" height="170" rx="16" ry="16" fill="url(#docGrad)" filter="url(#softShadow)"/>
  <!-- Document fold corner -->
  <polygon points="158,38 194,38 194,68" fill="#f0e8e8" opacity="0.8"/>
  <polygon points="158,38 194,68 158,68" fill="#e8d8d8" opacity="0.5"/>
  <!-- Document lines -->
  <rect x="82" y="72" width="65" height="7" rx="3.5" fill="#e8d0d0" opacity="0.7"/>
  <rect x="82" y="90" width="90" height="5" rx="2.5" fill="#f0e0e0" opacity="0.6"/>
  <rect x="82" y="104" width="76" height="5" rx="2.5" fill="#f0e0e0" opacity="0.6"/>
  <rect x="82" y="118" width="82" height="5" rx="2.5" fill="#f0e0e0" opacity="0.6"/>
  <rect x="82" y="132" width="68" height="5" rx="2.5" fill="#f0e0e0" opacity="0.6"/>
  <!-- Shine on document -->
  <rect x="62" y="38" width="132" height="170" rx="16" ry="16" fill="url(#shine)"/>
  <!-- Red X Badge -->
  <circle cx="176" cy="170" r="36" fill="url(#redBadge)" filter="url(#shadow)"/>
  <circle cx="176" cy="170" r="36" fill="url(#shine)" opacity="0.4"/>
  <!-- X mark -->
  <line x1="162" y1="156" x2="190" y2="184" stroke="white" stroke-width="6" stroke-linecap="round"/>
  <line x1="190" y1="156" x2="162" y2="184" stroke="white" stroke-width="6" stroke-linecap="round"/>
  <!-- Badge highlight -->
  <circle cx="168" cy="160" r="10" fill="rgba(255,255,255,0.2)" opacity="0.6"/>
</svg>`,

    // Daily Allowance - Sun with calendar
    expenseDailyAllowanceIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <filter id="sunGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="8" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cardShadow" x="-20%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="rgba(0,0,0,0.14)" flood-opacity="1"/>
    </filter>
    <filter id="sunShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.4"/>
    </filter>
    <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8ed"/>
      <stop offset="100%" stop-color="#fff0d0"/>
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <radialGradient id="calShine" cx="30%" cy="20%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Calendar card shadow -->
  <rect x="70" y="82" width="130" height="140" rx="14" fill="rgba(0,0,0,0.07)" transform="translate(4,10)"/>
  <!-- Calendar card -->
  <rect x="70" y="72" width="130" height="142" rx="14" fill="url(#calGrad)" filter="url(#cardShadow)"/>
  <!-- Calendar header bar -->
  <rect x="70" y="72" width="130" height="36" rx="14" fill="url(#headerGrad)"/>
  <rect x="70" y="90" width="130" height="18" fill="url(#headerGrad)"/>
  <!-- Calendar rings -->
  <rect x="104" y="60" width="10" height="24" rx="5" fill="#d97706"/>
  <rect x="142" y="60" width="10" height="24" rx="5" fill="#d97706"/>
  <!-- Day label -->
  <text x="135" y="96" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="1">DAILY</text>
  <!-- Calendar grid dots -->
  <circle cx="96" cy="128" r="5" fill="#f59e0b" opacity="0.7"/>
  <circle cx="116" cy="128" r="5" fill="#d97706" opacity="0.6"/>
  <circle cx="136" cy="128" r="5" fill="#d97706" opacity="0.6"/>
  <circle cx="156" cy="128" r="5" fill="#d97706" opacity="0.6"/>
  <circle cx="176" cy="128" r="5" fill="#d97706" opacity="0.6"/>
  <circle cx="96" cy="148" r="5" fill="#d97706" opacity="0.5"/>
  <circle cx="116" cy="148" r="5" fill="#d97706" opacity="0.5"/>
  <circle cx="136" cy="148" r="7" fill="#f59e0b"/>
  <circle cx="156" cy="148" r="5" fill="#d97706" opacity="0.5"/>
  <circle cx="176" cy="148" r="5" fill="#d97706" opacity="0.5"/>
  <circle cx="96" cy="168" r="5" fill="#d97706" opacity="0.4"/>
  <circle cx="116" cy="168" r="5" fill="#d97706" opacity="0.4"/>
  <circle cx="136" cy="168" r="5" fill="#d97706" opacity="0.4"/>
  <circle cx="156" cy="168" r="5" fill="#d97706" opacity="0.4"/>
  <!-- Shine on calendar -->
  <rect x="70" y="72" width="130" height="142" rx="14" fill="url(#calShine)"/>
  <!-- Sun (overlapping top-left) -->
  <circle cx="88" cy="80" r="38" fill="url(#sunGrad)" filter="url(#sunShadow)"/>
  <circle cx="88" cy="80" r="38" fill="url(#calShine)" opacity="0.5"/>
  <!-- Sun rays -->
  <g stroke="#fcd34d" stroke-width="4" stroke-linecap="round" opacity="0.9">
    <line x1="88" y1="31" x2="88" y2="22"/>
    <line x1="110" y1="37" x2="116" y2="30"/>
    <line x1="121" y1="58" x2="130" y2="54"/>
    <line x1="62" y1="37" x2="56" y2="30"/>
    <line x1="51" y1="58" x2="42" y2="54"/>
    <line x1="88" y1="125" x2="88" y2="134"/>
    <line x1="51" y1="100" x2="42" y2="104"/>
    <line x1="121" y1="100" x2="130" y2="104"/>
  </g>
  <!-- Sun face highlight -->
  <circle cx="80" cy="74" r="10" fill="rgba(255,255,255,0.28)"/>
</svg>`,

    // Food Claim - plate with fork and spoon
    expenseFoodClaimIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <filter id="plateShadow" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="rgba(0,0,0,0.14)" flood-opacity="1"/>
    </filter>
    <filter id="clocheShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#15803d" flood-opacity="0.22"/>
    </filter>
    <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0fdf4"/>
    </linearGradient>
    <linearGradient id="clocheGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <radialGradient id="plateShine" cx="28%" cy="22%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="clocheShine" cx="28%" cy="22%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Plate shadow -->
  <ellipse cx="130" cy="200" rx="78" ry="12" fill="rgba(0,0,0,0.08)"/>
  <!-- Plate rim -->
  <ellipse cx="130" cy="176" rx="76" ry="18" fill="#e0ead8" filter="url(#plateShadow)"/>
  <!-- Plate base -->
  <ellipse cx="130" cy="172" rx="68" ry="14" fill="url(#plateGrad)"/>
  <!-- Plate inner ring -->
  <ellipse cx="130" cy="170" rx="54" ry="10" fill="none" stroke="#d1fae5" stroke-width="2"/>
  <!-- Cloche dome -->
  <path d="M 62 168 Q 62 90 130 90 Q 198 90 198 168 Z" fill="url(#clocheGrad)" filter="url(#clocheShadow)"/>
  <path d="M 62 168 Q 62 90 130 90 Q 198 90 198 168 Z" fill="url(#clocheShine)" opacity="0.5"/>
  <!-- Cloche handle -->
  <rect x="120" y="76" width="20" height="20" rx="10" fill="#16a34a"/>
  <rect x="120" y="76" width="20" height="20" rx="10" fill="url(#plateShine)" opacity="0.4"/>
  <!-- Cloche lines decoration -->
  <path d="M 80 155 Q 130 145 180 155" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <path d="M 90 140 Q 130 132 170 140" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Fork (left) -->
  <g transform="translate(45, 85)">
    <rect x="10" y="0" width="5" height="55" rx="2.5" fill="#d1fae5" opacity="0.9"/>
    <rect x="5" y="0" width="3" height="24" rx="1.5" fill="#d1fae5" opacity="0.7"/>
    <rect x="17" y="0" width="3" height="24" rx="1.5" fill="#d1fae5" opacity="0.7"/>
  </g>
  <!-- Spoon (right) -->
  <g transform="translate(190, 85)">
    <rect x="5" y="22" width="5" height="48" rx="2.5" fill="#d1fae5" opacity="0.9"/>
    <ellipse cx="7.5" cy="14" rx="9" ry="14" fill="#d1fae5" opacity="0.85"/>
  </g>
  <!-- Plate shine overlay -->
  <ellipse cx="130" cy="172" rx="68" ry="14" fill="url(#plateShine)"/>
</svg>`,

    // Local Conveyance - taxi with location pin
    expenseLocalConveyanceIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <filter id="carShadow" x="-20%" y="-10%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.15)" flood-opacity="1"/>
    </filter>
    <filter id="pinShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#1d4ed8" flood-opacity="0.35"/>
    </filter>
    <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="carRoof" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <radialGradient id="carShine" cx="25%" cy="18%" r="60%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.5)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Car shadow -->
  <ellipse cx="126" cy="198" rx="80" ry="10" fill="rgba(0,0,0,0.1)"/>
  <!-- Car body -->
  <rect x="46" y="148" width="160" height="50" rx="14" fill="url(#carBody)" filter="url(#carShadow)"/>
  <!-- Car roof / cabin -->
  <path d="M 80 148 Q 88 108 106 108 L 158 108 Q 176 108 180 148 Z" fill="url(#carRoof)"/>
  <!-- Windshield -->
  <path d="M 90 148 Q 96 118 108 118 L 154 118 Q 166 118 170 148 Z" fill="rgba(147,210,255,0.55)" opacity="0.85"/>
  <!-- Windows -->
  <rect x="94" y="116" width="28" height="24" rx="5" fill="rgba(147,210,255,0.4)"/>
  <rect x="132" y="116" width="28" height="24" rx="5" fill="rgba(147,210,255,0.4)"/>
  <!-- Taxi stripe -->
  <rect x="46" y="162" width="160" height="6" fill="rgba(0,0,0,0.12)"/>
  <rect x="68" y="162" width="28" height="6" fill="rgba(0,0,0,0.08)"/>
  <rect x="110" y="162" width="28" height="6" fill="rgba(0,0,0,0.08)"/>
  <rect x="156" y="162" width="28" height="6" fill="rgba(0,0,0,0.08)"/>
  <!-- Front headlight -->
  <ellipse cx="210" cy="170" rx="8" ry="7" fill="rgba(255,247,200,0.9)"/>
  <ellipse cx="210" cy="170" rx="5" ry="4" fill="rgba(255,255,255,0.8)"/>
  <!-- Back light -->
  <ellipse cx="46" cy="170" rx="8" ry="7" fill="rgba(255,100,80,0.7)"/>
  <!-- Wheels -->
  <circle cx="88" cy="196" r="20" fill="#374151"/>
  <circle cx="88" cy="196" r="13" fill="#6b7280"/>
  <circle cx="88" cy="196" r="6" fill="#9ca3af"/>
  <circle cx="174" cy="196" r="20" fill="#374151"/>
  <circle cx="174" cy="196" r="13" fill="#6b7280"/>
  <circle cx="174" cy="196" r="6" fill="#9ca3af"/>
  <!-- Car body shine -->
  <rect x="46" y="148" width="160" height="50" rx="14" fill="url(#carShine)"/>
  <!-- Location Pin badge -->
  <circle cx="186" cy="86" r="32" fill="url(#pinGrad)" filter="url(#pinShadow)"/>
  <circle cx="186" cy="86" r="32" fill="url(#carShine)" opacity="0.4"/>
  <!-- Pin icon inside badge -->
  <path d="M 186 66 C 178 66 171 73 171 81 C 171 92 186 106 186 106 C 186 106 201 92 201 81 C 201 73 194 66 186 66 Z" fill="white"/>
  <circle cx="186" cy="81" r="6" fill="url(#pinGrad)"/>
</svg>`,
};

// ─── Helper: convert image file to base64 data URI ────────────────────────────
function fileToDataUri(filePath, mimeType = 'image/jpeg') {
    const data = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${data.toString('base64')}`;
}

// ─── Helper: convert SVG string to base64 data URI ────────────────────────────
function svgToDataUri(svgString) {
    const b64 = Buffer.from(svgString, 'utf8').toString('base64');
    return `data:image/svg+xml;base64,${b64}`;
}

// ─── Save SVGs to disk ────────────────────────────────────────────────────────
const dir = path.dirname(__filename);
for (const [name, svg] of Object.entries(ICONS)) {
    const kebab = name.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`).replace(/^-/, '');
    fs.writeFileSync(path.join(dir, `${kebab}.svg`), svg, 'utf8');
    console.log(`Saved ${kebab}.svg`);
}

// ─── Build index.js ──────────────────────────────────────────────────────────
const artifactsBase = 'C:\\Users\\Raghul JE\\.gemini\\antigravity-ide\\brain\\ba5e516a-b402-4618-a9d5-33cd51107656';
const pngIcons = [
    { varName: 'expenseHeroIcon', file: path.join(artifactsBase, 'expense_hero_icon_1790595050127.jpg') },
    { varName: 'expenseSubmittedIcon', file: path.join(artifactsBase, 'expense_submitted_icon_1790595065032.jpg') },
    { varName: 'expensePendingIcon', file: path.join(artifactsBase, 'expense_pending_icon_1790595080274.jpg') },
    { varName: 'expenseApprovedIcon', file: path.join(artifactsBase, 'expense_approved_icon_1790595093710.jpg') },
];

let indexContent = `// expense_icons/index.js
// Auto-generated — DO NOT EDIT manually
// Icons for the Expense Management Dashboard (expense-management-og)
// PNG icons: 3D claymorphism style matching approvers-dashboard-v2
// SVG icons: vector art for expense categories

`;

for (const { varName, file } of pngIcons) {
    try {
        const dataUri = fileToDataUri(file, 'image/jpeg');
        indexContent += `export const ${varName} = '${dataUri}';\n\n`;
        console.log(`Encoded PNG: ${varName}`);
    } catch (e) {
        console.error(`Failed to encode ${varName}: ${e.message}`);
    }
}

for (const [varName, svg] of Object.entries(ICONS)) {
    const dataUri = svgToDataUri(svg);
    indexContent += `export const ${varName} = '${dataUri}';\n\n`;
    console.log(`Encoded SVG: ${varName}`);
}

fs.writeFileSync(path.join(dir, 'index.js'), indexContent, 'utf8');
console.log('\n✅ expense_icons/index.js written successfully!');
console.log(`File size: ${(fs.statSync(path.join(dir, 'index.js')).size / 1024).toFixed(1)} KB`);
