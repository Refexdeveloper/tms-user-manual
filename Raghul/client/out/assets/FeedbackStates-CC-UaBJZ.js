import{h as U,i as B,e as D,n as F,o as W,s as h,j as i,v as P,x as H,y as K,Z as N,au as v,k as _,r as $,a as O,b as E,g as I,B as u,t as a,T as p}from"./index-DMI6qf0R.js";import{A as X}from"./TextField-BWIb1RPS.js";import{B as M}from"./Button-ctBsK-Yd.js";import{S as y}from"./Stack-BHz2h6Ad.js";function L(e){return String(e).match(/[\d.\-+]*\s*(.*)/)[1]||""}function V(e){return parseFloat(e)}function J(e){return U("MuiSkeleton",e)}B("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const Z=["animation","className","component","height","style","variant","width"];let x=e=>e,j,C,R,k;const G=e=>{const{classes:r,variant:t,animation:o,hasChildren:n,width:s,height:c}=e;return H({root:["root",t,o,n&&"withChildren",n&&!s&&"fitContent",n&&!c&&"heightAuto"]},J,r)},Q=_(j||(j=x`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),Y=_(C||(C=x`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`)),ee=K("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,r[t.variant],t.animation!==!1&&r[t.animation],t.hasChildren&&r.withChildren,t.hasChildren&&!t.width&&r.fitContent,t.hasChildren&&!t.height&&r.heightAuto]}})(({theme:e,ownerState:r})=>{const t=L(e.shape.borderRadius)||"px",o=V(e.shape.borderRadius);return h({display:"block",backgroundColor:e.vars?e.vars.palette.Skeleton.bg:N(e.palette.text.primary,e.palette.mode==="light"?.11:.13),height:"1.2em"},r.variant==="text"&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${o}${t}/${Math.round(o/.6*10)/10}${t}`,"&:empty:before":{content:'"\\00a0"'}},r.variant==="circular"&&{borderRadius:"50%"},r.variant==="rounded"&&{borderRadius:(e.vars||e).shape.borderRadius},r.hasChildren&&{"& > *":{visibility:"hidden"}},r.hasChildren&&!r.width&&{maxWidth:"fit-content"},r.hasChildren&&!r.height&&{height:"auto"})},({ownerState:e})=>e.animation==="pulse"&&v(R||(R=x`
      animation: ${0} 2s ease-in-out 0.5s infinite;
    `),Q),({ownerState:e,theme:r})=>e.animation==="wave"&&v(k||(k=x`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${0} 2s linear 0.5s infinite;
        background: linear-gradient(
          90deg,
          transparent,
          ${0},
          transparent
        );
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `),Y,(r.vars||r).palette.action.hover)),f=D.forwardRef(function(r,t){const o=F({props:r,name:"MuiSkeleton"}),{animation:n="pulse",className:s,component:c="span",height:g,style:A,variant:q="text",width:z}=o,m=W(o,Z),b=h({},o,{animation:n,component:c,variant:q,hasChildren:!!m.children}),T=G(b);return i.jsx(ee,h({as:c,ref:t,className:P(T.root,s),ownerState:b},m,{style:h({width:z,height:g},A)}))});var l={},w;function re(){if(w)return l;w=1;var e=$();Object.defineProperty(l,"__esModule",{value:!0}),l.default=void 0;var r=e(O()),t=E();return l.default=(0,r.default)((0,t.jsx)("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19zm0-5h-4.99c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14z"}),"InboxOutlined"),l}var te=re();const ae=I(te);var d={},S;function ie(){if(S)return d;S=1;var e=$();Object.defineProperty(d,"__esModule",{value:!0}),d.default=void 0;var r=e(O()),t=E();return d.default=(0,r.default)((0,t.jsx)("path",{d:"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"}),"ErrorOutline"),d}var oe=ie();const ne=I(oe);function ce({title:e="No data found",description:r="There is nothing to show here yet.",actionLabel:t,onAction:o,icon:n}){return i.jsxs(u,{role:"status",sx:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",py:6,px:3,gap:1.5,bgcolor:a.surface,border:`1px solid ${a.border}`,borderRadius:`${a.radius.card}px`,boxShadow:a.shadow.sm},children:[i.jsx(u,{sx:{width:56,height:56,borderRadius:`${a.radius.card}px`,bgcolor:a.primary.soft,color:a.primary.main,display:"flex",alignItems:"center",justifyContent:"center",mb:.5},"aria-hidden":!0,children:n||i.jsx(ae,{sx:{fontSize:a.control.iconLg}})}),i.jsx(p,{sx:{fontSize:16,fontWeight:600,color:a.text.primary},children:e}),i.jsx(p,{sx:{fontSize:14,color:a.text.secondary,maxWidth:360},children:r}),t&&o&&i.jsx(M,{variant:"contained",color:"primary",onClick:o,sx:{mt:1},children:t})]})}function he({title:e="Something went wrong",message:r="We could not load this data. Please try again.",onRetry:t}){return i.jsx(u,{sx:{py:1},children:i.jsxs(X,{severity:"error",icon:i.jsx(ne,{}),sx:{borderRadius:`${a.radius.card}px`,border:`1px solid ${a.danger.soft}`,bgcolor:a.danger.soft,"& .MuiAlert-message":{width:"100%"}},action:t?i.jsx(M,{color:"inherit",size:"small",onClick:t,"aria-label":"Retry loading",children:"Retry"}):void 0,children:[i.jsx(p,{sx:{fontSize:14,fontWeight:600},children:e}),i.jsx(p,{sx:{fontSize:13},children:r})]})})}function pe({rows:e=6,cols:r=5}){return i.jsx(u,{"aria-busy":"true","aria-label":"Loading table",sx:{bgcolor:a.surface,border:`1px solid ${a.border}`,borderRadius:`${a.radius.table}px`,p:2,boxShadow:a.shadow.sm},children:i.jsxs(y,{spacing:1.5,children:[i.jsx(f,{variant:"rounded",height:40,sx:{borderRadius:"10px",bgcolor:a.divider}}),Array.from({length:e}).map((t,o)=>i.jsx(y,{direction:"row",spacing:1,children:Array.from({length:r}).map((n,s)=>i.jsx(f,{variant:"rounded",height:36,sx:{flex:1,borderRadius:"8px",bgcolor:o%2===0?a.divider:"#F8FAFC"}},s))},o))]})})}function xe({count:e=4}){return i.jsx(u,{"aria-busy":"true","aria-label":"Loading metrics",sx:{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"1fr 1fr",md:`repeat(${Math.min(e,4)}, 1fr)`},gap:2},children:Array.from({length:e}).map((r,t)=>i.jsx(f,{variant:"rounded",height:120,sx:{borderRadius:`${a.radius.card}px`,bgcolor:a.divider}},t))})}export{he as E,xe as K,pe as T,ce as a};
