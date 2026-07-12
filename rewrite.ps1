git config user.email "lalit-ld43@users.noreply.github.com"
git add apps/api/src/controllers/verify.controller.ts
git commit -m "Fix Prettier formatting in verify.controller.ts"

git filter-branch -f --env-filter "
if test `"`$GIT_AUTHOR_EMAIL`" = `"lalit-ld43@example.com`"
then
    export GIT_AUTHOR_NAME=`"lalit-ld43`"
    export GIT_AUTHOR_EMAIL=`"lalit-ld43@users.noreply.github.com`"
fi
if test `"`$GIT_COMMITTER_EMAIL`" = `"lalit-ld43@example.com`"
then
    export GIT_COMMITTER_NAME=`"lalit-ld43`"
    export GIT_COMMITTER_EMAIL=`"lalit-ld43@users.noreply.github.com`"
fi
" --tag-name-filter cat -- --branches --tags

git push --force
