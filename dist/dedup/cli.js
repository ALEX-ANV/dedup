const a=require("module"),o=require("path"),m=require("fs"),c=a._resolveFilename,l=__dirname,u=[];a._resolveFilename=function(e,f){let s;for(const t of u)if(e===t.module&&t.exactMatch){const i=u.find(r=>e===r.module||e.startsWith(r.module+"/")),n=o.join(l,i.exactMatch);if(d(n)){s=n;break}}else{const i=new RegExp(t.module.replace(/\*$/,"(?<rest>.*)")),n=e.match(i);if(n?.groups){const r=o.join(l,t.pattern.replace("*",""),n.groups.rest+".js");d(r)&&(s=r)}}if(s){const t=[s,...[].slice.call(arguments,1)];return c.apply(this,t)}else return c.apply(this,arguments)};function d(e){try{return m.statSync(e).isFile()}catch{return!1}}require("./src/cli.js");
