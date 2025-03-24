git reset --hard
git pull

docker build -t pca-submit-tool .
docker rm pca-submit-tool
docker run --network=host -d --name pca-submit-tool -p 3000:3000 --env-file .env pca-submit-tool