


# cd ../network/
# ./teardown.sh
# cd ../app/
# ./startFabric.sh
# npm install
# node enrollAdmin
# node registerUser
# node server

./startFabric.sh
cd ../app/
npm install

cd wallet/
# rm admin.id
# rm user1.id
rm *.id
echo
echo "Removed Old Wallet IDs "
echo
cd ..

node enrollAdmin
node registerUser
node server


# ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
# ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'

# ipfs daemon
