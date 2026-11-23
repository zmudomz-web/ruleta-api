const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Guarda el intento actual de cada usuario en minúsculas: { "usuario": 2 }
const partidas = new Map();

const MAX_INTENTOS = 5;
// Probabilidad de bala por disparo (ej. 0.18 = ~18% de probabilidad)
const PROB_BALA = 0.18;
// Duración del timeout en segundos por defecto (30 segundos)
const SEGUNDOS_TIMEOUT_DEFAULT = 30;

app.get("/ruleta", (req, res) => {
  const rawUser = (req.query.user || "Jugador").toString().trim();
  const key = rawUser.toLowerCase();

  // Permite ajustar segundos desde ?tiempo=XX si se envía; si no, usa 30
  const tiempoParam = parseInt(req.query.tiempo, 10);
  const segundosTimeout =
    !isNaN(tiempoParam) && tiempoParam > 0
      ? tiempoParam
      : SEGUNDOS_TIMEOUT_DEFAULT;

  const intentoActual = (partidas.get(key) || 0) + 1;
  const disparoLetal = Math.random() < PROB_BALA;

  // Caso 1: Le tocó la bala -> Aplica /timeout de 30s al inicio del mensaje
  if (disparoLetal) {
    partidas.delete(key); // Reinicia la partida para ese usuario
    return res.send(
      `/timeout ${rawUser} ${segundosTimeout} 💥 ¡BANG! @${rawUser} cayó en el intento ${intentoActual}/${MAX_INTENTOS}. ¡Vuelve a intentarlo!`
    );
  }

  // Caso 2: Sobrevivió y completó los 5/5 intentos -> Victoria
  if (intentoActual >= MAX_INTENTOS) {
    partidas.delete(key); // Reinicia para una nueva partida futura
    return res.send(
      `@${rawUser} jaló el gatillo por última vez... *clic* 😮‍💨 🏆 ¡GANÓ! Sobrevivió los ${intentoActual}/${MAX_INTENTOS} intentos.`
    );
  }

  // Caso 3: Sobrevivió y avanza el marcador X/5
  partidas.set(key, intentoActual);
  return res.send(
    `@${rawUser} jaló el gatillo... *clic* 😮‍💨 No pasó nada. [Marcador: ${intentoActual}/${MAX_INTENTOS} intentos]`
  );
});

app.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
