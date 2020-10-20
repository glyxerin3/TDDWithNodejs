require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/model/user.model');

const {connect, disconnect} = require('../src/utils/Mongoose');

describe('User Registration MongoDB', () => {
  const REGISTER_ENDPOINT_MONGODB = '/api/1.0/mongodb/users';
  const MONGODB_TEST_DATABASE_URL = 'mongodb://localhost:27017/hoax-app_test';

  const postValidUser = async () => {
    return request(app).post(REGISTER_ENDPOINT_MONGODB)
      .send(
        {
          username: 'user1mongo',
          email: 'user1@gmail.com',
          password: 'password'
        }
      );
  };

  beforeAll(async () => {
    await connect(MONGODB_TEST_DATABASE_URL);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await disconnect();
  });

  it('returns 200 OK when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves the user to database', async () => {
    await postValidUser();
    const userList = await UserModel.find();
    expect(userList.length).toBe(1);
  });

  it('saves username and email to database', async () => {
    await postValidUser();
    const userList = await UserModel.find();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1mongo');
    expect(savedUser.email).toBe('user1@gmail.com');
  });

  it('hashes the password in database', async () => {
    await postValidUser();
    const userList = await UserModel.find();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1mongo');
    expect(savedUser.password).not.toBe('password');
  });
});


