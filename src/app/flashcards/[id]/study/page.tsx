"use client";
import { AppShell } from "@/components/layout/AppShell";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { StudySession } from "@/components/flashcards/StudySession";

const CARDS = [
  { id:"1", front:"Quelle est la formule de l'energie cinetique ?", back:"Ek = 1/2 mv², ou m est la masse en kg et v la vitesse en m/s." },
  { id:"2", front:"Enoncer le principe d'incertitude d'Heisenberg", back:"Dx * Dp >= h/2. On ne peut connaitre simultanement la position et la quantite de mouvement d'une particule." },
  { id:"3", front:"Qu'est-ce que l'enthalpie libre de Gibbs ?", back:"G = H - TS. Une reaction est spontanee si DG < 0 a pression et temperature constantes." },
  { id:"4", front:"Definir la fonction d'onde psi en mecanique quantique", back:"psi est une fonction complexe dont |psi|² donne la densite de probabilite de presence de la particule." },
  { id:"5", front:"Quelle est l'equation de Schrodinger dependante du temps ?", back:"ih * d(psi)/dt = H(chapeau) * psi, ou H est l'hamiltonien de l'operateur." },
];

export default function StudyPage() {
  return (
    <>
      <AmbientBackground />
      <AppShell>
        <div style={{ position:"relative", zIndex:1 }} className="animate-slide-up">
          <StudySession deckTitle="Mecanique Quantique" cards={CARDS} />
        </div>
      </AppShell>
    </>
  );
}
