docker rm -f explorer
docker run -d -p 3000:3000 --restart=always --name explorer explorer