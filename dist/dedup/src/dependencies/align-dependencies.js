var f=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var k=Object.prototype.hasOwnProperty;var w=(n,e)=>{for(var o in e)f(n,o,{get:e[o],enumerable:!0})},M=(n,e,o,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of $(e))!k.call(n,t)&&t!==o&&f(n,t,{get:()=>e[t],enumerable:!(r=R(e,t))||r.enumerable});return n};var V=n=>M(f({},"__esModule",{value:!0}),n);var j={};w(j,{alignDependencies:()=>g});module.exports=V(j);var d=require("./get-formatted-semver-version"),D=require("./download-dependencies-meta"),u=require("./check-match-peer-dependencies-with-installed"),l=require("../utils/group-by-capacity"),v=require("./get-version-info-in-range");function b(n){const e={};for(const[o,r]of Object.entries(n))if(e[o]||(e[o]={version:"",remoteVersions:[],parentDependencies:[]}),e[o].version=r.version,e[o].remoteVersions=r.versions,r.peerDependencies)for(const[t,c]of Object.entries(r.peerDependencies))e[t]||(e[t]={version:"",remoteVersions:[],parentDependencies:[]}),e[t].parentDependencies.push({needs:c,name:o,version:r.version});return e}async function g(n,e,o=1){e.next(`Step ${o}`);const r=await(0,D.downloadDependenciesMeta)(n,e);Object.entries(r).forEach(([i,m])=>{n.find(a=>a.name===i).version=m.version});const t=b(r),c=(0,u.checkMatchingRootVersionWithPeerDependencies)(t);if(!c.length)return;const x=(0,l.groupBy)(c,i=>[i.name,i.needs]);for(const[i,m]of Object.entries(x)){const a=n.find(({name:s})=>s===i);if(!a)throw new Error(`Dependency ${i} not found`);if(m.length===1){a.version=(0,d.formatSemver)((0,v.getVersionsInfoInRange)(m[0],r[i]?.versions??[]).max),a.latest=!0,e.next(`Installing: ${i}@${a.version}`);continue}const h=m.map(s=>(0,v.getVersionsInfoInRange)(s,r[i]?.versions??[])).reduce((s,p)=>(p.min.compare(s.min)===1&&(s.min=p.min),p.max.compare(s.max)===-1&&(s.max=p.max),s.versions=s.versions.filter(y=>p.versions.some(I=>I.compare(y)===0)),s));a.version=(0,d.formatSemver)(h.max),a.latest=!0,e.next(`Installing: ${i}@${a.version}`)}await g(n,e,o+1)}0&&(module.exports={alignDependencies});
