const request = require('supertest')
const { app } = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const { articleData, commentData, topicData, userData } = require('../db/data/test-data')
const fs = require('fs').promises;

beforeEach(() => seed({ articleData, commentData, topicData, userData }));
afterAll(() => db.end())

describe('App', () => {
  describe('GET /api/topics', () => {
    test('GET:200 should return an array of topics with the correct length', () => {
      return request(app)
      .get('/api/topics')
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(body.topics).toBeInstanceOf(Array)
        expect(body.topics.length).toBe(3)
      })
    });

    test('each item in the returned array should be an object with a slug and description property', () => {
      return request(app)
      .get('/api/topics')
      .expect(200)
      .then((response) => {
        const body = response.body
        body.topics.forEach((topic) => {
          expect(typeof topic.description).toBe('string')
          expect(typeof topic.slug).toBe('string')
        })
      })
    });
  })

  describe('GET /api', () => {
    test('GET:200 should respond with an object describing all of the available endpoints', () => {
      const endpoints = require('../endpoints.json');
      return request(app)
      .get('/api')
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(body.endpoints).toBeInstanceOf(Object)
        expect(typeof body.endpoints["GET /api/articles"]["description"]).toBe('string');
        expect(body.endpoints["GET /api/articles"]["queries"]).toBeInstanceOf(Array);
        expect(body.endpoints["GET /api/articles"]["exampleResponse"]).toBeInstanceOf(Object);
      })
    });

    test('object returned by GET /api should be identical to the contents of the endpoints.json file', () => {
      const endpoints = require('../endpoints.json');
      return request(app)
      .get('/api')
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(body.endpoints).toEqual(endpoints);
      })
    });
  });

  describe('GET /api/articles/:article_id', () => {
    test('should return a status code of 200 and the correct article', () => {
      return request(app)
      .get('/api/articles/3')
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(typeof body.article.author).toBe('string')
        expect(typeof body.article.title).toBe('string')
        expect(body.article.article_id).toBe(3)
        expect(typeof body.article.topic).toBe('string')
        expect(typeof body.article.created_at).toBe('string')
        expect(typeof body.article.votes).toBe('number')
        expect(typeof body.article.article_img_url).toBe('string')
        expect(typeof body.article.body).toBe('string')
      })
    });

    test('should return 400: bad request if passed an article id that is not a number', () => {
      return request(app)
      .get('/api/articles/not-an-article')
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      });
    });

    test('should return 404: not found if passed an article id that is an id not found in the database', () => {
      return request(app)
      .get('/api/articles/999999999')
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });
  });

  describe('GET /api/articles', () => {
    test('should return an array of article objects, each with the correct properties', () => {
      return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeInstanceOf(Array);
        body.articles.forEach((article) => {
          expect(typeof article.author).toBe('string')
          expect(typeof article.title).toBe('string')
          expect(typeof article.article_id).toBe('number')
          expect(typeof article.topic).toBe('string')
          expect(typeof article.created_at).toBe('string')
          expect(typeof article.votes).toBe('number')
          expect(typeof article.article_img_url).toBe('string')
          expect(typeof article.comment_count).toBe('number')
        })
      })
    });

    test('none of the objects in the array should have a body property', () => {
      return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const body = response.body;
        body.articles.forEach((article) => {
          expect(article.hasOwnProperty('body')).toBe(false)
        })
      })
    });

    test('articles should be sorted by date in descending order', () => {
      return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeSortedBy('created_at', {
          descending: true
        });
      })
    });
  });

  describe('Get /api/articles/:article_id/comments', () => {
    test('should return an array of comment objects with the given article id', () => {
      return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.comments).toBeInstanceOf(Array)
        expect(body.comments.length).toBe(11)
      })
    });

    test('each comment should have the correct properties', () => {
      return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
        const body = response.body;
        body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe('number')
          expect(typeof comment.votes).toBe('number')
          expect(typeof comment.created_at).toBe('string')
          expect(typeof comment.author).toBe('string')
          expect(typeof comment.body).toBe('string')
          expect(comment.article_id).toBe(1)
        })
      })
    });

    test('comments should be served in order of most recent first', () => {
      return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.comments).toBeSortedBy('created_at', {
          descending: true
        })
      })
    });

    test('should return 400: bad request if passed an article id that is not a number', () => {
      return request(app)
      .get('/api/articles/not-an-article/comments')
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      });
    });

    test('should return 404: not found if passed an article id that is an id not found in the database', () => {
      return request(app)
      .get('/api/articles/999999999/comments')
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });
  });

  describe('Post /api/articles/:article_id/comments', () => {
    test('should respond with status: 201 and the posted comment after being given a new comment', () => {
      const requestBody = {
        username: 'butter_bridge',
        body: 'This is a new comment'
      }
      return request(app)
      .post('/api/articles/1/comments')
      .send(requestBody)
      .expect(201)
      .then((response) => {
        const body = response.body
        expect(typeof body.comment.comment_id).toBe('number')
        expect(body.comment.body).toBe('This is a new comment')
        expect(typeof body.comment.votes).toBe('number')
        expect(body.comment.author).toBe('butter_bridge')
        expect(body.comment.article_id).toBe(1)
        expect(typeof body.comment.created_at).toBe('string')
      })
    });

    test('missing keys on post object should return status: 400', () => {
      const requestBody = {
        body: 'This is a new comment'
      }
      return request(app)
      .post('/api/articles/1/comments')
      .send(requestBody)
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      })
    });

    test('should return 400: bad request if passed an article id that is not a number', () => {
      return request(app)
      .post('/api/articles/not-an-article/comments')
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      });
    });
    
    // need to add a test here for if passed an article id that does not exists (eg. post /api/articles/99999999/comments), can't figure out right now so will come back to this later
  });
})