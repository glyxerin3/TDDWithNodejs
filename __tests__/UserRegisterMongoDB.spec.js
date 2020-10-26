require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/model/user.model');

const {connect, disconnect} = require('../src/utils/Mongoose');

const REGISTER_ENDPOINT_MONGODB = '/api/1.0/mongodb/users';

const validUser = {
  username: 'user1mongo',
  email: 'user1@gmail.com',
  password: 'password'
};

const postUser = (user = validUser) => {
  return request(app).post(REGISTER_ENDPOINT_MONGODB)
    .send(user);
};

describe('User Registration MongoDB', () => {

  const MONGODB_TEST_DATABASE_URL = 'mongodb://localhost:27017/hoax-app_test';
  
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
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves the user to database', async () => {
    await postUser();
    const userList = await UserModel.find();
    expect(userList.length).toBe(1);
  });

  it('saves username and email to database', async () => {
    await postUser();
    const userList = await UserModel.find();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1mongo');
    expect(savedUser.email).toBe('user1@gmail.com');
  });

  it('hashes the password in database', async () => {
    await postUser();
    const userList = await UserModel.find();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1mongo');
    expect(savedUser.password).not.toBe('password');
  });

  it('returns 400 when username is null', async () => {
    const response = await postUser(
      {
        username: null,
        email: 'user1@gmail.com',
        password: 'password'
      }
    );

    expect(response.status).toBe(400);
  });

  it('returns validationErros field in response body when validation error occurs', async () => {
    const response = await postUser(
      {
        username: null,
        email: 'user1@gmail.com',
        password: 'password'
      }
    );
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it.each(
    [
      ['username', 'Username cannot be null'],
      ['email', 'Email cannot be null'],
      ['password', 'Password cannot be null']
    ]
  )('when %s is null %s is received', async (field, expectedMessage) => {
    const user = {
      username: 'user1mongo',
      email: 'user1@gmail.com',
      password: 'password'
    };
    user[field] = null;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('returns erros for both when username and email is null', async () => {
    const response = await postUser(
      {
        username: null,
        email: null,
        password: 'password'
      }
    );
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

});


