import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Play, Pause, StepForward, Volume2, VolumeX, ArrowLeftRight } from "lucide-react";

export default function QPUCSablierAlternant() {
  const defaultDurations = [12, 10, 8, 6];
  const [durations, setDurations] = useState(defaultDurations);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [rightStart, setRightStart] = useState(false);

  const stages = useMemo(() => [4, 3, 2, 1], []);
  const [stageIndex, setStageIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);

  const [flips, setFlips] = useState(() => stages.map(() => false));
  const [locked, setLocked] = useState(() => stages.map(() => false));
  const [pendingFlip, setPendingFlip] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const beep = useRef(() => {});
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    beep.current = () => {
      if (!soundOn) return;
      try {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.001;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        const now = ctx.currentTime;
        g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        o.stop(now + 0.2);
      } catch {}
    };
  }, [soundOn]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
      return;
    }
    const tick = (t) => {
      if (!lastTickRef.current) lastTickRef.current = t;
      const dt = (t - lastTickRef.current) / 1000;
      lastTickRef.current = t;
      setElapsed((prev) => prev + dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running]);

  const totalForStage = durations[stageIndex] ?? 1;
  const progress = Math.max(0, 1 - elapsed / totalForStage);

  useEffect(() => {
    if (!running || gameOver) return;
    if (elapsed >= totalForStage) {
      setLocked((prev) => prev.map((v, i) => (i === stageIndex ? true : v)));
      if (stageIndex === stages.length - 1) {
        setRunning(false);
        setGameOver(true);
        if (soundOn) beep.current();
      } else if (autoAdvance) {
        nextStage();
      } else {
        setRunning(false);
        if (soundOn) beep.current();
      }
    }
  }, [elapsed, totalForStage, autoAdvance, running, gameOver]);

  function nextStage() {
    if (soundOn) beep.current();
    setElapsed(0);
    setStageIndex((i) => {
      if (i < stages.length - 1) return i + 1;
      setRunning(false);
      setGameOver(true);
      return i;
    });
  }

  function resetAll() {
    setRunning(false);
    setStageIndex(0);
    setElapsed(0);
    setLocked(stages.map(() => false));
    setPendingFlip(false);
    setGameOver(false);
    // Optionnel : remettre les flips à zéro ? On garde tel quel pour conserver les inversions précédentes si désiré.
    // setFlips(stages.map(() => false));
  }

  function togglePause() {
    if (gameOver) return;
    if (running) {
      setPendingFlip(true);
      setRunning(false);
    } else {
      if (pendingFlip) {
        const currentIndex = stageIndex;
        setFlips((prev) => prev.map((v, idx) => (!locked[idx] && idx <= currentIndex ? !v : v)));
        setPendingFlip(false);
      }
      setRunning(true);
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        nextStage();
      } else if (e.key && e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, stageIndex, locked, pendingFlip, gameOver]);

  const stageLabel = `${stages[stageIndex]} pt${stages[stageIndex] > 1 ? "s" : ""}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Sablier QPUC — 4 → 1 points alternant</h1>
          <Button variant="outline" size="sm" onClick={() => setRightStart((v) => !v)} className="gap-2">
            <ArrowLeftRight size={16} />
            {rightStart ? "4 à droite" : "4 à gauche"}
          </Button>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Bloc actuel: <span className="font-bold text-lg">{stageLabel}</span>
              </span>
              <span className="text-sm text-slate-500">Temps restant: {Math.max(0, Math.ceil(totalForStage - elapsed))} s</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 mb-4 w-full">
              {stages.map((pts, idx) => {
                const isActive = idx === stageIndex;
                const isDone = idx < stageIndex || locked[idx];
                const pct = isActive ? progress * 100 : isDone ? 0 : 100;

                const baseRight = rightStart ? idx % 2 === 0 : idx % 2 !== 0;
                const finalRight = flips[idx] ? !baseRight : baseRight;
                const alignClass = finalRight ? "self-end" : "self-start";

                return (
                  <div
                    key={pts}
                    className={`relative ${alignClass} rounded-xl border ${isActive ? "border-slate-400" : "border-slate-200"} overflow-hidden shadow-sm bg-white w-1/3 transition-all duration-500`}
                  >
                    <div className="p-3 flex items-center justify-between">
                      <div className="font-medium">
                        {pts} pt{pts > 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-slate-500">
                        {Math.ceil((durations[idx] || 0) * (isActive ? progress : idx < stageIndex ? 0 : 1))} s
                      </div>
                    </div>
                    <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 w-full bg-slate-900"
                        initial={{ height: `${100 - pct}%` }}
                        animate={{ height: `${100 - pct}%` }}
                        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                      />
                    </div>
                    <AnimatePresence>
                      {isDone && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.08 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-900"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={togglePause} disabled={gameOver} className="gap-2">
                {running ? <Pause size={16} /> : <Play size={16} />}
                {running ? "Pause" : gameOver ? "Fin du jeu" : "Démarrer"}
              </Button>
              <Button variant="secondary" onClick={nextStage} disabled={gameOver} className="gap-2">
                <StepForward size={16} />
                Bloc suivant
              </Button>
              <Button variant="outline" onClick={resetAll} className="gap-2">
                <RotateCcw size={16} />
                Reset
              </Button>

              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  Auto ↦<Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} disabled={gameOver} />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  Son {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <Switch checked={soundOn} onCheckedChange={setSoundOn} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Réglages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stages.map((pts, i) => (
                <div key={pts} className="space-y-2">
                  <div className="text-sm font-medium">
                    Durée {pts} pt{pts > 1 ? "s" : ""} (s)
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[durations[i]]}
                      onValueChange={(v) => {
                        const copy = [...durations];
                        copy[i] = v[0];
                        setDurations(copy);
                        if (i === stageIndex) setElapsed(0);
                      }}
                      min={3}
                      max={60}
                      step={1}
                    />
                    <Input
                      className="w-20"
                      type="number"
                      min={3}
                      max={300}
                      value={durations[i]}
                      onChange={(e) => {
                        const val = Math.max(3, Math.min(300, Number(e.target.value || 0)));
                        const copy = [...durations];
                        copy[i] = val;
                        setDurations(copy);
                        if (i === stageIndex) setElapsed(0);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-slate-600">
              Pause prépare un basculement du bloc en cours et de tous les blocs au-dessus, qui ne se produira qu'au redémarrage. Les blocs écoulés restent statiques. Le jeu se bloque à la fin du bloc 1 et nécessite un reset manuel. La touche Espace permet aussi de mettre en pause ou de redémarrer.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
