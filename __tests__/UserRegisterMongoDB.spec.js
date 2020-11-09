require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/model/user.model');

const {connect, disconnect} = require('../src/utils/Mongoose');

const REGISTER_ENDPOINT_MONGODB = '/api/1.0/mongodb/users';

const validUser = {
  username: 'user1mongo',
  email: 'user1@gmail.com',
  password: 'P4ssword'
};

const postUser = (user = validUser, options = {language: 'en'}) => {
  const agent = request(app).post(REGISTER_ENDPOINT_MONGODB);

  if (options.language) {
    agent.set('Accept-Language', options.language)
  }

  return agent.send(user);
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
    expect(response.body.message).toBe(user_create_success);
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

  const username_null = 'Username cannot be null';
  const username_size = 'Must have min 4 and max 32 characters';
  const email_null = 'Email cannot be null';
  const email_invalid = 'Email is not valid';
  const password_null = 'Password cannot be null';
  const password_size = 'Password must be at least 6 characters';
  const password_pattern = 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number';
  const email_inuse = 'E-mail in use';
  const user_create_success = 'User created';

  it.each`
    field         | value                     | expectedMessage
    ${'username'} | ${null}                   | ${username_null}
    ${'username'} | ${'usr'}                  | ${username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size}
    ${'email'}    | ${null}                   | ${email_null}
    ${'email'}    | ${'mail.com'}             | ${email_invalid}
    ${'email'}    | ${'user.mail.com'}        | ${email_invalid}
    ${'email'}    | ${'user@mail'}            | ${email_invalid}
    ${'password'} | ${null}                   | ${password_null}
    ${'password'} | ${'pass'}                 | ${password_size}
    ${'password'} | ${'alllowercase'}         | ${password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}         | ${password_pattern}
    ${'password'} | ${'1234567890'}           | ${password_pattern}
    ${'password'} | ${'lowerandUPPER'}        | ${password_pattern}
    ${'password'} | ${'lower4nd23423'}        | ${password_pattern}
    ${'password'} | ${'UPPER423423'}          | ${password_pattern}
      `('returns $expectedMessage when $field is $value', async ({field, expectedMessage, value}) => {
    const user = {
      username: 'user1mongo',
      email: 'user1@gmail.com',
      password: 'password'
    };
    user[field] = value;
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
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email', 'password']);
  });

  it('returns E-mail in use when same email is already in use', async () => {
    await UserModel.create({ ...validUser});
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

});

describe(`Internationalisation`, () => {
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

  const username_null = 'Username kann nicht null sein';
  const username_size = 'Muss zwischen 4 und 32 Zeichen haben';
  const email_null = 'Email kann nicht null sein';
  const email_invalid = 'Email ist nicht korrekt';
  const password_null = 'Password kann nicht null sein';
  const password_size = 'Password muss mindestens 6 Zeichen lang sein';
  const password_pattern = 'Password muss mindestens aus 1 Kleinbuchstaben, 1 Grossbuchstaben und 1 Zahl bestehen';
  const email_inuse = 'E-mail wird bereits verwendet';
  const user_create_success = 'User wurde erstellt';

  it.each`
    field         | value                     | expectedMessage
    ${'username'} | ${null}                   | ${username_null}
    ${'username'} | ${'usr'}                  | ${username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${username_size}
    ${'email'}    | ${null}                   | ${email_null}
    ${'email'}    | ${'mail.com'}             | ${email_invalid}
    ${'email'}    | ${'user.mail.com'}        | ${email_invalid}
    ${'email'}    | ${'user@mail'}            | ${email_invalid}
    ${'password'} | ${null}                   | ${password_null}
    ${'password'} | ${'pass'}                 | ${password_size}
    ${'password'} | ${'alllowercase'}         | ${password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}         | ${password_pattern}
    ${'password'} | ${'1234567890'}           | ${password_pattern}
    ${'password'} | ${'lowerandUPPER'}        | ${password_pattern}
    ${'password'} | ${'lower4nd23423'}        | ${password_pattern}
    ${'password'} | ${'UPPER423423'}          | ${password_pattern}
  `('returns $expectedMessage when $field is $value when language is set as german', async ({field, expectedMessage, value}) => {
    const user = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'password'
    };
    user[field] = value;
    const response = await postUser(user, {language: 'de'});
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it(`returns ${email_inuse} when same email is already in use when language is set as german`, async () => {
    await UserModel.create({ ...validUser});
    const response = await postUser({ ...validUser}, {language: 'de'});
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it(`returns success message of ${user_create_success} when signup request is valid and language is set as german`, async () => {
    const response = await postUser({ ...validUser}, {language: 'de'});
    expect(response.body.message).toBe(user_create_success);
  });
});
