var o=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var n=Object.getOwnPropertyNames;var p=Object.prototype.hasOwnProperty;var S=(r,m)=>{for(var e in m)o(r,e,{get:m[e],enumerable:!0})},$=(r,m,e,a)=>{if(m&&typeof m=="object"||typeof m=="function")for(let t of n(m))!p.call(r,t)&&t!==e&&o(r,t,{get:()=>m[t],enumerable:!(a=f(m,t))||a.enumerable});return r};var c=r=>$(o({},"__esModule",{value:!0}),r);var u={};S(u,{formatSemver:()=>i});module.exports=c(u);function i(r){return`${r.major}.${r.minor}.${r.patch}`}0&&(module.exports={formatSemver});