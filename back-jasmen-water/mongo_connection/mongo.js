const mongo = require("mongoose");

const connection_local = "mongodb://127.0.0.1:27018/water-App"

const connection_vps = "mongodb://127.0.0.1:27017/water-App"

mongo.connect(process.env.NODE_ENV === 'production' ? connection_vps : connection_local)
  .then(() => {
    console.log("connected mongoose successfull");
  }).catch((error) => console.log(error));
  
