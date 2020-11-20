const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
const SMTPServer = require('smtp-server').SMTPServer;

let lastMail, server;
let simulateSmtpFailure = false;

beforeAll(async () => {

  server = new SMTPServer({
    authOptional: true,
    onData: (stream, session, callback) => {
      stream.pipe(process.stdout); // print message to console

      let mailBody;
      stream.on('data', (data) => {
        mailBody = data.toString();
      });
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const err = new Error('Invalid mailbox');
          err.responseCode = 553;
          return callback(err);
        }
        lastMail = mailBody;
        callback();
      });
    }
  });
  await server.listen(7587, 'localhost');
  return sequelize.sync();
});

beforeEach(async () => {

  simulateSmtpFailure = false;

  return User.destroy({ truncate: true });
});

afterEach(async () => {
});

afterAll(async () => {
  await server.close();
});

const validUser = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'P4ssword'
};

const postUser = (user = validUser, options = { language: 'en' }) => {
  const agent = request(app).post('/api/1.0/users');

  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  return agent.send(user);
};

describe('User Registration', () => {

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
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('saves username and email to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');
  });

  it('hashes the password in database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
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
  `('returns $expectedMessage when $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
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

  it(`returns ${email_inuse} when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it('returns errors for both username is null and email is in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser(
      {
        username: null,
        email: null,
        password: 'P4ssword'
      }
    );
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it('creates user in incative mode', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it('creates user in incative mode even the request body contains inactive as false', async () => {
    const newUser = { ...validUser, inactive: false };
    await postUser(newUser);
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it('creates an activationToken for user', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();
  });

  it('sends an Account activation email with activationToken', async () => {
    await postUser();

    //const lastMail = nodemailerstub.interactsWithMail.lastMail();

    const users = await User.findAll();
    const savedUser = users[0];

    expect(lastMail).toContain('Token is');
    expect(lastMail).toContain(savedUser.activationToken);
  });

  it('returns 502 Bad Gateway when sending email fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.status).toBe(502);
  });

  it('returns Email failure message when sending email fails', async () => {
    simulateSmtpFailure = true;
    const response = await postUser();
    expect(response.body.message).toBe('Failed to deliver email');
  });

  it('does not save user to database if activation email fails', async () => {
    simulateSmtpFailure = true;
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(0);
  });
});

describe(`Internationalisation`, () => {
  const username_null = 'Username kann nicht null sein';
  const username_size = 'Muss zwischen 4 und 32 Zeichen haben';
  const email_null = 'Email kann nicht null sein';
  const email_invalid = 'Email ist nicht korrekt';
  const password_null = 'Password kann nicht null sein';
  const password_size = 'Password muss mindestens 6 Zeichen lang sein';
  const password_pattern = 'Password muss mindestens aus 1 Kleinbuchstaben, 1 Grossbuchstaben und 1 Zahl bestehen';
  const email_inuse = 'E-mail wird bereits verwendet';
  const user_create_success = 'User wurde erstellt';
  const email_failure = 'E-mail fehlgeschlagen';


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
  `('returns $expectedMessage when $field is $value when language is set as german', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@gmail.com',
      password: 'password'
    };
    user[field] = value;
    const response = await postUser(user, { language: 'de' });
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it(`returns ${email_inuse} when same email is already in use when language is set as german`, async () => {
    await User.create({ ...validUser });
    const response = await postUser({ ...validUser }, { language: 'de' });
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it(`returns success message of ${user_create_success} when signup request is valid and language is set as german`, async () => {
    const response = await postUser({ ...validUser }, { language: 'de' });
    expect(response.body.message).toBe(user_create_success);
  });

  it(`returns ${email_failure} message when sending email fails`, async () => {
    simulateSmtpFailure = true;
    const response = await postUser({ ...validUser }, { language: 'de' });
    expect(response.body.message).toBe(email_failure);
  });
});

