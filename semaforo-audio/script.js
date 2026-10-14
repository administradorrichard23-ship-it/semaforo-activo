// 1 y 2 · Cada estado: tono (Hz), duración del bip (s), cada cuánto suena (s), vibración (ms)
const ESTADOS = {
  rojo:  { tono: 400,  bip: 0.15, cada: 1.0,  dura: 10, vibracion: [400],         voz: "Espere" },
  verde: { tono: 1000, bip: 0.05, cada: 0.2,  dura: 8,  vibracion: [80, 60, 80],  voz: "Puede cruzar" }
};
let ctx, maestro, estado = "rojo", proximoBip = 0, finEstado = 0;
 
function bip(f, dur, cuando) {                 // un bip programado en el reloj del audio
  const osc = ctx.createOscillator(), vol = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = f;
  vol.gain.setValueAtTime(0.06, cuando);
  vol.gain.exponentialRampToValueAtTime(0.001, cuando + dur);
  osc.connect(vol).connect(maestro);
  osc.start(cuando); osc.stop(cuando + dur);
}
 
// 3 · El "director": cada 25 ms revisa qué bips tocan en los próximos 100 ms
function programar() {
  const ahora = ctx.currentTime;
  if (ahora >= finEstado) cambiarA(estado === "rojo" ? "verde" : "rojo");
  while (proximoBip < ahora + 0.1) {
    bip(ESTADOS[estado].tono, ESTADOS[estado].bip, proximoBip);
    proximoBip += ESTADOS[estado].cada;
  }
}
 
function cambiarA(nuevo) {
  estado = nuevo;
  finEstado = ctx.currentTime + ESTADOS[nuevo].dura;
  proximoBip = ctx.currentTime;
  mostrarEstado(nuevo);                          // visual (nunca solo sonido)
  anunciar(ESTADOS[nuevo].voz);                  // voz
  if ("vibrate" in navigator) navigator.vibrate(ESTADOS[nuevo].vibracion); // háptico
}
 
function encender() {
  ctx ??= new AudioContext();
  maestro ??= ctx.createGain();
  maestro.connect(ctx.destination);
  cambiarA("rojo");
  setInterval(programar, 25);
}