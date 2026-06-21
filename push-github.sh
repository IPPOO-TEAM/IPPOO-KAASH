#!/bin/bash
# ============================================================
# IPPOO CASH — Push vers GitHub (IPPOO-TEAM/IPPOO-KAASH)
# Usage : bash push-github.sh
# ============================================================

GITHUB_REPO="https://github.com/IPPOO-TEAM/IPPOO-KAASH.git"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   IPPOO CASH — Push vers GitHub          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Repo cible : $GITHUB_REPO"
echo ""
read -sp "Collez votre token GitHub (ghp_... ou github_pat_...) : " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ Token vide — annulé."
  exit 1
fi

echo ""
echo "⏳ Préparation du commit sans LFS..."

# Dossier temporaire propre
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Copier tout sauf .git et node_modules
for item in $(ls -A /workspaces/default/code); do
  if [ "$item" != ".git" ] && [ "$item" != "node_modules" ]; then
    cp -r "/workspaces/default/code/$item" "$TMPDIR/"
  fi
done

# .gitattributes sans LFS
printf '* text=auto\n' > "$TMPDIR/.gitattributes"

# Init git propre sans LFS
cd "$TMPDIR"
export GIT_LFS_SKIP_SMUDGE=1
git init -q
git config user.email "team@ippoo.app"
git config user.name "IPPOO TEAM"
git config filter.lfs.clean "cat"
git config filter.lfs.smudge "cat"
git config filter.lfs.process ""
git config filter.lfs.required false
git add -A
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
git commit -q -m "IPPOO CASH — MAJ $TIMESTAMP"

LFS_COUNT=$(git lfs ls-files 2>/dev/null | wc -l)
FILE_COUNT=$(git ls-files | wc -l)
echo "✅ $FILE_COUNT fichiers commités, $LFS_COUNT fichier(s) LFS (doit être 0)"

# Push vers GitHub
echo ""
echo "⏳ Envoi vers GitHub..."
git branch -M main
git remote add origin "https://x-access-token:${TOKEN}@${GITHUB_REPO#https://}"
git push -u origin main --force 2>&1 | tail -5

if [ $? -eq 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║   ✅ Push réussi !                        ║"
  echo "║   github.com/IPPOO-TEAM/IPPOO-KAASH      ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo "⚠️  Pensez à révoquer le token après utilisation :"
  echo "    github.com → Settings → Developer settings → Tokens"
else
  echo ""
  echo "❌ Le push a échoué. Vérifiez le token et ses permissions."
fi
