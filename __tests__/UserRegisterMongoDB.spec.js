const request = require('supertest');
const app = require('../src/app');
require('dotenv').config();
const UserModel = require('../src/model/user.model');

const {connect, disconnect} = require('../src/utils/Mongoose');

describe('User Registration MongoDB', () => {
  const REGISTER_ENDPOINT_MONGODB = '/api/1.0/mongodb/users';

  beforeAll(async () => {
    await connect(process.env.MONGODB_TEST_DATABASE_URL);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await disconnect();
  });

  it('returns 200 OK when signup request is valid', (done) => {
    request(app).post(REGISTER_ENDPOINT_MONGODB)
      .send(
        {
          username: 'user1mongo',
          email: 'user1@gmail.com',
          password: 'password'
        }
      ).then((response) => {
      expect(response.status).toBe(200);
      done();
    })
  });

  it('returns success message when signup request is valid', (done) => {
    request(app).post(REGISTER_ENDPOINT_MONGODB)
      .send(
        {
          username: 'user1mongo',
          email: 'user1@gmail.com',
          password: 'password'
        }
      ).then((response) => {
      expect(response.body.message).toBe('User created');
      done();
    })
  });

  it('saves the user to database', (done) => {
    request(app).post(REGISTER_ENDPOINT_MONGODB)
      .send(
        {
          username: 'user1mongo',
          email: 'user1@gmail.com',
          password: 'password'
        }
      ).then(() => {
      //query user table
      UserModel.find().then((userList) => {
        expect(userList.length).toBe(1);
        done();
      });
    })
  });

  it('saves username and email to database', (done) => {
    request(app).post(REGISTER_ENDPOINT_MONGODB)
      .send(
        {
          username: 'user1mongo',
          email: 'user1@gmail.com',
          password: 'password'
        }
      ).then(() => {
      //query user table
      UserModel.find().then((userList) => {
        const savedUser = userList[0];
        expect(savedUser.username).toBe('user1mongo');
        expect(savedUser.email).toBe('user1@gmail.com');
        done();
      });
    })
  });
});


