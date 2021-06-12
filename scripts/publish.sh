#!/usr/bin/env bash
SCRIPTDIR=`cd $(dirname "$0"); pwd`

branch_name=$(git symbolic-ref -q HEAD)
branch_name=${branch_name##refs/heads/}
branch_name=${branch_name:-HEAD}

docker build -t wegbereiter/con-anmeldung:$branch_name . && docker push wegbereiter/con-anmeldung:$branch_name