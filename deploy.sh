set -e

print_usage_and_exit () {
    echo 'Usage: ./deploy.sh --clear-data=yes|no --restore-metadata=yes|no HOST VERSION'
    echo "  --clear-data must have a value of 'yes' or 'no' set e.g. --clear-data=yes"
    echo "  --restore-metadata must have a value of 'yes' or 'no' set e.g. --restore-metadata=yes"
    echo '  HOST    is the server to deploy to'
    echo "  VERSION can be any docker image tag or 'latest'"
    exit 1
}


if [ -z "$1" ] || { [ $1 != '--clear-data=no' ] && [ $1 != '--clear-data=yes' ] ;} ; then
    echo 'Error: Argument --clear-data is required in postition 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] || { [ $2 != '--restore-metadata=no' ] && [ $2 != '--restore-metadata=yes' ] ;} ; then
    echo 'Error: Argument --restore-metadata is required in postition 2.'
    print_usage_and_exit
fi

if [ -z "$3" ] ; then
    echo 'Error: Argument HOST is required in postition 3.'
    print_usage_and_exit
fi

if [ -z "$4" ] ; then
    echo 'Error: Argument VERSION is required in postition 4.'
    print_usage_and_exit
fi


HOST=$3
VERSION=$4

echo
echo "Deploying version $VERSION to $HOST..."
echo

# Copy all infrastructure files to the server
rsync -rP docker-compose* infrastructure root@$HOST:/tmp/compose/

# Prepare docker-compose.staging.yml file - rotate secrets etc
ssh root@$HOST '/tmp/compose/infrastructure/rotate-secrets.sh /tmp/compose/docker-compose.staging.yml | tee -a /var/log/rotate-secrets.log'

# Setup configuration files and compose file for the deployment domain
ssh root@$HOST '/tmp/compose/infrastructure/setup-deploy-config.sh '$HOST' | tee -a /var/log/setup-deploy-config.log'

# Deploy the OpenCRVS stack onto the swarm
ssh root@$HOST 'cd /tmp/compose && VERSION='$VERSION' docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.staging.yml --with-registry-auth opencrvs'

if [ $1 == "--clear-data=yes" ] || [ $2 == "--restore-metadata=yes" ] ; then
    echo
    echo "Waiting 2 mins for stack to deploy before working with data..."
    echo
    sleep 120
fi

if [ $1 == "--clear-data=yes" ] ; then
    echo
    echo "Clearing all existing data..."
    echo
    ssh root@$HOST '/tmp/compose/infrastructure/clear-all-data.sh'
fi

if [ $2 == "--restore-metadata=yes" ] ; then
    echo
    echo "Restoring metadata..."
    echo
    ssh root@$HOST '/tmp/compose/infrastructure/restore-metadata.sh'
fi
