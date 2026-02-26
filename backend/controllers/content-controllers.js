import { addContent, getContent } from '../models/content-models.js';

// ADDING CONTENT
// RETRIEVING CONTENT


// INPUT COMES FROM TWO DIFFERENT PLACES:
//   - HEADER: HAS JWT, WHICH NEEDS PROCESSING TO EXTRACT THE USER_ID
//   - BODY:   HAS THE USER'S INPUT

// ADVANCED - NEW
// (added cache details to header
//   - NO STORING anywhere in the route (RE: remember CDNs often store info in caches))

export async function gatherInput(req, res) {
  res.set('Cache-Control', 'no-store')

  const user_id = req.user.id
  const { content } = req.body

  // THIS ADDS THE CONTENT TO SUPABASE (see content-model.js)
  await addContent(user_id, content);

  res.status(200).json({ message: `Content entered into the database!`})
}



// PREPARE THE INPUT FOR THE MODEL

// ADVANCED - NEW
// (added cache details to header
//   - NO STORING anywhere in the route (RE: remember CDNs often store info in caches))

export async function gatherOutput(req, res) {
  res.set('Cache-Control', 'no-store')

  const user_id = req.user.id

  // THIS GETS THE CONTENT FROM SUPABASE (see content-model.js)
  const content = await getContent(user_id);

  res.status(200).json(
    { 
      message: 'Here are your past entries:',
      content: content
    }
  )
}

