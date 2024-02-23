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

    test('response should include a comment_count', () => {
      return request(app)
      .get('/api/articles/3')
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(body.article.comment_count).toBe(2)
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
      .get('/api/articles/99')
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });
  });

  describe('GET /api/articles', () => {
    test('should return a status code of 200 with an array of article objects, each with the correct properties', () => {
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
          expect(typeof article.comment_count).toBe('string')
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

    test('when a topic query is added, should filter the articles by the topic value specified in the query and return only articles with this topic', () => {
      return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeInstanceOf(Array);
	      expect(body.articles.length).toBe(12)
        body.articles.forEach((article) => {
	        expect(article.topic).toBe('mitch')
        })
      })
    });

    test('should return 404 not found when the given topic is not found in the database', () => {
      return request(app)
      .get('/api/articles?topic=dogs')
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });

    test('when a sort by query is added, should return the articles sorted by the value of this query, and should default to descending order', () => {
      return request(app)
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeInstanceOf(Array);
	      expect(body.articles.length).toBe(13)
        console.log(body.articles)
        expect(body.articles).toBeSortedBy('title', {
          descending: true
        })
      })
    });

    test('can be passed an order query which will determine the order of the results', () => {
      return request(app)
      .get('/api/articles?sort_by=votes&order=asc')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeInstanceOf(Array);
	      expect(body.articles.length).toBe(13)
        expect(body.articles).toBeSortedBy('votes', {
          ascending: true
        })
      })
    });

    test('sort by, order and topic queries can all be used in conjunction and should return the expected result', () => {
      return request(app)
      .get('/api/articles?topic=mitch&sort_by=author&order=desc')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeInstanceOf(Array);
	      expect(body.articles.length).toBe(12)
        expect(body.articles).toBeSortedBy('author', {
          descending: true
        })
	      body.articles.forEach((article) => {
	        expect(article.topic).toBe('mitch')
        })
      })
    });

    test('if no sort by query is passed in, will default to sorting by created_at', () => {
      return request(app)
      .get('/api/articles?order=asc')
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles).toBeInstanceOf(Array);
	      expect(body.articles.length).toBe(13)
        expect(body.articles).toBeSortedBy('created_at', {
          ascending: true
        })
      })
    });


   test('should return 400 bad request if passed invalid order (not asc or desc)', () => {
      return request(app)
      .get('/api/articles?order=invalid')
      .expect(400)
      .then((response) => {
        const body = response.body;
        expect(body.msg).toBe('Bad request')
      })
    });

   test('should return 400 bad request if passed invalid sort_by)', () => {
      return request(app)
      .get('/api/articles?sort_by=publisher')
      .expect(400)
      .then((response) => {
        const body = response.body;
        expect(body.msg).toBe('Bad request')
      })
    });
  });

  describe('GET /api/articles/:article_id/comments', () => {
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
      .get('/api/articles/99/comments')
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });
  });

  describe('POST /api/articles/:article_id/comments', () => {
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
        expect(body.comment.votes).toBe(0)
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
      const requestBody = {
        username: 'butter_bridge',
        body: 'This is a new comment'
      }
      return request(app)
      .post('/api/articles/not-an-article/comments')
      .send(requestBody)
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      });
    });
    
    test('should return 404: not found if passed an article id that does not exist in the articles table', () => {
      const requestBody = {
        username: 'butter_bridge',
        body: 'This is a new comment'
      }
      return request(app)
      .post('/api/articles/99/comments')
      .send(requestBody)
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });
  });

  describe('PATCH /api/articles/:article_id', () => {
    test('should respond with status code: 200 and the correct article', () => {
      const requestBody = {
        inc_votes: 50
      }
      return request(app)
      .patch('/api/articles/1')
      .send(requestBody)
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(typeof body.article.author).toBe('string')
        expect(typeof body.article.title).toBe('string')
        expect(typeof body.article.article_id).toBe('number')
        expect(typeof body.article.topic).toBe('string')
        expect(typeof body.article.created_at).toBe('string')
        expect(typeof body.article.votes).toBe('number')
        expect(typeof body.article.article_img_url).toBe('string')
        expect(typeof body.article.body).toBe('string')
      });
    });
    
    test('votes property should be updated by the correct amount', () => {
      const requestBody = {
        inc_votes: 50
      }
      return request(app)
      .patch('/api/articles/1')
      .send(requestBody)
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(body.article.votes).toBe(150)
      });
    });

    test('should return 400: bad request if passed an article id that is not a number', () => {
      const requestBody = {
        inc_votes: 50
      }
      return request(app)
      .patch('/api/articles/not-an-article')
      .send(requestBody)
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      });
    });

    test('should return 404: not found if passed an article id that is an id not found in the database', () => {
      const requestBody = {
        inc_votes: 50
      }
      return request(app)
      .patch('/api/articles/99')
      .send(requestBody)
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });

    test('missing keys on request object should return status: 400', () => {
      const requestBody = {}
      return request(app)
      .patch('/api/articles/1')
      .send(requestBody)
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      })
    });
  });

  describe('DELETE /api/comments/:comment_id', () => {
    test('should respond with status code: 204 and remove the given comment from the database', () => {
      return request(app)
      .delete('/api/comments/18')
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({})
        // check that the comment has been removed from the database
        return db.query(`SELECT * FROM comments;`)
        .then((result) => {
          // initially there were 18 comments, should be 1 less now
          expect(result.rowCount).toBe(17)
        })
      })
    });

    test('should return 400: bad request if passed a comment id that is not a number', () => {
      return request(app)
      .delete('/api/comments/not-a-comment')
      .expect(400)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Bad request')
      });
    });

    test('should return 404: not found if passed a comment id that is an id not found in the database', () => {
      return request(app)
      .delete('/api/comments/99')
      .expect(404)
      .then((response) => {
        const body = response.body
        expect(body.msg).toBe('Not found')
      });
    });
  });

  describe('GET /api/users', () => {
    test('GET:200 should return an array of users with the correct length', () => {
      return request(app)
      .get('/api/users')
      .expect(200)
      .then((response) => {
        const body = response.body
        expect(body.users).toBeInstanceOf(Array)
        expect(body.users.length).toBe(4)
      })
    });

    test('each item in the returned array should be an object with a username, name and avatar_url property', () => {
      return request(app)
      .get('/api/users')
      .expect(200)
      .then((response) => {
        const body = response.body
        body.users.forEach((user) => {
          expect(typeof user.username).toBe('string')
          expect(typeof user.name).toBe('string')
          expect(typeof user.avatar_url).toBe('string')
        })
      })
    });
  })
})