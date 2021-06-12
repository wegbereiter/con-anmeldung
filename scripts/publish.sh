#!/usr/bin/env bash
branch_name=$(git symbolic-ref -q HEAD)
branch_name=${branch_name##refs/heads/}
branch_name=${branch_name:-HEAD}
tag=wegbereiter/con-anmeldung:$branch_name

docker build -t $tag . && docker push $tag