const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')

describe.only('bookmarks endpoints', ()=>{
    let db;

    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
    
    // afterEach('clean the table', () => db('bookmarks').truncate());
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('bookmarks').truncate())

    const testBookmarks = [
        {id: 1, title:'Yahoo',url:'https://www.yahoo.com', description:'lorem ispum', rating:5 },
        {id: 2, title:'Google',url:'https://www.google.com', description:'search engine', rating:5 },
        {id: 3, title:'Youtube',url:'https://www.youtube.com', description:'sharing video platfrom', rating:5 }
    ]

    beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('GET /bookmarks',()=>{
        return supertest(app)
            .get('/bookmarks')
            .expect(200, testBookmarks)
      })
})