import { addData } from '../models/data-model.js';


export async function data(req, res) {
  const { content } = req.body
  const user_id = req.user.id

  await addData(user_id, content);

  res.status(200).json({ message: `Data entered into the database!`})
}
