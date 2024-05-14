import express from 'express';
import mongoose from 'mongoose';
import router from './routes/route.js';
import cors from 'cors'
const app = express();


mongoose.connect('mongodb+srv://jocky0909:Rushi123@cluster0.bse6isd.mongodb.net/', { useNewUrlParser: true })
.then(() => console.log('connected to MongoDB'))
 .catch((err) => console.log(err));
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(cors())
app.use(express.json())

app.use(router)
app.listen(4000, () => {
  console.log('app listening on port 4000!');
});