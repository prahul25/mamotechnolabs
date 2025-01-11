import mongoose from "mongoose";

const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection.asPromise();
  console.log(process.env.MONGO_URI ,"d")
  return mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  });
};

export default connectMongo;
