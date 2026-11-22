import type { SchemaId } from '@/data/projets'
import styles from './Schema.module.css'

/*
 * The case study's diagrams, drawn inline so they take the site's colours and
 * fonts (and the visitor's accent) through CSS variables. Each one is drawn
 * twice: wide, left to right, and narrow, top to bottom; the figure's own width
 * picks one (Schema.module.css), so the text never shrinks below reading size.
 */

type Ton = 'normal' | 'accent' | 'eteint'

/** A labelled box: one line, or a name and a smaller line under it */
function Boite({ x, y, w, h, texte, sous, ton = 'normal' }: { x: number; y: number; w: number; h: number; texte: string; sous?: string; ton?: Ton }) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g className={styles[ton]}>
      <rect className={styles.boite} x={x} y={y} width={w} height={h} rx={10} />
      <text className={styles.texte} x={cx} y={sous ? cy - 3 : cy + 5}>
        {texte}
      </text>
      {sous && (
        <text className={styles.sous} x={cx} y={cy + 14}>
          {sous}
        </text>
      )}
    </g>
  )
}

/** A straight arrow; its head is drawn by hand, so no <marker> id can clash between figures */
function Fleche({ x1, y1, x2, y2, eteinte }: { x1: number; y1: number; x2: number; y2: number; eteinte?: boolean }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const c = Math.cos(a)
  const s = Math.sin(a)
  const r = (n: number) => Math.round(n * 10) / 10
  const pointe = [
    [x2, y2],
    [x2 - 8 * c + 4 * s, y2 - 8 * s - 4 * c],
    [x2 - 8 * c - 4 * s, y2 - 8 * s + 4 * c],
  ]
    .map(([px, py]) => `${r(px)},${r(py)}`)
    .join(' ')
  return (
    <g className={eteinte ? styles.flecheEteinte : styles.fleche}>
      <line x1={x1} y1={y1} x2={r(x2 - 6 * c)} y2={r(y2 - 6 * s)} />
      <polygon points={pointe} />
    </g>
  )
}

/** A column or group name, in the home page's pixel monospace */
function Etiquette({ x, y, texte, milieu }: { x: number; y: number; texte: string; milieu?: boolean }) {
  return (
    <text className={styles.etiquette} x={x} y={y} textAnchor={milieu ? 'middle' : 'start'}>
      {texte}
    </text>
  )
}

/** A light frame around a group of boxes */
function Cadre({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect className={styles.cadre} x={x} y={y} width={w} height={h} rx={12} />
}

/** The accessible svg itself: a name and a description, read once (the hidden layout is display: none) */
function Svg({ id, variante, largeur, hauteur, titre, desc, children }: { id: SchemaId; variante: 'large' | 'etroit'; largeur: number; hauteur: number; titre: string; desc: string; children: React.ReactNode }) {
  const base = `schema-${id}-${variante}`
  return (
    <svg className={styles[variante]} viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-labelledby={`${base}-titre ${base}-desc`}>
      <title id={`${base}-titre`}>{titre}</title>
      <desc id={`${base}-desc`}>{desc}</desc>
      {children}
    </svg>
  )
}

const DESCRIPTIONS: Record<SchemaId, string> = {
  'vue-ensemble':
    "Trois interfaces, le web sur le Mac, Telegram et iMessage, envoient les demandes à un orchestrateur. L'orchestrateur les confie à cinq agents : Mousse pour la recherche, Braise pour la rédaction, Guimauve pour la relecture, Lilas pour la clarté et le ton, Boulon pour le code. Les agents utilisent les outils : mail, agenda, navigateur et coffre Obsidian.",
  'cycle-souvenir':
    "Clark propose un souvenir avec sa source. Je le confirme, le corrige ou l'ignore. Confirmé ou corrigé, il est utilisé et cité avec sa source ; ignoré, il n'est pas utilisé.",
  'action-externe':
    "Une demande arrive. Clark prépare le texte ou la commande exacte. Je valide avec un bouton, Envoyer ou Refuser. Validée, l'action est envoyée telle quelle ; refusée, rien ne part.",
}

function VueEnsemble({ titre }: { titre: string }) {
  const desc = DESCRIPTIONS['vue-ensemble']
  const agents: [string, string][] = [
    ['Mousse', 'recherche'],
    ['Braise', 'rédaction'],
    ['Guimauve', 'relecture'],
    ['Lilas', 'clarté et ton'],
    ['Boulon', 'code'],
  ]
  const outils = ['Mail', 'Agenda', 'Navigateur', 'Coffre Obsidian']
  return (
    <>
      <Svg id="vue-ensemble" variante="large" largeur={720} hauteur={312} titre={titre} desc={desc}>
        <Etiquette x={70} y={22} texte="Interfaces" milieu />
        <Etiquette x={250} y={22} texte="Orchestrateur" milieu />
        <Etiquette x={440} y={22} texte="Agents" milieu />
        <Etiquette x={642} y={22} texte="Outils" milieu />

        <Cadre x={1} y={36} w={138} h={268} />
        {[115, 170, 225].map((y, i) => (
          <Fleche key={y} x1={132} y1={y} x2={185} y2={170 + (i - 1) * 18} />
        ))}
        <Boite x={10} y={93} w={120} h={44} texte="Web" sous="sur le Mac" />
        <Boite x={10} y={148} w={120} h={44} texte="Telegram" />
        <Boite x={10} y={203} w={120} h={44} texte="iMessage" />

        <Boite x={187} y={138} w={128} h={64} texte="Orchestrateur" sous="reçoit, délègue" ton="accent" />

        <Cadre x={355} y={36} w={170} h={268} />
        {agents.map(([nom, role], i) => (
          <g key={nom}>
            <Fleche x1={317} y1={170} x2={365} y2={66 + i * 52} />
            <Boite x={365} y={44 + i * 52} w={150} h={44} texte={nom} sous={role} />
          </g>
        ))}

        <Fleche x1={527} y1={170} x2={565} y2={170} />
        <Cadre x={567} y={36} w={152} h={268} />
        {outils.map((outil, i) => (
          <Boite key={outil} x={576} y={74 + i * 52} w={134} h={40} texte={outil} />
        ))}
      </Svg>

      <Svg id="vue-ensemble" variante="etroit" largeur={340} hauteur={484} titre={titre} desc={desc}>
        <Etiquette x={4} y={14} texte="Interfaces" />
        {[55, 170, 285].map((x, i) => (
          <Fleche key={x} x1={x} y1={70} x2={170 + (i - 1) * 40} y2={106} />
        ))}
        <Boite x={5} y={24} w={100} h={44} texte="Web" sous="sur le Mac" />
        <Boite x={120} y={24} w={100} h={44} texte="Telegram" />
        <Boite x={235} y={24} w={100} h={44} texte="iMessage" />

        <Boite x={95} y={108} w={150} h={52} texte="Orchestrateur" sous="reçoit, délègue" ton="accent" />
        <Fleche x1={170} y1={162} x2={170} y2={192} />

        <Cadre x={1} y={194} w={338} h={136} />
        <Etiquette x={14} y={212} texte="Agents" />
        {agents.map(([nom, role], i) => {
          const ligne = i < 3 ? 0 : 1
          const x = ligne === 0 ? 12 + i * 108 : 66 + (i - 3) * 108
          return <Boite key={nom} x={x} y={220 + ligne * 52} w={100} h={44} texte={nom} sous={role} />
        })}
        <Fleche x1={170} y1={332} x2={170} y2={362} />

        <Cadre x={1} y={364} w={338} h={118} />
        <Etiquette x={14} y={382} texte="Outils" />
        {outils.map((outil, i) => (
          <Boite key={outil} x={14 + (i % 2) * 162} y={392 + Math.floor(i / 2) * 44} w={150} h={36} texte={outil} />
        ))}
      </Svg>
    </>
  )
}

function CycleSouvenir({ titre }: { titre: string }) {
  const desc = DESCRIPTIONS['cycle-souvenir']
  return (
    <>
      <Svg id="cycle-souvenir" variante="large" largeur={720} hauteur={236} titre={titre} desc={desc}>
        <Etiquette x={75} y={22} texte="Clark propose" milieu />
        <Etiquette x={340} y={22} texte="Je décide" milieu />
        <Etiquette x={629} y={22} texte="Clark s'en sert" milieu />

        {[60, 130, 200].map(y => (
          <Fleche key={y} x1={152} y1={130} x2={258} y2={y} eteinte={y === 200} />
        ))}
        <Boite x={1} y={98} w={150} h={64} texte="Proposé" sous="avec sa source" />

        <Boite x={260} y={36} w={160} h={48} texte="Confirmé" sous="tel quel" />
        <Boite x={260} y={106} w={160} h={48} texte="Corrigé" sous="mis à jour" />
        <Boite x={260} y={176} w={160} h={48} texte="Ignoré" sous="écarté" ton="eteint" />

        <Fleche x1={422} y1={60} x2={538} y2={84} />
        <Fleche x1={422} y1={130} x2={538} y2={106} />
        <Boite x={540} y={63} w={178} h={64} texte="Utilisé" sous="cité avec sa source" ton="accent" />

        <Fleche x1={422} y1={200} x2={538} y2={200} eteinte />
        <Boite x={540} y={176} w={178} h={48} texte="Pas utilisé" ton="eteint" />
      </Svg>

      <Svg id="cycle-souvenir" variante="etroit" largeur={340} hauteur={280} titre={titre} desc={desc}>
        <Etiquette x={4} y={14} texte="Clark propose" />
        <Boite x={85} y={24} w={170} h={52} texte="Proposé" sous="avec sa source" />

        <Etiquette x={4} y={104} texte="Je décide" />
        {[57, 170, 283].map(x => (
          <Fleche key={x} x1={170} y1={78} x2={x} y2={124} eteinte={x === 283} />
        ))}
        <Boite x={5} y={126} w={104} h={48} texte="Confirmé" sous="tel quel" />
        <Boite x={118} y={126} w={104} h={48} texte="Corrigé" sous="mis à jour" />
        <Boite x={231} y={126} w={104} h={48} texte="Ignoré" sous="écarté" ton="eteint" />

        <Fleche x1={57} y1={176} x2={95} y2={222} />
        <Fleche x1={170} y1={176} x2={150} y2={222} />
        <Boite x={30} y={224} w={180} h={52} texte="Utilisé" sous="cité avec sa source" ton="accent" />
        <Fleche x1={283} y1={176} x2={283} y2={222} eteinte />
        <Boite x={231} y={224} w={104} h={52} texte="Pas utilisé" ton="eteint" />
      </Svg>
    </>
  )
}

function ActionExterne({ titre }: { titre: string }) {
  const desc = DESCRIPTIONS['action-externe']
  const etapes: { texte: string; sous: string; ton?: Ton }[] = [
    { texte: 'Demande', sous: 'de moi ou de Clark' },
    { texte: 'Préparation', sous: 'texte exact' },
    { texte: 'Validation', sous: 'Envoyer ou Refuser', ton: 'accent' },
    { texte: 'Envoi', sous: 'tel que validé' },
  ]
  return (
    <>
      <Svg id="action-externe" variante="large" largeur={720} hauteur={204} titre={titre} desc={desc}>
        {etapes.map((e, i) => (
          <g key={e.texte}>
            {i > 0 && <Fleche x1={i * 190 - 38} y1={50} x2={i * 190 - 2} y2={50} />}
            <Boite x={i * 190 + 1} y={18} w={148} h={64} texte={e.texte} sous={e.sous} ton={e.ton} />
          </g>
        ))}
        <Etiquette x={455} y={12} texte="par moi" milieu />
        <Fleche x1={455} y1={84} x2={455} y2={138} eteinte />
        <Etiquette x={464} y={116} texte="Refuser" />
        <Boite x={381} y={140} w={148} h={52} texte="Refus" sous="rien ne part" ton="eteint" />
      </Svg>

      <Svg id="action-externe" variante="etroit" largeur={340} hauteur={300} titre={titre} desc={desc}>
        {etapes.map((e, i) => (
          <g key={e.texte}>
            {i > 0 && <Fleche x1={101} y1={i * 80 - 26} x2={101} y2={i * 80 - 2} />}
            <Boite x={6} y={i * 80} w={190} h={52} texte={e.texte} sous={e.sous} ton={e.ton} />
          </g>
        ))}
        <Etiquette x={110} y={232} texte="Envoyer" />
        <Fleche x1={198} y1={186} x2={282} y2={242} eteinte />
        <Etiquette x={252} y={202} texte="Refuser" />
        <Boite x={234} y={244} w={100} h={52} texte="Refus" sous="rien ne part" ton="eteint" />
      </Svg>
    </>
  )
}

export default function Schema({ id, titre, legende }: { id: SchemaId; titre: string; legende: string }) {
  return (
    <figure className={styles.figure}>
      {id === 'vue-ensemble' && <VueEnsemble titre={titre} />}
      {id === 'cycle-souvenir' && <CycleSouvenir titre={titre} />}
      {id === 'action-externe' && <ActionExterne titre={titre} />}
      <figcaption className={styles.legende}>
        <span className={styles.legendeTitre}>{titre}</span> {legende}
      </figcaption>
    </figure>
  )
}
