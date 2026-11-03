/*
 * Real before/after excerpts from the projects' public repositories, shown on
 * their project page. Copied from the commit linked in `source` (indentation
 * tidied only); each note explains one change. Add one only from a real commit.
 */

export type LigneDiff = { texte: string; cote?: 'avant' | 'apres' }

export type Diff = {
  titre: string
  fichier: string
  source: string
  lignes: LigneDiff[]
  notes: string[]
}

export const diffs: Record<string, Diff> = {
  'crud-securise': {
    titre: 'Un correctif de la connexion',
    fichier: 'connexion.php',
    source: 'https://github.com/carls-xyz/crud-security/commit/c8bbdd01',
    lignes: [
      { texte: '$user = $stmt->fetch(PDO::FETCH_ASSOC);' },
      { texte: '' },
      { texte: "if (password_verify($password, $user['password'])) {", cote: 'avant' },
      { texte: "if ($user && password_verify($password, $user['password'])) {", cote: 'apres' },
      { texte: '    $_SESSION["user"] = [' },
      { texte: '        "iduser" => $user["iduser"],', cote: 'avant' },
      { texte: '        "email" => $user["email"]', cote: 'avant' },
      { texte: '        "iduser" => $user["id"],', cote: 'apres' },
      { texte: '        "email" => $user["email"],', cote: 'apres' },
      { texte: '        "role" => $user["role"]', cote: 'apres' },
      { texte: '    ];' },
      { texte: '    header("location:index.php");' },
      { texte: '    exit;', cote: 'apres' },
      { texte: '} else {' },
      { texte: '    echo "La connexion a échoué !";' },
      { texte: '}' },
    ],
    notes: [
      "Si l'email n'existe pas, $user vaut false : il est vérifié avant password_verify.",
      'Le rôle est gardé en session, pour réserver les modifications aux administrateurs.',
      'exit après la redirection : le script s’arrête vraiment.',
    ],
  },
}
