docker stop explorer
docker rm -f explorer
docker rmi explorer
docker build -t explorer .