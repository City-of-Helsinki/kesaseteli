import nock from 'nock';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { BackendEndpoint, getBackendDomain } from 'tet/admin/backend-api/backend-api';
import { TetEvent, TetEvents } from 'tet-shared/types/linkedevents';

const fakeObjectFactory = new FakeObjectFactory();

// disable unnecessary axios' expected error messages
// https://stackoverflow.com/questions/44467657/jest-better-way-to-disable-console-inside-unit-tests
let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  consoleSpy?.mockRestore();
});

afterEach(async () => {
  // avoid situation where some request is still pending but test is completed
  await waitForBackendRequestsToComplete();
  // Check that all nocks are used: https://michaelheap.com/nock-all-mocks-used/
  if (!nock.isDone()) {
    throw new Error(`Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`);
  }
  nock.cleanAll();
});

nock.disableNetConnect();

export const expectAuthorizedReply = (expectedUser = fakeObjectFactory.fakeUser()): nock.Scope =>
  nock(getBackendDomain()).get(BackendEndpoint.USER).reply(200, expectedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectUnauthorizedReply = (): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain()).get(BackendEndpoint.USER).replyWithError('401 Unauthorized');
};

export const expectToGetEventsFromBackend = (events: TetEvents): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.TET_POSTINGS}`)
    .reply(200, events, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetSingleEventFromBackend = (event: TetEvent): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.TET_POSTINGS}${event.id}`)
    .reply(200, event, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetEventssErrorFromBackend = (errorCode: 400 | 404 | 500): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(BackendEndpoint.TET_POSTINGS)
    .reply(errorCode, 'This is a event list backend test error. Please ignore this error message.');
};

export const expectPlacesFromLinkedEvents = (): nock.Scope =>
  nock('https://linkedevents.api.test.hel.ninja/v1')
    .get('/place/?show_all_places=true&nocache=true&text=')
    .reply(
      200,
      {
        data: [],
        meta: { count: 0 },
      },
      { 'Access-Control-Allow-Origin': '*' },
    );

export const expectKeyWordsFromLinkedEvents = (): nock.Scope =>
  nock('https://linkedevents.api.test.hel.ninja/v1')
    .get('/keyword')
    .reply(
      200,
      {
        data: [],
        meta: {
          count: 1,
        },
      },
      { 'Access-Control-Allow-Origin': '*' },
    );

// TODO don't hardcode url
// this is needed when testing the Editor form and can be refactored then
export const expectWorkingMethodsFromLinkedEvents = (): nock.Scope =>
  nock('https://linkedevents.api.test.hel.ninja/v1')
    .get('/keyword_set/tet:wm/?include=keywords')
    .reply(
      200,
      {
        keywords: [
          {
            '@id': 'https://linkedevents.api.test.hel.ninja/v1/keyword/tet:4/',
            name: {
              fi: 'Tee oikeita töitä',
            },
          },
        ],
      },
      { 'Access-Control-Allow-Origin': '*' },
    );

// TODO don't hardcode url
// this is needed when testing the Editor form and can be refactored then
export const expectAttributesFromLinkedEvents = (): nock.Scope =>
  nock('https://linkedevents.api.test.hel.ninja/v1')
    .get('/keyword_set/tet:attr/?include=keywords')
    .reply(
      200,
      {
        keywords: [
          {
            '@id': 'https://linkedevents.api.test.hel.ninja/v1/keyword/tet:1/',
            name: {
              fi: 'Soveltuu näkövammaisille',
            },
          },
        ],
      },
      { 'Access-Control-Allow-Origin': '*' },
    );
