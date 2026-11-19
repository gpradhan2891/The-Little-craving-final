import * as T from './assets/vendor/three.module.js';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = T.MathUtils.clamp;
const ease = v => {v=clamp(v,0,1);return v*v*(3-2*v)};
const mat = (color, roughness=.55, metalness=0) => new T.MeshStandardMaterial({color,roughness,metalness});
function mesh(parent, geometry, material, x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const sphere=new T.SphereGeometry(1,32,24);
function ball(parent,material,x,y,z,sx,sy=sx,sz=sx){return mesh(parent,sphere,material,x,y,z,sx,sy,sz)}
function setup(container,span=6){
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(0,.1,10);camera.lookAt(0,0,0);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;container.append(renderer.domElement);
 scene.add(new T.HemisphereLight(0xfff6e5,0x8b6270,2.7));const key=new T.DirectionalLight(0xfff5df,4);key.position.set(-4,6,7);scene.add(key);const fill=new T.DirectionalLight(0xffd2e0,2);fill.position.set(5,2,-1);scene.add(fill);
 const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=span/(2*Math.tan(T.MathUtils.degToRad(17.5)))*Math.max(1,1/camera.aspect);camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(container);resize();
 let visible=true;new IntersectionObserver(e=>{visible=e[0].isIntersecting},{threshold:0}).observe(container);
 return {scene,camera,renderer,draw:()=>renderer.render(scene,camera),active:()=>visible&&!document.hidden};
}
function heartShape(){const s=new T.Shape();s.moveTo(0,-1.5);s.bezierCurveTo(-.5,-1.1,-1.65,-.35,-1.65,.45);s.bezierCurveTo(-1.65,1.45,-.45,1.7,0,.8);s.bezierCurveTo(.5,1.7,1.65,1.45,1.65,.45);s.bezierCurveTo(1.65,-.35,.5,-1.1,0,-1.5);return s;}
function makePug(){
 const g=new T.Group(),fur=mat('#d5b48a',.72),cream=mat('#e9ccaa',.65),dark=mat('#3a2825',.67),muzzle=mat('#57413a',.8),black=mat('#100c0b',.12),pink=mat('#d58c8b',.5),white=mat('#fff6db',.3);
 const body=ball(g,fur,0,.53,0,.43,.58,.33);ball(g,cream,0,.55,.22,.28,.37,.12);
 for(const side of [-1,1]){ball(g,fur,side*.35,.22,.04,.24,.26,.28);ball(g,cream,side*.19,.12,.31,.15,.13,.24);const leg=ball(g,fur,side*.21,.38,.27,.13,.32,.14);for(let i=0;i<3;i++)ball(g,muzzle,side*.19+(i-1)*.07,.075,.49,.013,.035,.016);}
 const head=new T.Group();head.position.set(0,1.12,.06);g.add(head);ball(head,fur,0,0,0,.51,.44,.39);ball(head,cream,0,.12,.24,.34,.25,.15);
 for(const side of [-1,1]){const ear=ball(head,dark,side*.43,.06,-.02,.19,.32,.12);ear.rotation.z=side*.45;ball(head,muzzle,side*.22,-.02,.32,.19,.22,.09);ball(head,black,side*.22,.015,.405,.102,.115,.065);ball(head,white,side*.24,.055,.46,.027);ball(head,white,side*.19,-.005,.46,.011);ball(head,muzzle,side*.11,-.19,.39,.2,.15,.14);const brow=ball(head,muzzle,side*.2,.19,.34,.15,.025,.028);brow.rotation.z=side*-.13;}
 ball(head,black,0,-.12,.535,.105,.07,.057);ball(head,dark,0,-.29,.42,.11,.045,.04);ball(head,pink,0,-.33,.44,.057,.07,.022);
 for(let i=0;i<3;i++) {const fold=ball(head,fur,0,.26-i*.065,.34,.15-i*.025,.018,.025);fold.rotation.z=.04;}
 const tail=mesh(g,new T.TorusGeometry(.17,.065,10,30,Math.PI*1.8),fur,.4,.5,-.18);tail.rotation.y=.8;
 const collar=mesh(g,new T.TorusGeometry(.29,.045,12,40),mat('#a44760'),0,.85,.02);collar.rotation.x=Math.PI/2;ball(g,mat('#bb923c',.3,.65),0,.8,.32,.065,.075,.022);
 return {group:g,head,body,tail};
}
export async function brandScene(container,phase){
 const {scene,draw,active}=setup(container,5.8);const group=new T.Group();scene.add(group);group.rotation.set(-.035,-.09,-.03);
 const heart=mesh(group,new T.ExtrudeGeometry(heartShape(),{depth:.22,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.14,bevelThickness:.12,curveSegments:40}),mat('#e58aa3',.32),0,.05,0);heart.material=new T.MeshPhysicalMaterial({color:'#e998b0',roughness:.34,metalness:.02,clearcoat:1,clearcoatRoughness:.25});
 const ring=mesh(group,new T.TorusGeometry(2.02,.026,12,160),mat('#c4a249',.25,.8),0,0,.02);const inner=mesh(group,new T.TorusGeometry(2.065,.008,8,160),mat('#e8ce80',.25,.7),0,0,.01);
 const lettering=new T.Group();group.add(lettering);
 const texture=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height);for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){const i=(y*c.width+xx)*4;const r=d.data[i],g=d.data[i+1],b=d.data[i+2];const darkness=255-Math.max(r,g,b);d.data[i+3]=(Math.max(r,g,b)-Math.min(r,g,b)<40)?clamp((darkness-70)*2,0,255)*d.data[i+3]/255:0;}x.putImageData(d,0,0);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;resolve(tex)};img.onerror=reject;img.src='assets/logo-master.png'});
 mesh(lettering,new T.PlaneGeometry(3.5,2.92),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),0,.05,.5);
 // The cake icon is physically assembled on its own tiny pedestal.
 const icon=new T.Group();icon.position.set(.78,.42,.48);icon.scale.setScalar(.5);group.add(icon);makeCake(icon,'floral',true);
 const pug=makePug();group.add(pug.group);pug.group.scale.setScalar(.63);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),grad=ctx.createRadialGradient(64,64,2,64,64,64);grad.addColorStop(0,'rgba(75,35,30,.28)');grad.addColorStop(1,'rgba(75,35,30,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);const shadow=mesh(scene,new T.PlaneGeometry(5.5,1.2),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),0,-2.22,-.1);shadow.rotation.x=-.35;
 let time=reduce.matches?9.5:0,paused=reduce.matches,last=performance.now(),lastLabel='';
 const labels=['Assembling a little love…','A little hello…','Looking right…','Looking left…','One happy jump!','Right here, beside the C.'];
 function pose(t){
  heart.scale.setScalar(.01+.99*ease(t/1.3));heart.rotation.y=(1-ease(t/1.3))*-.75;ring.scale.setScalar(.01+.99*ease((t-.3)/1.2));inner.scale.copy(ring.scale);ring.rotation.z=(1-ease((t-.3)/1.2))*1.1;lettering.scale.setScalar(.01+.99*ease((t-.8)/.8));icon.scale.setScalar(.5*ease((t-1)/.9));icon.position.y=.42+(1-ease((t-1)/.9))*2;
  const dog=pug.group;dog.visible=t>1.8;dog.position.set(1.05,-.35+1.55*ease((t-1.8)/1.1),-.55);dog.rotation.set(0,0,0);dog.scale.set(.63,.63,.63);pug.head.rotation.set(0,0,0);
  if(t>=3&&t<4.2)pug.head.rotation.y=-.65*Math.sin(clamp((t-3)/1.2,0,1)*Math.PI);
  if(t>=4.2&&t<5.5)pug.head.rotation.y=.7*Math.sin(clamp((t-4.2)/1.3,0,1)*Math.PI);
  if(t>=5.5&&t<5.9)dog.scale.y=.63-.1*Math.sin((t-5.5)/.4*Math.PI);
  if(t>=5.9){const u=clamp((t-5.9)/1.5,0,1),e=ease(u);dog.position.set(1.05-2.47*e,1.2-2.85*e+1.45*Math.sin(u*Math.PI),-.55+1.5*ease(u*2.4));dog.rotation.z=-.14*Math.sin(u*Math.PI);}
  if(t>7.4&&t<8){dog.scale.y=.63-.09*Math.sin((t-7.4)/.6*Math.PI);}
  if(t>=8){pug.head.rotation.z=-.07;pug.tail.rotation.z=.15*Math.sin(Math.min(t-8,1.5)*5);}
  const idx=t<1.8?0:t<3?1:t<4.2?2:t<5.5?3:t<7.5?4:5;if(lastLabel!==labels[idx]){lastLabel=labels[idx];phase(lastLabel)}
 }
 function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;if(active()){if(!paused)time=Math.min(9.5,time+dt);pose(time);draw();}requestAnimationFrame(frame)}container.classList.add('loaded');requestAnimationFrame(frame);
 return {replay(){time=0;paused=false},pause(value){paused=value},finish(){time=9.5;paused=true},seek(value){time=value;pose(time);draw()},get time(){return time}};
}
function rose(parent,x,y,z,size,color){const g=new T.Group();g.position.set(x,y,z);parent.add(g);const m=mat(color,.5);for(let j=0;j<3;j++)for(let i=0;i<5;i++){const a=i/5*Math.PI*2+j*.4,r=size*(.24+j*.15);const p=ball(g,m,Math.cos(a)*r,j*.035,Math.sin(a)*r,size*.43,size*.22,size*.3);p.rotation.y=-a;p.rotation.z=.2;}ball(g,m,0,.11,0,size*.22);return g}
function makeCake(parent,kind,mini=false){
 const palette={floral:['#fff1db','#ed9eaf','#a54562'],chocolate:['#49261c','#78452f','#c69b53'],rainbow:['#fff1d1','#d18fae','#adc772'],gift:['#eee3fa','#a28aba','#e2b572']}[kind];
 const icing=mat(palette[0],.48),accent=mat(palette[1],.4),gold=mat('#c9a356',.3,.6);const group=new T.Group();parent.add(group);const base=mesh(group,new T.CylinderGeometry(1.2,1.23,.12,80),gold,0,-.9,0);const stand=mesh(group,new T.CylinderGeometry(.25,.38,.5,48),mat('#e6cbbc',.3),0,-1.17,0);mesh(group,new T.CylinderGeometry(.66,.75,.1,64),mat('#e6cbbc',.3),0,-1.45,0);
 mesh(group,new T.CylinderGeometry(.99,1.01,1.1,96,1),icing,0,-.29,0);mesh(group,new T.CylinderGeometry(.75,.77,.72,80),icing,0,.62,0);
 for(let y=-.78;y<.25;y+=.105){const r=mesh(group,new T.TorusGeometry(1.003,.012,6,80),icing,0,y,0);r.rotation.x=Math.PI/2}
 for(let j=0;j<2;j++){const r=j?.76:1.0,y=j?.99:.26;for(let i=0;i<42;i++){const a=i/42*Math.PI*2;ball(group,accent,Math.cos(a)*r,y,Math.sin(a)*r,.055,.065,.055)}}
 if(kind==='rainbow'){const colors=['#e7a1af','#ebc57b','#a9bd83','#91bbc2','#b29fca'];colors.forEach((c,i)=>mesh(group,new T.CylinderGeometry(1.012,1.012,.14,80),mat(c),0,-.7+i*.18,0));for(let i=0;i<4;i++){const arc=mesh(group,new T.TorusGeometry(.5+i*.11,.058,10,50,Math.PI),mat(colors[i]),0,1.15,0);}}
 else {for(let i=0;i<7;i++){const a=i*.72;rose(group,.58*Math.cos(a),1.0+(i%2)*.04,.5*Math.sin(a),.2,palette[1+(i%2)]);}for(let i=0;i<4;i++){rose(group,.86,-.58+i*.34,.18,.16,palette[1]);const leaf=ball(group,mat('#72815a'),.9,-.41+i*.34,.14,.17,.035,.08);leaf.rotation.z=.5;}}
 if(kind==='chocolate'){for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ball(group,accent,Math.cos(a)*1.01,.12-(i%3)*.05,Math.sin(a)*1.01,.07,.18+(i%3)*.03,.07)}for(let i=0;i<6;i++){const square=mesh(group,new T.BoxGeometry(.22,.45,.06),mat('#362016'),Math.cos(i)*.43,1.2,Math.sin(i)*.35);square.rotation.z=i*.12}}
 group.rotation.y=-.3;return group;
}
export function cakeScene(container){const {scene,draw,active,camera}=setup(container,4.5);camera.position.y=1.35;camera.lookAt(0,0,0);let cake=makeCake(scene,'floral'),target=-.3,last=performance.now();function frame(now){if(active()){cake.rotation.y+=(target-cake.rotation.y)*.09;draw()}last=now;requestAnimationFrame(frame)}requestAnimationFrame(frame);return {set(kind){scene.remove(cake);cake.traverse(o=>{if(o.isMesh){if(o.geometry!==sphere)o.geometry.dispose();o.material.dispose()}});cake=makeCake(scene,kind);target=-.3;draw()},turn(){target+=Math.PI/3},hide(v){container.style.visibility=v?'hidden':'visible'}}}
