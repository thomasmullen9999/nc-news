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
        expect(body.article).toEqual({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
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
})