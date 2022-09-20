# Social App
Social app clone to wander through the MVC. Not the most original layout thus far and Bootstrapped, but will be trying some different things after functionality is in.

Includes user authentication, post/comment attribution, unique likes, etc.

## Progress
Building on the OG codebase.

**Unique likes per user** (although you can still like your own posts) + **Comments with attribution**

![unique_likes](https://user-images.githubusercontent.com/102257735/191148698-8ee8d7ec-30e7-48e1-ab4d-d2ce36cbfaa9.png)

**Like posts from the feed**
![likes_from_feed](https://user-images.githubusercontent.com/102257735/191158045-f596a384-080c-432d-9b8a-4a8e12440174.png)


**DONE**
- Update multer config to accept GIFs.
- Post Likes are not scoped to unique user. _Approach:_
    - Need array in schema
    - when like is updated, check if user id is in array. If not, push user id into array and increment like. If yes, remove user id from array and decrement like.
- Format "user has liked" and "user has not liked" differently.
- Each comment has user attribution.
- Make it possible to like a post from the feed view: 
  - Troubleshooting: The same conditionals and even others that worked previously/elsewhere (getPost) was not working for getFeed. Source: .lean() was stripping out some matching logic from the docs being returned. Once removed, conditionals worked partially.
  - Proceeding with the working logic (.includes), but leaving comments for future test (controllers/posts.js, for getFeed()).

**On deck**
- Make it possible to like comments.
- Make it possible to sort posts in feed by recency, popularity (number of likes), personal favorites (liked by viewer), etc.
- Make it possible for commenter to delete their own comments.
- Make it possible to respond to comments - possibly format differently.
- Make it visually acceptable (and consider deviating wildly from Instagram design).

**Stretch goals**
- Try a very different visual approach. Need to decide on mobile and desktop experience.
- Let users apply filters and format variations (skins/themes) to images in their entire feed (selective class).
- Let users apply filters and edits to their image on upload (the more standard Instagram function). _Cloudinary functionality._

## Learnings
With each update, my workflow has generally been in Model => Controller => View order as well. 
- Keep test entries to a minimum since sometimes the schema has to change. 
- Remember that new doc creation also needs to have a default value (even if empty) for new fields. Otherwise, next queries result in errors. Mongoose/Mongo and EJS handles falsy a little strangely (if field does not exist in the doc, all rendering fails, rather than proceeding with assumed "false").
- Current methods iterate over the arrays and are inefficient - as evidenced by the delayed response to likes and redirections.

## Setup 
**Install**

`npm install`

---

**Things to add**

- Create a `.env` file in config folder and add the following as `key = value`
  - PORT = 2121 (can be any port example: 3000)
  - DB_STRING = `your database URI`
  - CLOUD_NAME = `your cloudinary cloud name`
  - API_KEY = `your cloudinary api key`
  - API_SECRET = `your cloudinary api secret`

---

**Run**

`npm start`
