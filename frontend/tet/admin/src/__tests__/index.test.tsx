import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { waitForLoadingCompleted } from 'shared/__tests__/utils/component.utils';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import {
  expectAttributesFromLinkedEvents,
  expectAuthorizedReply,
  expectToGetEventsFromBackend,
  expectUnauthorizedReply,
  expectWorkingMethodsFromLinkedEvents,
} from 'tet/admin/__tests__/utils/backend/backend-nocks';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import renderPage from 'tet/admin/__tests__/utils/components/render-page';
import IndexPage from 'tet/admin/pages';
import { fakeEventListAdmin } from 'tet-shared/__tests__/utils/fake-objects';

describe('frontend/tet/admin/src/pages/index.tsx', () => {
  it('should have no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<IndexPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(IndexPage, { push: spyPush });
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(
        `${DEFAULT_LANGUAGE}/login?sessionExpired=true`,
        undefined,
        { shallow: false }
      )
    );
  });

  describe('when authorized', () => {
    it('should show TET postings from backend', async () => {
      expectAuthorizedReply();
      expectToGetEventsFromBackend(fakeEventListAdmin([], [], []));
      expectWorkingMethodsFromLinkedEvents();
      expectAttributesFromLinkedEvents();

      renderPage(IndexPage);
      await waitForLoadingCompleted();
      await screen.findByText(/Sinulla ei ole vielä yhtään TET-paikkaa/);
    });
  });
});
