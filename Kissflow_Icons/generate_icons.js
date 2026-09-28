const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const outputDir = path.resolve(__dirname);
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const commonDefs = `
  <defs>
    <filter id="drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
    <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.22"/>
    </filter>
    <filter id="glow-badge" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#2563EB" flood-opacity="0.3"/>
    </filter>
    <filter id="gold-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#D97706" flood-opacity="0.35"/>
    </filter>
`;

const icons = [
  {
    id: 'travel-management',
    varName: 'travelManagementIcon',
    name: 'Travel Management',
    concept: 'Airplane + subtle clouds',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="planeFuselage" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="planeBlue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>

  <!-- Ground Shadow -->
  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.14" filter="blur(6px)"/>

  <!-- Back Layer Fluffy Cloud -->
  <g filter="url(#drop-shadow)" opacity="0.9">
    <ellipse cx="160" cy="180" rx="36" ry="22" fill="#E2E8F0"/>
    <circle cx="138" cy="172" r="26" fill="#E2E8F0"/>
  </g>

  <!-- 3D Airliner Plane (Isometric Flying Up-Right) -->
  <!-- Left Wing (Far Side) -->
  <path d="M 108 108 L 138 46 Q 144 42 148 46 L 128 106 Z" fill="url(#planeBlue)" filter="url(#drop-shadow)"/>
  <!-- Left Engine -->
  <rect x="122" y="70" width="12" height="22" rx="6" fill="#94A3B8" transform="rotate(-30 122 70)"/>

  <!-- Fuselage Body -->
  <g filter="url(#soft-shadow)">
    <!-- Main Cylinder -->
    <path d="M 68 156 C 88 138, 142 94, 186 64 C 198 56, 206 60, 202 72 C 172 116, 128 160, 96 178 C 84 184, 68 174, 68 156 Z" fill="url(#planeFuselage)"/>
    
    <!-- Cockpit Glass -->
    <path d="M 184 66 Q 198 58 202 68 Q 194 76 182 76 Z" fill="#0284C7"/>
    <path d="M 186 64 Q 196 58 200 64" stroke="#67E8F9" stroke-width="2" fill="none"/>

    <!-- Cabin Windows -->
    <circle cx="170" cy="82" r="3" fill="#0369A1"/>
    <circle cx="158" cy="92" r="3" fill="#0369A1"/>
    <circle cx="146" cy="102" r="3" fill="#0369A1"/>
    <circle cx="134" cy="112" r="3" fill="#0369A1"/>
    <circle cx="122" cy="122" r="3" fill="#0369A1"/>
    <circle cx="110" cy="132" r="3" fill="#0369A1"/>

    <!-- Vertical Stabilizer Tail Fin -->
    <path d="M 78 154 L 62 108 Q 60 102 66 104 L 90 144 Z" fill="url(#planeBlue)"/>
    <path d="M 64 104 L 70 105 L 82 128 L 74 128 Z" fill="#60A5FA"/>

    <!-- Horizontal Stabilizer Left/Right -->
    <path d="M 72 162 L 48 156 Q 44 154 48 152 L 78 152 Z" fill="url(#planeBlue)"/>
  </g>

  <!-- Right Wing (Near Side Foreground) -->
  <g filter="url(#drop-shadow)">
    <path d="M 126 126 L 158 184 Q 162 190 156 190 L 102 148 Z" fill="url(#planeBlue)"/>
    <path d="M 124 130 L 156 184" stroke="#93C5FD" stroke-width="2.5" opacity="0.6"/>
    <!-- Right Engine -->
    <rect x="126" y="152" width="14" height="24" rx="7" fill="#E2E8F0" transform="rotate(30 126 152)"/>
    <ellipse cx="134" cy="158" rx="6" ry="4" fill="#1E293B" transform="rotate(30 134 158)"/>
  </g>

  <!-- Front Foreground Puffy 3D Clouds -->
  <g filter="url(#soft-shadow)">
    <ellipse cx="76" cy="192" rx="34" ry="22" fill="url(#cloudGrad)"/>
    <circle cx="106" cy="180" r="28" fill="url(#cloudGrad)"/>
    <circle cx="144" cy="188" r="24" fill="url(#cloudGrad)"/>
    <ellipse cx="112" cy="198" rx="46" ry="16" fill="url(#cloudGrad)"/>
    <!-- Cloud Highlight -->
    <ellipse cx="102" cy="168" rx="16" ry="7" fill="#FFFFFF" opacity="0.9"/>
  </g>
</svg>`
  },
  {
    id: 'expense-management',
    varName: 'expenseManagementIcon',
    name: 'Expense Management',
    concept: 'Expense document + ₹',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="docGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="docHeader" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <linearGradient id="rupeeCoin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="40%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="successBadge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>

  <ellipse cx="124" cy="226" rx="74" ry="12" fill="#0F172A" opacity="0.15" filter="blur(6px)"/>
  <rect x="68" y="38" width="116" height="160" rx="14" fill="#CBD5E1" transform="rotate(-6 126 118)" opacity="0.6"/>

  <g filter="url(#soft-shadow)">
    <rect x="64" y="32" width="128" height="172" rx="16" fill="url(#docGrad)"/>
    <path d="M 160 32 L 192 64 L 160 64 Z" fill="#E2E8F0"/>
    <path d="M 64 48 Q 64 32 80 32 L 160 32 L 192 64 L 192 188 Q 192 204 176 204 L 80 204 Q 64 204 64 188 Z" fill="none" stroke="#E2E8F0" stroke-width="1.5"/>

    <rect x="78" y="52" width="68" height="14" rx="7" fill="url(#docHeader)"/>
    
    <rect x="78" y="80" width="100" height="7" rx="3.5" fill="#94A3B8"/>
    <rect x="78" y="96" width="70" height="7" rx="3.5" fill="#CBD5E1"/>
    <rect x="156" y="96" width="22" height="7" rx="3.5" fill="#F97316"/>

    <rect x="78" y="112" width="60" height="7" rx="3.5" fill="#CBD5E1"/>
    <rect x="150" y="112" width="28" height="7" rx="3.5" fill="#3B82F6"/>

    <rect x="78" y="128" width="75" height="7" rx="3.5" fill="#CBD5E1"/>
    <rect x="160" y="128" width="18" height="7" rx="3.5" fill="#10B981"/>

    <line x1="78" y1="148" x2="178" y2="148" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="4 3"/>

    <rect x="78" y="160" width="45" height="10" rx="5" fill="#64748B"/>
    <rect x="135" y="158" width="43" height="14" rx="7" fill="#0284C7"/>
  </g>

  <g filter="url(#gold-shadow)">
    <circle cx="174" cy="174" r="38" fill="url(#rupeeCoin)"/>
    <circle cx="174" cy="174" r="33" fill="#D97706" opacity="0.3"/>
    <circle cx="174" cy="174" r="31" fill="url(#rupeeCoin)"/>
    <circle cx="171" cy="171" r="28" fill="none" stroke="#FEF08A" stroke-width="2" opacity="0.6"/>

    <path d="M 164 158 L 186 158 M 164 165 L 184 165 M 164 158 L 164 174 Q 176 174 176 166 Q 176 158 164 158 M 171 174 L 186 192" 
          stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>

  <g filter="url(#drop-shadow)">
    <circle cx="80" cy="190" r="18" fill="url(#successBadge)"/>
    <path d="M 73 190 L 78 195 L 88 184" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`
  },
  {
    id: 'project-task-management',
    varName: 'projectTaskManagementIcon',
    name: 'Project & Task Management',
    concept: 'Checklist + gear',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="boardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
    <linearGradient id="gearGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="checkGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.14" filter="blur(6px)"/>

  <g filter="url(#soft-shadow)">
    <rect x="52" y="44" width="134" height="172" rx="18" fill="url(#boardGrad)"/>
    <rect x="94" y="32" width="50" height="22" rx="7" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>
    <ellipse cx="119" cy="38" rx="8" ry="4" fill="#64748B"/>
  </g>

  <g filter="url(#drop-shadow)">
    <rect x="62" y="60" width="114" height="146" rx="10" fill="url(#paperGrad)"/>
    
    <circle cx="84" cy="92" r="11" fill="url(#checkGrad)"/>
    <path d="M 79 92 L 83 96 L 90 88" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="103" y="87" width="58" height="6" rx="3" fill="#334155"/>
    <rect x="103" y="97" width="38" height="4" rx="2" fill="#94A3B8"/>

    <circle cx="84" cy="126" r="11" fill="url(#checkGrad)"/>
    <path d="M 79 126 L 83 130 L 90 122" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="103" y="121" width="52" height="6" rx="3" fill="#334155"/>
    <rect x="103" y="131" width="42" height="4" rx="2" fill="#94A3B8"/>

    <circle cx="84" cy="160" r="11" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="103" y="155" width="48" height="6" rx="3" fill="#64748B"/>
    <rect x="103" y="165" width="28" height="4" rx="2" fill="#CBD5E1"/>
  </g>

  <g filter="url(#soft-shadow)" transform="translate(176, 160)">
    <g fill="url(#gearGrad)">
      <circle cx="0" cy="0" r="42"/>
      <rect x="-8" y="-52" width="16" height="16" rx="3.5"/>
      <rect x="-8" y="36" width="16" height="16" rx="3.5"/>
      <rect x="-52" y="-8" width="16" height="16" rx="3.5"/>
      <rect x="36" y="-8" width="16" height="16" rx="3.5"/>
      <rect x="-38" y="-38" width="16" height="16" rx="3.5" transform="rotate(45)"/>
      <rect x="22" y="-38" width="16" height="16" rx="3.5" transform="rotate(45)"/>
      <rect x="-38" y="22" width="16" height="16" rx="3.5" transform="rotate(45)"/>
      <rect x="22" y="22" width="16" height="16" rx="3.5" transform="rotate(45)"/>
    </g>
    <circle cx="0" cy="0" r="32" fill="#B45309" opacity="0.3"/>
    <circle cx="0" cy="0" r="28" fill="url(#gearGrad)"/>
    <circle cx="0" cy="0" r="27" fill="none" stroke="#FDE68A" stroke-width="2" opacity="0.7"/>
    <circle cx="0" cy="0" r="14" fill="#1E293B"/>
    <circle cx="0" cy="0" r="8" fill="#F8FAFC"/>
  </g>
</svg>`
  },
  {
    id: 'lead-tracker',
    varName: 'leadTrackerIcon',
    name: 'Lead Tracker',
    concept: 'Target + arrow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#B91C1C"/>
    </linearGradient>
    <linearGradient id="blueRing" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="bullseye" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="arrowShaft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="featherGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="72" ry="14" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#soft-shadow)">
    <path d="M 85 180 L 60 220" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
    <path d="M 171 180 L 196 220" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
    <path d="M 128 175 L 128 222" stroke="#334155" stroke-width="8" stroke-linecap="round"/>

    <circle cx="128" cy="116" r="82" fill="#1E293B"/>
    <circle cx="128" cy="116" r="78" fill="#F8FAFC"/>
    
    <circle cx="128" cy="116" r="72" fill="url(#redGrad)"/>
    <circle cx="128" cy="116" r="54" fill="#FFFFFF"/>
    
    <circle cx="128" cy="116" r="42" fill="url(#blueRing)"/>
    <circle cx="128" cy="116" r="28" fill="#FFFFFF"/>

    <circle cx="128" cy="116" r="16" fill="url(#bullseye)"/>
    <circle cx="128" cy="116" r="7" fill="#B45309"/>
    <circle cx="128" cy="116" r="15" fill="none" stroke="#FDE68A" stroke-width="1.5" opacity="0.8"/>
  </g>

  <ellipse cx="128" cy="116" rx="22" ry="12" fill="none" stroke="#FEF08A" stroke-width="2.5" opacity="0.6"/>

  <g filter="url(#drop-shadow)">
    <line x1="172" y1="72" x2="210" y2="34" stroke="#93C5FD" stroke-width="3" stroke-dasharray="6 4" opacity="0.8"/>
    <line x1="184" y1="84" x2="222" y2="46" stroke="#93C5FD" stroke-width="2" stroke-dasharray="4 3" opacity="0.6"/>

    <line x1="128" y1="116" x2="198" y2="46" stroke="url(#arrowShaft)" stroke-width="7" stroke-linecap="round"/>
    <line x1="128" y1="116" x2="198" y2="46" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.8"/>

    <path d="M 124 120 L 132 112 L 122 110 Z" fill="#64748B"/>

    <g transform="translate(196, 48) rotate(-45)">
      <path d="M 0 0 L -10 -22 L 6 -16 Z" fill="url(#featherGrad)"/>
      <path d="M 0 0 L -10 22 L 6 16 Z" fill="url(#featherGrad)"/>
      <path d="M 0 0 L 16 0 L 22 -6 L 0 -6 Z" fill="#047857"/>
      <circle cx="4" cy="0" r="4" fill="#F59E0B"/>
    </g>
  </g>
</svg>`
  },
  {
    id: 'agreement-management',
    varName: 'agreementManagementIcon',
    name: 'Agreement Management',
    concept: 'Contract + approval/check',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="parchment" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="stampGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#B91C1C"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="74" ry="12" fill="#0F172A" opacity="0.14" filter="blur(6px)"/>

  <g filter="url(#soft-shadow)">
    <rect x="56" y="32" width="144" height="178" rx="14" fill="url(#parchment)"/>
    <rect x="56" y="32" width="144" height="178" rx="14" fill="none" stroke="#E2E8F0" stroke-width="2"/>

    <path d="M 128 48 L 136 58 L 128 64 L 120 58 Z" fill="#6366F1"/>
    <circle cx="128" cy="56" r="14" fill="none" stroke="#6366F1" stroke-width="2"/>
    <line x1="84" y1="56" x2="108" y2="56" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="148" y1="56" x2="172" y2="56" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>

    <rect x="80" y="78" width="96" height="8" rx="4" fill="#1E293B"/>

    <rect x="76" y="98" width="104" height="5" rx="2.5" fill="#64748B"/>
    <rect x="76" y="110" width="98" height="5" rx="2.5" fill="#94A3B8"/>
    <rect x="76" y="122" width="104" height="5" rx="2.5" fill="#94A3B8"/>
    <rect x="76" y="134" width="70" height="5" rx="2.5" fill="#94A3B8"/>

    <line x1="76" y1="168" x2="114" y2="168" stroke="#334155" stroke-width="2"/>
    <path d="M 78 162 Q 88 152 96 162 Q 104 170 110 158" stroke="#2563EB" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>

  <g filter="url(#drop-shadow)">
    <path d="M 158 174 L 148 214 L 160 206 L 172 214 L 164 174 Z" fill="url(#ribbonGrad)"/>
    <path d="M 174 174 L 170 216 L 180 208 L 190 216 L 180 174 Z" fill="#991B1B"/>
  </g>

  <g filter="url(#soft-shadow)">
    <circle cx="164" cy="168" r="34" fill="url(#stampGrad)"/>
    <circle cx="164" cy="168" r="29" fill="none" stroke="#A7F3D0" stroke-width="2.5" stroke-dasharray="6 3"/>
    <path d="M 150 168 L 160 178 L 178 158" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`
  },
  {
    id: 'it-helpdesk',
    varName: 'itHelpdeskIcon',
    name: 'IT Helpdesk',
    concept: 'Headset + support chat',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="headsetGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="chatBubble" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="earpad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="74" ry="12" fill="#0F172A" opacity="0.15" filter="blur(6px)"/>

  <g filter="url(#soft-shadow)">
    <path d="M 72 82 Q 72 62 92 62 L 164 62 Q 184 62 184 82 L 184 130 Q 184 150 164 150 L 126 150 L 102 172 L 108 150 L 92 150 Q 72 150 72 130 Z" fill="url(#chatBubble)"/>
    <path d="M 88 72 L 168 72" stroke="#67E8F9" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>

    <circle cx="106" cy="106" r="8" fill="#FFFFFF"/>
    <circle cx="128" cy="106" r="8" fill="#FFFFFF"/>
    <circle cx="150" cy="106" r="8" fill="#FFFFFF"/>
  </g>

  <g filter="url(#drop-shadow)">
    <path d="M 52 142 C 52 58, 204 58, 204 142" stroke="url(#headsetGrad)" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M 68 116 C 74 68, 182 68, 188 116" stroke="#93C5FD" stroke-width="3" fill="none" opacity="0.7"/>

    <rect x="38" y="128" width="26" height="52" rx="13" fill="url(#earpad)"/>
    <rect x="42" y="134" width="8" height="40" rx="4" fill="#3B82F6"/>

    <rect x="192" y="128" width="26" height="52" rx="13" fill="url(#earpad)"/>
    <rect x="206" y="134" width="8" height="40" rx="4" fill="#3B82F6"/>

    <path d="M 48 166 Q 52 208 100 206 L 118 206" stroke="#475569" stroke-width="6" fill="none" stroke-linecap="round"/>
    <rect x="114" y="198" width="22" height="16" rx="8" fill="url(#headsetGrad)"/>
    <circle cx="130" cy="206" r="3" fill="#38BDF8"/>
  </g>
</svg>`
  },
  {
    id: 'fleet-registration',
    varName: 'fleetRegistrationIcon',
    name: 'Fleet Registration',
    concept: 'Vehicle + registration document/check',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="60%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
    <linearGradient id="regCard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#soft-shadow)">
    <rect x="76" y="36" width="124" height="96" rx="14" fill="url(#regCard)"/>
    <rect x="76" y="36" width="124" height="96" rx="14" fill="none" stroke="#E2E8F0" stroke-width="2"/>
    
    <rect x="88" y="48" width="46" height="8" rx="4" fill="#2563EB"/>
    <rect x="142" y="48" width="46" height="8" rx="4" fill="#94A3B8"/>
    
    <rect x="88" y="66" width="100" height="12" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
    <rect x="94" y="70" width="40" height="4" rx="2" fill="#334155"/>
    <rect x="144" y="70" width="36" height="4" rx="2" fill="#2563EB"/>

    <line x1="88" y1="92" x2="88" y2="114" stroke="#64748B" stroke-width="3"/>
    <line x1="95" y1="92" x2="95" y2="114" stroke="#64748B" stroke-width="2"/>
    <line x1="100" y1="92" x2="100" y2="114" stroke="#64748B" stroke-width="4"/>
    <line x1="108" y1="92" x2="108" y2="114" stroke="#64748B" stroke-width="2"/>
    <line x1="114" y1="92" x2="114" y2="114" stroke="#64748B" stroke-width="3"/>
  </g>

  <g filter="url(#soft-shadow)">
    <path d="M 44 186 C 44 172, 60 162, 74 160 L 98 140 Q 116 124 146 124 L 180 124 Q 200 124 212 144 L 224 164 C 232 170, 236 178, 236 188 L 236 196 Q 236 200, 230 200 L 48 200 Q 44 200, 44 196 Z" fill="url(#carBody)"/>
    
    <path d="M 104 144 L 140 134 L 140 156 L 88 156 Z" fill="#93C5FD"/>
    <path d="M 148 134 L 176 134 Q 188 134 198 148 L 206 156 L 148 156 Z" fill="#93C5FD"/>

    <path d="M 226 172 L 234 176 L 234 184 L 222 180 Z" fill="#FDE047"/>
    <path d="M 46 174 L 52 174 L 52 182 L 46 182 Z" fill="#EF4444"/>

    <g transform="translate(82, 196)">
      <circle cx="0" cy="0" r="20" fill="#1E293B"/>
      <circle cx="0" cy="0" r="12" fill="#94A3B8"/>
      <circle cx="0" cy="0" r="6" fill="#F8FAFC"/>
    </g>
    <g transform="translate(196, 196)">
      <circle cx="0" cy="0" r="20" fill="#1E293B"/>
      <circle cx="0" cy="0" r="12" fill="#94A3B8"/>
      <circle cx="0" cy="0" r="6" fill="#F8FAFC"/>
    </g>
  </g>

  <g filter="url(#glow-badge)">
    <path d="M 46 88 Q 46 64 70 56 Q 94 64 94 88 Q 94 116 70 128 Q 46 116 46 88 Z" fill="url(#shieldGrad)"/>
    <path d="M 58 88 L 66 96 L 82 78" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`
  },
  {
    id: 'coal-ash',
    varName: 'coalAshIcon',
    name: 'Coal Ash',
    concept: 'Mining cart + coal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="cartBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="coalGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="coalHighlight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="pickaxeGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g stroke="#64748B" stroke-linecap="round">
    <line x1="36" y1="216" x2="220" y2="216" stroke-width="6"/>
    <line x1="56" y1="210" x2="56" y2="224" stroke-width="4"/>
    <line x1="92" y1="210" x2="92" y2="224" stroke-width="4"/>
    <line x1="128" y1="210" x2="128" y2="224" stroke-width="4"/>
    <line x1="164" y1="210" x2="164" y2="224" stroke-width="4"/>
    <line x1="200" y1="210" x2="200" y2="224" stroke-width="4"/>
  </g>

  <g filter="url(#drop-shadow)">
    <path d="M 85 95 L 105 70 L 130 85 L 115 105 Z" fill="url(#coalGrad1)"/>
    <path d="M 125 80 L 150 55 L 175 75 L 155 95 Z" fill="url(#coalGrad1)"/>
    <path d="M 65 110 L 85 85 L 105 100 L 85 115 Z" fill="url(#coalGrad1)"/>
    <path d="M 155 95 L 180 75 L 200 95 L 180 115 Z" fill="url(#coalGrad1)"/>

    <path d="M 100 85 L 128 48 L 155 80 L 130 100 Z" fill="url(#coalHighlight)"/>
    <polygon points="128,48 100,85 125,75" fill="#94A3B8" opacity="0.4"/>
    <polygon points="128,48 155,80 135,70" fill="#64748B" opacity="0.5"/>

    <path d="M 70 105 L 98 80 L 120 105 L 90 120 Z" fill="url(#coalHighlight)"/>
    <polygon points="98,80 70,105 92,95" fill="#94A3B8" opacity="0.3"/>

    <path d="M 135 100 L 165 75 L 190 105 L 160 120 Z" fill="url(#coalHighlight)"/>
    <polygon points="165,75 190,105 168,95" fill="#94A3B8" opacity="0.3"/>
  </g>

  <g filter="url(#soft-shadow)">
    <path d="M 52 110 L 204 110 L 184 180 L 72 180 Z" fill="url(#cartBody)"/>
    <rect x="46" y="104" width="164" height="12" rx="4" fill="#334155"/>
    <rect x="48" y="106" width="160" height="3" fill="#94A3B8" opacity="0.6"/>

    <line x1="72" y1="180" x2="204" y2="110" stroke="#1E293B" stroke-width="4"/>
    <line x1="184" y1="180" x2="52" y2="110" stroke="#1E293B" stroke-width="4"/>
    <rect x="68" y="174" width="120" height="8" rx="2" fill="#0F172A"/>

    <g transform="translate(86, 192)">
      <circle cx="0" cy="0" r="18" fill="#1E293B"/>
      <circle cx="0" cy="0" r="12" fill="#64748B"/>
      <circle cx="0" cy="0" r="5" fill="#E2E8F0"/>
    </g>
    <g transform="translate(170, 192)">
      <circle cx="0" cy="0" r="18" fill="#1E293B"/>
      <circle cx="0" cy="0" r="12" fill="#64748B"/>
      <circle cx="0" cy="0" r="5" fill="#E2E8F0"/>
    </g>
  </g>

  <g filter="url(#drop-shadow)" transform="translate(195, 55) rotate(25)">
    <rect x="-4" y="-28" width="8" height="56" rx="3" fill="#B45309"/>
    <path d="M -24 -24 Q 0 -36 24 -24 Q 0 -22 -24 -24 Z" fill="url(#pickaxeGrad)"/>
  </g>
</svg>`
  },
  {
    id: 'refex-mobility',
    varName: 'refexMobilityIcon',
    name: 'Refex Mobility',
    concept: 'Location pin + car',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
    <linearGradient id="evCar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="60%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="74" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <path d="M 40 216 Q 100 178 140 190 T 226 172" stroke="url(#roadGrad)" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.85"/>
  <path d="M 44 216 Q 100 178 140 190 T 222 172" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 6" fill="none" stroke-linecap="round"/>

  <g filter="url(#soft-shadow)">
    <path d="M 128 32 C 88 32, 58 62, 58 102 C 58 146, 118 206, 128 214 C 138 206, 198 146, 198 102 C 198 62, 168 32, 128 32 Z" fill="url(#pinGrad)"/>
    <path d="M 128 42 C 158 42, 184 66, 186 98" stroke="#FED7AA" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.7"/>

    <circle cx="128" cy="102" r="48" fill="#FFFFFF"/>
    <circle cx="128" cy="102" r="44" fill="#F8FAFC"/>
  </g>

  <g filter="url(#drop-shadow)" transform="translate(86, 76)">
    <path d="M 8 36 C 8 28, 16 22, 26 20 L 36 10 Q 46 2 60 2 L 72 2 Q 80 2 86 12 L 94 22 C 98 26, 102 30, 102 36 L 102 44 Q 102 46, 98 46 L 10 46 Q 8 46, 8 44 Z" fill="url(#evCar)"/>
    
    <path d="M 38 12 L 56 6 L 56 18 L 30 18 Z" fill="#E0F2FE"/>
    <path d="M 62 6 L 72 6 Q 78 6 82 14 L 86 18 L 62 18 Z" fill="#E0F2FE"/>

    <path d="M 44 26 L 52 26 L 48 34 L 56 34 L 46 44 L 48 36 L 42 36 Z" fill="#FBBF24"/>

    <circle cx="28" cy="44" r="10" fill="#1E293B"/>
    <circle cx="28" cy="44" r="5" fill="#E2E8F0"/>

    <circle cx="82" cy="44" r="10" fill="#1E293B"/>
    <circle cx="82" cy="44" r="5" fill="#E2E8F0"/>
  </g>
</svg>`
  },
  {
    id: 'asset-management',
    varName: 'assetManagementIcon',
    name: 'Asset Management',
    concept: 'Asset boxes + gear',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="boxTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="boxLeft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="boxRight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B45309"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
    <linearGradient id="assetGear" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#drop-shadow)">
    <polygon points="76,140 120,116 120,116 76,92 32,116" fill="url(#boxTop)"/>
    <polygon points="32,116 76,140 76,196 32,172" fill="url(#boxLeft)"/>
    <polygon points="76,140 120,116 120,172 76,196" fill="url(#boxRight)"/>
    <polygon points="54,104 64,99 98,118 88,123" fill="#FEF3C7" opacity="0.8"/>
  </g>

  <g filter="url(#drop-shadow)">
    <polygon points="160,150 204,126 160,102 116,126" fill="url(#boxTop)"/>
    <polygon points="116,126 160,150 160,206 116,182" fill="url(#boxLeft)"/>
    <polygon points="160,150 204,126 204,182 160,206" fill="url(#boxRight)"/>
    <polygon points="170,146 194,132 194,148 170,162" fill="#FFFFFF"/>
    <line x1="174" y1="145" x2="174" y2="157" stroke="#1E293B" stroke-width="2"/>
    <line x1="179" y1="142" x2="179" y2="154" stroke="#1E293B" stroke-width="1.5"/>
    <line x1="184" y1="139" x2="184" y2="151" stroke="#1E293B" stroke-width="3"/>
    <line x1="190" y1="136" x2="190" y2="148" stroke="#1E293B" stroke-width="1.5"/>
  </g>

  <g filter="url(#soft-shadow)">
    <polygon points="118,84 162,60 118,36 74,60" fill="url(#boxTop)"/>
    <polygon points="74,60 118,84 118,140 74,116" fill="url(#boxLeft)"/>
    <polygon points="118,84 162,60 162,116 118,140" fill="url(#boxRight)"/>
    <polygon points="96,48 106,43 140,62 130,67" fill="#FEF3C7" opacity="0.8"/>
  </g>

  <g filter="url(#glow-badge)" transform="translate(168, 88)">
    <circle cx="0" cy="0" r="32" fill="url(#assetGear)"/>
    <rect x="-6" y="-40" width="12" height="12" rx="3" fill="url(#assetGear)"/>
    <rect x="-6" y="28" width="12" height="12" rx="3" fill="url(#assetGear)"/>
    <rect x="-40" y="-6" width="12" height="12" rx="3" fill="url(#assetGear)"/>
    <rect x="28" y="-6" width="12" height="12" rx="3" fill="url(#assetGear)"/>
    <rect x="-30" y="-30" width="12" height="12" rx="3" fill="url(#assetGear)" transform="rotate(45)"/>
    <rect x="18" y="-30" width="12" height="12" rx="3" fill="url(#assetGear)" transform="rotate(45)"/>
    <rect x="-30" y="18" width="12" height="12" rx="3" fill="url(#assetGear)" transform="rotate(45)"/>
    <rect x="18" y="18" width="12" height="12" rx="3" fill="url(#assetGear)" transform="rotate(45)"/>
    <circle cx="0" cy="0" r="22" fill="#1D4ED8"/>
    <circle cx="0" cy="0" r="20" fill="none" stroke="#93C5FD" stroke-width="2" opacity="0.6"/>
    <circle cx="0" cy="0" r="10" fill="#FFFFFF"/>
  </g>
</svg>`
  },
  {
    id: 'feast-refex',
    varName: 'feastRefexIcon',
    name: 'Feast Refex',
    concept: 'Plate + fork/spoon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="clocheGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="goldPlate" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="silverCutlery" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="78" ry="12" fill="#0F172A" opacity="0.15" filter="blur(6px)"/>

  <!-- Left Fork -->
  <g filter="url(#drop-shadow)" transform="translate(48, 70)">
    <rect x="8" y="45" width="7" height="85" rx="3.5" fill="url(#silverCutlery)"/>
    <path d="M 6 36 Q 11.5 44 17 36 L 17 18 L 6 18 Z" fill="url(#silverCutlery)"/>
    <rect x="5.5" y="4" width="2.5" height="24" rx="1.25" fill="url(#silverCutlery)"/>
    <rect x="10.25" y="4" width="2.5" height="24" rx="1.25" fill="url(#silverCutlery)"/>
    <rect x="15" y="4" width="2.5" height="24" rx="1.25" fill="url(#silverCutlery)"/>
  </g>

  <!-- Right Spoon -->
  <g filter="url(#drop-shadow)" transform="translate(186, 70)">
    <rect x="8" y="45" width="7" height="85" rx="3.5" fill="url(#silverCutlery)"/>
    <ellipse cx="11.5" cy="22" rx="13" ry="22" fill="url(#silverCutlery)"/>
    <ellipse cx="11.5" cy="22" rx="9" ry="16" fill="#CBD5E1" opacity="0.5"/>
  </g>

  <!-- Center Dining Cloche Dome & Plate -->
  <g filter="url(#soft-shadow)">
    <!-- Plate Base -->
    <ellipse cx="128" cy="180" rx="66" ry="16" fill="url(#goldPlate)"/>
    <ellipse cx="128" cy="178" rx="62" ry="13" fill="#FFFFFF"/>

    <!-- Cloche Dome Cover Sitting Snug on Plate -->
    <path d="M 72 178 C 72 110, 184 110, 184 178 Z" fill="url(#clocheGrad)"/>
    <path d="M 84 172 C 84 122, 172 122, 172 172" stroke="#FFFFFF" stroke-width="4" fill="none" opacity="0.8"/>

    <!-- Golden Knob Handle Attached Right on Top of Dome -->
    <rect x="124" y="104" width="8" height="8" rx="2" fill="#D97706"/>
    <circle cx="128" cy="100" r="11" fill="url(#goldPlate)"/>
    <ellipse cx="126" cy="97" rx="5" ry="2.5" fill="#FEF08A"/>
  </g>

  <!-- Gourmet Aroma Swirls -->
  <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8">
    <path d="M 116 78 Q 110 64 116 52 Q 122 40 118 28"/>
    <path d="M 128 80 Q 134 66 128 54 Q 122 42 128 30"/>
    <path d="M 140 78 Q 146 64 140 52 Q 134 40 140 28"/>
  </g>
</svg>`
  },
  {
    id: 'procure-2pay',
    varName: 'procure2PayIcon',
    name: 'Procure 2Pay',
    concept: 'Procurement cart + ₹',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="trolleyGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <linearGradient id="packageGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="rupeeBadge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#drop-shadow)">
    <rect x="74" y="68" width="46" height="42" rx="6" fill="#3B82F6"/>
    <rect x="92" y="68" width="10" height="42" fill="#93C5FD"/>
    <rect x="110" y="56" width="52" height="54" rx="6" fill="url(#packageGrad)"/>
    <line x1="136" y1="56" x2="136" y2="110" stroke="#FEF3C7" stroke-width="8"/>
    <line x1="110" y1="83" x2="162" y2="83" stroke="#FEF3C7" stroke-width="8"/>
  </g>

  <g filter="url(#soft-shadow)">
    <path d="M 40 76 L 62 76 L 80 156 L 176 156" stroke="url(#trolleyGrad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

    <path d="M 64 88 L 194 88 L 174 156 L 80 156 Z" fill="#E0F2FE" opacity="0.6"/>
    <path d="M 64 88 L 194 88 L 174 156 L 80 156 Z" stroke="url(#trolleyGrad)" stroke-width="6" stroke-linejoin="round" fill="none"/>
    <line x1="90" y1="88" x2="102" y2="156" stroke="#0284C7" stroke-width="3"/>
    <line x1="120" y1="88" x2="128" y2="156" stroke="#0284C7" stroke-width="3"/>
    <line x1="150" y1="88" x2="152" y2="156" stroke="#0284C7" stroke-width="3"/>
    <line x1="175" y1="88" x2="168" y2="156" stroke="#0284C7" stroke-width="3"/>
    <line x1="72" y1="110" x2="188" y2="110" stroke="#0284C7" stroke-width="3"/>
    <line x1="76" y1="132" x2="180" y2="132" stroke="#0284C7" stroke-width="3"/>

    <path d="M 76 172 L 168 172" stroke="url(#trolleyGrad)" stroke-width="6" stroke-linecap="round"/>
    <line x1="84" y1="156" x2="76" y2="188" stroke="url(#trolleyGrad)" stroke-width="6"/>
    <line x1="168" y1="156" x2="162" y2="188" stroke="url(#trolleyGrad)" stroke-width="6"/>

    <g transform="translate(76, 198)">
      <circle cx="0" cy="0" r="14" fill="#1E293B"/>
      <circle cx="0" cy="0" r="8" fill="#94A3B8"/>
      <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
    </g>
    <g transform="translate(162, 198)">
      <circle cx="0" cy="0" r="14" fill="#1E293B"/>
      <circle cx="0" cy="0" r="8" fill="#94A3B8"/>
      <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
    </g>
  </g>

  <g filter="url(#glow-badge)">
    <circle cx="184" cy="144" r="34" fill="url(#rupeeBadge)"/>
    <circle cx="184" cy="144" r="28" fill="none" stroke="#A7F3D0" stroke-width="2" opacity="0.6"/>

    <path d="M 174 130 L 194 130 M 174 137 L 192 137 M 174 130 L 174 144 Q 186 144 186 137 Q 186 130 174 130 M 180 144 L 194 160" 
          stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`
  },
  {
    id: 'solar-expense-hub',
    varName: 'solarExpenseHubIcon',
    name: 'Solar Expense Hub',
    concept: 'Solar panel + sun',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <linearGradient id="panelGrid" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="50%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="panelFrame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#gold-shadow)">
    <g stroke="url(#sunGrad)" stroke-width="5" stroke-linecap="round">
      <line x1="88" y1="26" x2="88" y2="14"/>
      <line x1="88" y1="126" x2="88" y2="138"/>
      <line x1="32" y1="76" x2="20" y2="76"/>
      <line x1="144" y1="76" x2="156" y2="76"/>
      <line x1="48" y1="36" x2="40" y2="28"/>
      <line x1="128" y1="116" x2="136" y2="124"/>
      <line x1="48" y1="116" x2="40" y2="124"/>
      <line x1="128" y1="36" x2="136" y2="28"/>
    </g>

    <circle cx="88" cy="76" r="34" fill="url(#sunGrad)"/>
    <circle cx="82" cy="70" r="14" fill="#FFFFFF" opacity="0.3"/>
  </g>

  <path d="M 128 178 L 128 218 M 106 218 L 150 218" stroke="#475569" stroke-width="8" stroke-linecap="round"/>

  <g filter="url(#soft-shadow)">
    <polygon points="62,112 194,112 216,182 40,182" fill="url(#panelFrame)"/>
    <polygon points="66,116 190,116 211,178 45,178" fill="url(#panelGrid)"/>

    <line x1="97" y1="116" x2="86" y2="178" stroke="#93C5FD" stroke-width="2"/>
    <line x1="128" y1="116" x2="128" y2="178" stroke="#93C5FD" stroke-width="2.5"/>
    <line x1="159" y1="116" x2="170" y2="178" stroke="#93C5FD" stroke-width="2"/>

    <line x1="61" y1="136" x2="195" y2="136" stroke="#93C5FD" stroke-width="2"/>
    <line x1="53" y1="156" x2="203" y2="156" stroke="#93C5FD" stroke-width="2"/>

    <polygon points="76,116 110,116 80,178 46,178" fill="#FFFFFF" opacity="0.25"/>
  </g>

  <g filter="url(#drop-shadow)">
    <circle cx="196" cy="180" r="22" fill="#10B981"/>
    <path d="M 196 166 C 184 172, 184 188, 196 194 C 208 188, 208 172, 196 166 Z" fill="#FFFFFF"/>
    <line x1="196" y1="172" x2="196" y2="190" stroke="#059669" stroke-width="2"/>
  </g>
</svg>`
  },
  {
    id: 'legal-expense',
    varName: 'legalExpenseIcon',
    name: 'Legal Expense',
    concept: 'Legal document + scales + ₹',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="legalDoc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="goldScales" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.15" filter="blur(6px)"/>

  <g filter="url(#drop-shadow)">
    <rect x="68" y="32" width="120" height="168" rx="12" fill="url(#legalDoc)"/>
    <rect x="68" y="32" width="120" height="168" rx="12" fill="none" stroke="#E2E8F0" stroke-width="2"/>

    <rect x="86" y="48" width="84" height="8" rx="4" fill="#334155"/>
    <line x1="86" y1="64" x2="170" y2="64" stroke="#94A3B8" stroke-width="3"/>
    <line x1="86" y1="74" x2="160" y2="74" stroke="#CBD5E1" stroke-width="3"/>
    <line x1="86" y1="84" x2="170" y2="84" stroke="#CBD5E1" stroke-width="3"/>
    <line x1="86" y1="94" x2="140" y2="94" stroke="#CBD5E1" stroke-width="3"/>

    <circle cx="162" cy="168" r="14" fill="#EF4444"/>
    <path d="M 162 178 L 156 196 L 162 192 L 168 196 Z" fill="#B91C1C"/>
  </g>

  <g filter="url(#soft-shadow)">
    <rect x="124" y="80" width="8" height="114" rx="4" fill="url(#goldScales)"/>
    <path d="M 106 194 Q 128 186 150 194 L 154 200 L 102 200 Z" fill="url(#goldScales)"/>
    <circle cx="128" cy="80" r="8" fill="url(#goldScales)"/>

    <path d="M 68 96 Q 128 88 188 96" stroke="url(#goldScales)" stroke-width="6" stroke-linecap="round" fill="none"/>

    <line x1="68" y1="96" x2="52" y2="134" stroke="#B45309" stroke-width="2"/>
    <line x1="68" y1="96" x2="84" y2="134" stroke="#B45309" stroke-width="2"/>
    <path d="M 48 134 Q 68 152 88 134 Z" fill="url(#goldScales)"/>

    <line x1="188" y1="96" x2="172" y2="134" stroke="#B45309" stroke-width="2"/>
    <line x1="188" y1="96" x2="204" y2="134" stroke="#B45309" stroke-width="2"/>
    <path d="M 168 134 Q 188 152 208 134 Z" fill="url(#goldScales)"/>
  </g>

  <g filter="url(#gold-shadow)">
    <circle cx="68" cy="126" r="16" fill="url(#goldScales)"/>
    <circle cx="68" cy="126" r="14" fill="#D97706"/>
    <path d="M 62 120 L 74 120 M 62 124 L 73 124 M 62 120 L 62 128 Q 70 128 70 124 Q 70 120 62 120 M 66 128 L 74 135" 
          stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`
  },
  {
    id: 'flights',
    varName: 'flightsIcon',
    name: 'Flights',
    concept: 'Airplane',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="planeFuselage2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="wingBlue2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.14" filter="blur(6px)"/>

  <!-- Dynamic Motion Jet Streams -->
  <path d="M 40 214 Q 75 186 105 160" stroke="#BAE6FD" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M 52 224 Q 90 196 120 170" stroke="#BAE6FD" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.5"/>

  <!-- Left Swept Wing (Far Side) -->
  <path d="M 120 102 L 152 40 Q 158 36 162 40 L 140 100 Z" fill="url(#wingBlue2)" filter="url(#drop-shadow)"/>
  <rect x="136" y="64" width="12" height="22" rx="6" fill="#94A3B8" transform="rotate(-30 136 64)"/>

  <!-- Jet Fuselage -->
  <g filter="url(#soft-shadow)">
    <!-- Aerodynamic Jet Body Climbing Up-Right -->
    <path d="M 76 156 C 98 136, 154 90, 200 58 C 212 50, 220 54, 216 66 C 184 112, 138 158, 104 178 C 92 184, 76 174, 76 156 Z" fill="url(#planeFuselage2)"/>

    <!-- Cockpit Windshield Glass -->
    <path d="M 198 60 Q 212 52 216 62 Q 208 70 196 70 Z" fill="#0284C7"/>
    <path d="M 200 58 Q 210 52 214 58" stroke="#67E8F9" stroke-width="2" fill="none"/>

    <!-- Window Line -->
    <circle cx="184" cy="76" r="3.5" fill="#0369A1"/>
    <circle cx="170" cy="87" r="3.5" fill="#0369A1"/>
    <circle cx="156" cy="98" r="3.5" fill="#0369A1"/>
    <circle cx="142" cy="109" r="3.5" fill="#0369A1"/>
    <circle cx="128" cy="120" r="3.5" fill="#0369A1"/>
    <circle cx="114" cy="131" r="3.5" fill="#0369A1"/>

    <!-- Tail Fin (Vertical Stabilizer) -->
    <path d="M 88 154 L 72 104 Q 70 98 76 100 L 100 144 Z" fill="url(#wingBlue2)"/>
    <path d="M 74 100 L 80 101 L 92 126 L 84 126 Z" fill="#60A5FA"/>

    <!-- Horizontal Stabilizers -->
    <path d="M 80 162 L 54 156 Q 50 154 54 152 L 86 152 Z" fill="url(#wingBlue2)"/>
  </g>

  <!-- Right Swept Wing (Foreground) -->
  <g filter="url(#drop-shadow)">
    <path d="M 138 122 L 174 184 Q 178 190 172 190 L 114 144 Z" fill="url(#wingBlue2)"/>
    <path d="M 136 126 L 172 184" stroke="#93C5FD" stroke-width="2.5" opacity="0.6"/>
    <!-- Right Engine -->
    <rect x="140" y="150" width="14" height="24" rx="7" fill="#E2E8F0" transform="rotate(32 140 150)"/>
    <ellipse cx="148" cy="156" rx="6" ry="4" fill="#1E293B" transform="rotate(32 148 156)"/>
  </g>
</svg>`
  },
  {
    id: 'hotels',
    varName: 'hotelsIcon',
    name: 'Hotels',
    concept: 'Hotel/building',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="hotelWall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="50%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
    <linearGradient id="windowLit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="canopyGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#B91C1C"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="80" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#soft-shadow)">
    <rect x="68" y="58" width="120" height="152" rx="10" fill="url(#hotelWall)"/>
    
    <rect x="62" y="52" width="132" height="12" rx="5" fill="#1E293B"/>
    
    <circle cx="128" cy="42" r="16" fill="#F59E0B"/>
    <text x="128" y="48" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle">H</text>

    <!-- Row 1 -->
    <rect x="82" y="74" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="106" y="74" width="16" height="16" rx="3" fill="#93C5FD"/>
    <rect x="134" y="74" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="158" y="74" width="16" height="16" rx="3" fill="#93C5FD"/>

    <!-- Row 2 -->
    <rect x="82" y="98" width="16" height="16" rx="3" fill="#93C5FD"/>
    <rect x="106" y="98" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="134" y="98" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="158" y="98" width="16" height="16" rx="3" fill="#93C5FD"/>

    <!-- Row 3 -->
    <rect x="82" y="122" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="106" y="122" width="16" height="16" rx="3" fill="#93C5FD"/>
    <rect x="134" y="122" width="16" height="16" rx="3" fill="#93C5FD"/>
    <rect x="158" y="122" width="16" height="16" rx="3" fill="url(#windowLit)"/>

    <!-- Row 4 -->
    <rect x="82" y="146" width="16" height="16" rx="3" fill="#93C5FD"/>
    <rect x="106" y="146" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="134" y="146" width="16" height="16" rx="3" fill="url(#windowLit)"/>
    <rect x="158" y="146" width="16" height="16" rx="3" fill="#93C5FD"/>

    <!-- Lobby Entrance -->
    <rect x="110" y="176" width="36" height="34" rx="4" fill="#FEF08A"/>
    <rect x="114" y="180" width="13" height="30" fill="#38BDF8"/>
    <rect x="129" y="180" width="13" height="30" fill="#38BDF8"/>

    <path d="M 100 176 L 156 176 L 164 186 L 92 186 Z" fill="url(#canopyGrad)"/>
    <path d="M 92 186 Q 100 192 108 186 Q 116 192 124 186 Q 132 192 140 186 Q 148 192 156 186 Q 164 192 164 186" fill="url(#canopyGrad)"/>
  </g>

  <!-- Stars -->
  <g fill="#F59E0B">
    <path d="M 92 24 L 94 28 L 98 29 L 95 32 L 96 36 L 92 34 L 88 36 L 89 32 L 86 29 L 90 28 Z"/>
    <path d="M 110 18 L 112 22 L 116 23 L 113 26 L 114 30 L 110 28 L 106 30 L 107 26 L 104 23 L 108 22 Z"/>
    <path d="M 128 14 L 130 18 L 134 19 L 131 22 L 132 26 L 128 24 L 124 26 L 125 22 L 122 19 L 126 18 Z"/>
    <path d="M 146 18 L 148 22 L 152 23 L 149 26 L 150 30 L 146 28 L 142 30 L 143 26 L 140 23 L 144 22 Z"/>
    <path d="M 164 24 L 166 28 L 170 29 L 167 32 L 168 36 L 164 34 L 160 36 L 161 32 L 158 29 L 162 28 Z"/>
  </g>
</svg>`
  },
  {
    id: 'villas-homestays',
    varName: 'villasHomestaysIcon',
    name: 'Villas & Homestays',
    concept: 'Villa + tree',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="roofGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
    <linearGradient id="wall3D" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="treeGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.15" filter="blur(6px)"/>

  <!-- Tropical Garden Shade Tree (Right) -->
  <g filter="url(#drop-shadow)">
    <path d="M 188 150 L 188 214 Q 194 218 200 214 L 200 150 Z" fill="#78350F"/>
    <circle cx="192" cy="116" r="34" fill="url(#treeGrad2)"/>
    <circle cx="214" cy="136" r="26" fill="url(#treeGrad2)"/>
    <circle cx="170" cy="136" r="26" fill="url(#treeGrad2)"/>
    <circle cx="192" cy="148" r="28" fill="url(#treeGrad2)"/>
    <circle cx="184" cy="108" r="16" fill="#6EE7B7" opacity="0.6"/>
  </g>

  <!-- 3D Luxury Modern Villa (Left/Center) -->
  <g filter="url(#soft-shadow)">
    <!-- Villa Base Structure -->
    <rect x="48" y="108" width="124" height="102" rx="10" fill="url(#wall3D)"/>
    
    <!-- Terracotta Sloped Pitched Roof -->
    <polygon points="110,54 186,108 34,108" fill="url(#roofGrad2)"/>
    <!-- Roof Overhang Eaves -->
    <rect x="30" y="106" width="160" height="8" rx="4" fill="#7C2D12"/>

    <!-- Triangular Attic Glass Window -->
    <polygon points="110,74 126,92 94,92" fill="#38BDF8"/>
    <polygon points="110,78 122,90 98,90" fill="#E0F2FE" opacity="0.7"/>

    <!-- Large Modern Balcony / Veranda Glass Window -->
    <rect x="62" y="126" width="42" height="42" rx="4" fill="#38BDF8"/>
    <line x1="83" y1="126" x2="83" y2="168" stroke="#FFFFFF" stroke-width="2.5"/>
    <line x1="62" y1="147" x2="104" y2="147" stroke="#FFFFFF" stroke-width="2.5"/>

    <!-- Balcony Railing -->
    <rect x="58" y="156" width="50" height="14" rx="2" fill="#E2E8F0" opacity="0.5"/>
    <line x1="58" y1="156" x2="108" y2="156" stroke="#475569" stroke-width="2"/>

    <!-- Modern Wooden Villa Front Door -->
    <rect x="120" y="138" width="34" height="72" rx="4" fill="#92400E"/>
    <circle cx="127" cy="174" r="3.5" fill="#FCD34D"/>
    <!-- Glass Panel on Door -->
    <rect x="126" y="146" width="22" height="18" rx="2" fill="#BAE6FD" opacity="0.8"/>

    <!-- Entrance Steps -->
    <rect x="114" y="206" width="46" height="6" rx="3" fill="#94A3B8"/>
  </g>
</svg>`
  },
  {
    id: 'holiday-packages',
    varName: 'holidayPackagesIcon',
    name: 'Holiday Packages',
    concept: 'Umbrella + beach ball',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="78" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g filter="url(#drop-shadow)">
    <path d="M 40 206 Q 88 184 136 200 T 226 196 L 226 218 L 40 218 Z" fill="url(#seaGrad)"/>
    <path d="M 36 216 Q 80 196 146 204 L 180 222 L 36 222 Z" fill="url(#sandGrad)"/>
  </g>

  <g filter="url(#soft-shadow)" transform="translate(108, 120) rotate(-15)">
    <line x1="0" y1="-50" x2="0" y2="92" stroke="#E2E8F0" stroke-width="7" stroke-linecap="round"/>
    <circle cx="0" cy="-54" r="5" fill="#F59E0B"/>

    <path d="M 0 -50 C -45 -50, -80 -25, -80 0 C -60 -10, -45 -10, -40 0 Z" fill="#EF4444"/>
    <path d="M 0 -50 C -40 0, -40 0, -40 0 C -20 -12, -10 -12, 0 0 Z" fill="#FFFFFF"/>
    <path d="M 0 -50 C 0 0, 0 0, 0 0 C 10 -12, 20 -12, 40 0 Z" fill="#06B6D4"/>
    <path d="M 0 -50 C 40 0, 40 0, 40 0 C 45 -10, 60 -10, 80 0 C 80 -25, 45 -50, 0 -50 Z" fill="#EF4444"/>
  </g>

  <g filter="url(#soft-shadow)" transform="translate(182, 186)">
    <circle cx="0" cy="0" r="30" fill="#FFFFFF"/>
    <path d="M 0 -30 A 30 30 0 0 1 26 15 L 0 0 Z" fill="#EF4444"/>
    <path d="M 26 15 A 30 30 0 0 1 -15 26 L 0 0 Z" fill="#3B82F6"/>
    <path d="M -15 26 A 30 30 0 0 1 -26 -15 L 0 0 Z" fill="#F59E0B"/>
    <path d="M -26 -15 A 30 30 0 0 1 0 -30 L 0 0 Z" fill="#10B981"/>

    <circle cx="0" cy="0" r="7" fill="#FFFFFF"/>
    <ellipse cx="-8" cy="-12" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>
  </g>

  <path d="M 68 206 L 72 200 L 76 206 L 82 204 L 78 210 L 82 216 L 75 214 L 71 220 L 69 214 L 63 214 L 66 210 Z" fill="#F97316"/>
</svg>`
  },
  {
    id: 'trains',
    varName: 'trainsIcon',
    name: 'Trains',
    concept: 'Modern train',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  ${commonDefs}
    <linearGradient id="trainBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="trainStripe" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="windshield" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>

  <ellipse cx="128" cy="226" rx="76" ry="12" fill="#0F172A" opacity="0.16" filter="blur(6px)"/>

  <g stroke="#64748B" stroke-linecap="round">
    <line x1="72" y1="216" x2="184" y2="216" stroke-width="6"/>
    <line x1="84" y1="204" x2="172" y2="204" stroke-width="4"/>
    <line x1="96" y1="194" x2="160" y2="194" stroke-width="3"/>

    <line x1="68" y1="218" x2="114" y2="190" stroke-width="4"/>
    <line x1="188" y1="218" x2="142" y2="190" stroke-width="4"/>
  </g>

  <g filter="url(#soft-shadow)">
    <path d="M 94 62 Q 128 54 162 62 Q 186 96 186 160 Q 186 196 168 200 L 88 200 Q 70 196 70 160 Q 70 96 94 62 Z" fill="url(#trainBody)"/>

    <path d="M 72 138 Q 128 152 184 138 L 186 162 Q 128 180 70 162 Z" fill="url(#trainStripe)"/>

    <path d="M 88 88 Q 128 78 168 88 L 174 122 Q 128 138 82 122 Z" fill="url(#windshield)"/>
    <path d="M 94 94 Q 128 86 162 94" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>

    <ellipse cx="88" cy="180" rx="8" ry="5" fill="#FEF08A"/>
    <ellipse cx="168" cy="180" rx="8" ry="5" fill="#FEF08A"/>
    <circle cx="128" cy="164" r="8" fill="#F59E0B"/>
    <circle cx="128" cy="164" r="4" fill="#FFFFFF"/>

    <path d="M 86 200 L 128 214 L 170 200 Z" fill="#334155"/>
    <line x1="128" y1="200" x2="128" y2="214" stroke="#64748B" stroke-width="2"/>
  </g>

  <path d="M 120 56 L 128 42 L 136 56" stroke="#475569" stroke-width="4" stroke-linecap="round" fill="none"/>
  <line x1="116" y1="42" x2="140" y2="42" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
</svg>`
  }
];

console.log('Building perfected icons in Kissflow_Icons...');

// 1. Write each SVG file
icons.forEach(icon => {
  const svgPath = path.join(outputDir, `${icon.id}.svg`);
  fs.writeFileSync(svgPath, icon.svg.trim());
});
console.log('SVGs updated.');

// 2. Render PNGs using headless Edge
icons.forEach((icon, idx) => {
  const pngPath = path.join(outputDir, `${icon.id}.png`);
  const tempHtml = `<!DOCTYPE html><html><head><style>
    body { margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 256px; height: 256px; }
    svg { width: 256px; height: 256px; }
  </style></head><body>${icon.svg}</body></html>`;

  const tempHtmlPath = path.join(outputDir, `temp_${icon.id}.html`);
  fs.writeFileSync(tempHtmlPath, tempHtml);

  try {
    const cmd = `"${edgePath}" --headless --disable-gpu --default-background-color=00000000 --window-size=256,256 --screenshot="${pngPath}" "file://${tempHtmlPath}"`;
    cp.execSync(cmd, { stdio: 'pipe' });
    console.log(`[${idx+1}/${icons.length}] Generated ${icon.id}.png (${fs.statSync(pngPath).size} bytes)`);
  } catch (err) {
    console.error(`Error generating ${icon.id}.png:`, err.message);
  } finally {
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  }
});

// 3. Generate index.js
let indexJs = `// Generated from the PNG and SVG assets in Kissflow_Icons.
// Data URIs keep Kissflow custom-component builds completely self-contained.

`;

icons.forEach(icon => {
  const pngPath = path.join(outputDir, `${icon.id}.png`);
  if (fs.existsSync(pngPath)) {
    const pngBase64 = fs.readFileSync(pngPath).toString('base64');
    indexJs += `/**\n * ${icon.name} Icon\n * Concept: ${icon.concept}\n */\n`;
    indexJs += `export const ${icon.varName} = 'data:image/png;base64,${pngBase64}';\n\n`;
  }
});

indexJs += `// All Kissflow Icons Map\nexport const kissflowIcons = {\n`;
icons.forEach(icon => {
  indexJs += `  '${icon.id}': {\n`;
  indexJs += `    id: '${icon.id}',\n`;
  indexJs += `    name: '${icon.name}',\n`;
  indexJs += `    concept: '${icon.concept}',\n`;
  indexJs += `    icon: ${icon.varName},\n`;
  indexJs += `  },\n`;
});
indexJs += `};\n\nexport default kissflowIcons;\n`;

fs.writeFileSync(path.join(outputDir, 'index.js'), indexJs);
console.log('index.js successfully written.');
console.log('RE-RENDER COMPLETE!');
