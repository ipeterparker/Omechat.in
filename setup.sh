#!/data/data/com.termux/files/usr/bin/bash
# Omechat setup: refreshes ~/omechat-codes from ~/nextproject. Brand stays Omechat, deer becomes bear.
set -e
SRC="$HOME/nextproject"
DST="$HOME/omechat-codes"

[ -d "$SRC" ] || { echo "~/nextproject nahi mila"; exit 1; }
cd "$SRC"
echo "1/5 purani files copy ho rahi hain (naya code overwrite nahi hoga)..."
for f in * .[!.]*; do
  case "$f" in node_modules|.next|.git) continue ;; esac
  cp -rn "$f" "$DST"/ 2>/dev/null || true
done

cd "$DST"
echo "2/5 purani deer files hata raha hu..."
find . -type f -iname '*deer*' -print -delete

echo "3/5 naam: Omechat rahega, deer -> bear..."
find . \( -path ./node_modules -o -path ./.next \) -prune -o -type f \
  \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.md' -o -name '*.html' -o -name '*.svg' -o -name '*.json' \) \
  ! -name 'package-lock.json' -print0 \
  | xargs -0 sed -i -E 's/Bear\xc2\xa0chat/Omechat/g; s/Bear chat/Omechat/g; s/\bomechat\b/omechat/g; s/Deer/Bear/g; s/deer/bear/g'

echo "4/5 file/folder ke naam theek kar raha hu..."
find . -depth -iname '*omechat*' -print | while read -r p; do
  d=$(dirname "$p"); b=$(basename "$p")
  new="$d/$(echo "$b" | sed 's/omechat/omechat/g; s/Omechat/Omechat/g')"
  if [ -e "$new" ]; then cp -rn "$p"/. "$new"/ 2>/dev/null || true; rm -rf "$p"; else mv "$p" "$new"; fi
done

echo "5/5 node_modules jod raha hu..."
ln -sfn "$SRC/node_modules" "$DST/node_modules"

echo
echo "Ho gaya! Ab chalao:"
echo "  cd ~/omechat-codes && npm run dev -- --webpack"
