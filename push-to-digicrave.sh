#!/bin/bash
# Push script for DigiCraveOS under Lucifer-Newstar profile

cd "$(dirname "$0")"

echo "=== DigiCraveOS Push Script ==="
echo "Remote: $(git remote get-url origin)"
echo "User:   $(git config user.name) <$(git config user.email)>"
echo ""

echo "All commits:"
git log --oneline --all
echo ""

read -p "Push all branches with --force? (y/N): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo "Pushing to https://github.com/Lucifer-Newstar/DigiCraveOS.git ..."
    git push origin --all --force
    echo "Done!"
else
    echo "Push cancelled."
fi
