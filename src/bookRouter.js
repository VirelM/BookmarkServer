const { v4: uuid } = require('uuid');
const bookmarksRouter = require('express').Router();
const xss = require('xss')
const { getBookmarkValidationError } = require('./bookmark-validator')
const BookmarksService = require('./bookmark-service')
const bookmarks = [
    {
        id: "1",
        title: "Yahoo",
        url: "https://www.yahoo.com",
        desc: "lorem ipsum",
        rating: 5
    }
]

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.desc),
    rating: Number(bookmark.rating),
})

bookmarksRouter
    .route('/bookmarks')
    .get((req,res,next)=>{
        
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks=>{
                res.json(bookmarks);
            })
            .catch(next)
        
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const newBookmark = { title, url, description, rating }
    
        for (const field of ['title', 'url', 'rating']) {
          if (!newBookmark[field]) {
            logger.error(`${field} is required`)
            return res.status(400).send({
              error: { message: `'${field}' is required` }
            })
          }
        }
    
        const error = getBookmarkValidationError(newBookmark)
    
        if (error) return res.status(400).send(error)
    
        BookmarksService.insertBookmark(
          req.app.get('db'),
          newBookmark
        )
          .then(bookmark => {
            logger.info(`Bookmark with id ${bookmark.id} created.`)
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `${bookmark.id}`))
              .json(serializeBookmark(bookmark))
          })
          .catch(next)
      })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req,res)=>{
        // res.json(bookmarks);
        const { id } = req.params;
        const bookmark = bookmarks.find(bookmark => bookmark.id === id);

        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Bookmark not found');
        }

        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);
        res
            .status(204)
            .end();
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const bookmarkToUpdate = { title, url, description, rating }
    
        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
          logger.error(`Invalid update without required fields`)
          return res.status(400).json({
            error: {
              message: `Request body must content either 'title', 'url', 'description' or 'rating'`
            }
          })
        }
    
        const error = getBookmarkValidationError(bookmarkToUpdate)
    
        if (error) return res.status(400).send(error)
    
        BookmarksService.updateBookmark(
          req.app.get('db'),
          req.params.bookmark_id,
          bookmarkToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
      })
module.exports = bookmarksRouter;
